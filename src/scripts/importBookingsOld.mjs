// /scripts/importBookings.js
import 'dotenv/config';
import fs from "fs";
import path from "path";
import { createClient } from "@supabase/supabase-js";

// Supabase client
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY // service role key
);

// Load JSON file
const filePath = path.join(process.cwd(), "src", "data", "bookings.json");
const jsonData = JSON.parse(fs.readFileSync(filePath, "utf-8"));

// Map short month to number
const MONTHS = {
    JAN: "01", FEB: "02", MAR: "03", APR: "04",
    MAY: "05", JUN: "06", JUL: "07", AUG: "08",
    SEP: "09", OCT: "10", NOV: "11", DEC: "12"
};

function parseDate(row) {
    // Example: File = "SEP24" → month=SEP, year=2024
    const monthAbbr = row.File.substring(0, 3).toUpperCase();
    const year = "20" + row.File.substring(3); // "24" → 2024
    const month = MONTHS[monthAbbr];
    const day = row.Sheet.padStart(2, "0"); // "05"

    // Combine into full date string
    const dateString = `${year}-${month}-${day}T${row.StartTime}:00`;
    return new Date(dateString);
}

async function importBookings() {
    for (const row of jsonData) {
        try {
            // --- CLIENT ---
            let clientId = null;

            if (row.Name || row.Phone) {
                // Step 1: Try to find by phone (if given)
                let { data: client } = row.Phone
                    ? await supabase
                        .from("clients")
                        .select("id")
                        .eq("phone", row.Phone)
                        .single()
                    : { data: null, error: null };

                // Step 2: If no phone match, try by name
                if (!client && row.Name) {
                    const { data: nameMatch } = await supabase
                        .from("clients")
                        .select("id, phone")
                        .eq("full_name", row.Name)
                        .maybeSingle();

                    // If found someone with same name:
                    if (nameMatch) {
                        client = nameMatch;

                        // Optional: if the stored record has no phone but this row has one → update it
                        if (!nameMatch.phone && row.Phone) {
                            await supabase
                                .from("clients")
                                .update({ phone: row.Phone })
                                .eq("id", nameMatch.id);
                        }
                    }
                }

                // Step 3: If still not found, insert new
                if (!client) {
                    const { data: inserted } = await supabase
                        .from("clients")
                        .insert({
                            full_name: row.Name || null,
                            phone: row.Phone || null,
                        })
                        .select("id")
                        .single();

                    client = inserted;
                }

                clientId = client?.id ?? null;
            }

            // --- SERVICE ---
            // Define JSON → DB name mapping
            const serviceMap = {
                Thai: "Traditional Thai",
                Oil: "Thai Oil",
                Relaxzy: "Relaxzy",
                FL: "Feet & Legs",
                BS: "Back & Shoulders",
                DT: "Deep Tissue",
            };

            // Get the DB service name
            const dbServiceName = serviceMap[row.Massage] || row.Massage;

            // Fetch existing service ID
            const { data: service, error: serviceError } = await supabase
                .from("services")
                .select("id")
                .eq("name", dbServiceName)
                .single();

            if (serviceError) {
                console.error("Service not found:", row.Massage, serviceError);
                throw new Error(`Service mapping failed for: ${row.Massage}`);
            }

            const serviceId = service.id;

            // --- BOOKING ---
            const startDate = parseDate(row);
            const endDate = new Date(startDate.getTime() + row.Duration * 60000);

            const { data: bookingData } = await supabase
                .from('bookings')
                .upsert(
                    [{
                        client_id: clientId,
                        service_id: serviceId,
                        start_time: startDate.toISOString(),
                        end_time: endDate.toISOString(),
                        notes: row.Comments || null,
                        status: "confirmed"
                    }],
                    { onConflict: ['client_id', 'service_id', 'start_time'] }
                )
                .select("*");

            const booking = bookingData[0];
            const bookingId = booking?.id;

            // --- PAYMENT ---

            const cashPayment = Number(row.PaymentT) || 0;
            const cardPayment = Number(row.PaymentE) || 0;
            const cardTip = Number(row.TipE) || 0; // only keep card tips
            // Ignore cash tips completely

            let payments = [];

            // Case 1: Service paid with cash (ignore tips)
            if (cashPayment > 0) {
                payments.push({
                    booking_id: bookingId,
                    amount: cashPayment,
                    method: "cash",
                    paid: true,
                    paid_at: new Date().toISOString(),
                });
            }

            // Case 2: Service paid with card (+ possible card tip)
            if (cardPayment > 0) {
                payments.push({
                    booking_id: bookingId,
                    amount: cardPayment + cardTip, // add tip to service payment
                    method: "credit card",
                    paid: true,
                    paid_at: new Date().toISOString(),
                });
            } else if (cardTip > 0) {
                // Case 3: No card payment but tip exists → record tip as standalone payment
                payments.push({
                    booking_id: bookingId,
                    amount: cardTip,
                    method: "credit card",
                    paid: true,
                    paid_at: new Date().toISOString(),
                });
            }

            // Insert or update each payment
            for (const payment of payments) {
                await supabase
                    .from("payments")
                    .upsert([payment], { onConflict: ["booking_id", "method"] })
                    .select("*");
            }

            console.log(`✅ Imported booking on ${startDate.toISOString()} (${row.Massage})`);
        } catch (err) {
            console.error("❌ Error importing row:", row, err.message);
        }
    }
    console.log("🎉 Import finished!");
}

importBookings();
