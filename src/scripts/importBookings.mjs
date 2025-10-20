// /scripts/importBookings.js
import "dotenv/config";
import fs from "fs";
import path from "path";
import { createClient } from "@supabase/supabase-js";
import { parsePhoneNumberWithError } from "libphonenumber-js";

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
    JAN: "01",
    FEB: "02",
    MAR: "03",
    APR: "04",
    MAY: "05",
    JUN: "06",
    JUL: "07",
    AUG: "08",
    SEP: "09",
    OCT: "10",
    NOV: "11",
    DEC: "12",
};

function parseStartDate(row) {
    const monthAbbr = row.File.substring(0, 3).toUpperCase();
    const year = "20" + row.File.substring(3);
    const month = MONTHS[monthAbbr];
    const day = row.Sheet.padStart(2, "0");
    const dateString = `${year}-${month}-${day}T${row.StartTime}:00`;
    return new Date(dateString);
}

function parseNumber(str) {
    if (!str) return 0;
    return Number(str.toString().replace(",", "."));
}

// Parse duration string like "60*2" → returns { duration: 60, multiplier: 2 }
function parseDuration(durationStr) {
    if (typeof durationStr === "string" && durationStr.includes("*")) {
        const parts = durationStr.split("*").map(Number);
        return { duration: Math.max(...parts), multiplier: parts[1] || 1 };
    }
    return { duration: parseNumber(durationStr), multiplier: 1 };
}

function validatePhone(phone, defaultCountry = "ES") {
    try {
        if (!phone) return null;
        const number = parsePhoneNumberWithError(phone, defaultCountry);
        if (!number || !number.isValid()) {
            throw new Error("Invalid phone number in script validation", phone);
        }
        return number.format("E.164");
    } catch (error) {
        throw new Error(error, phone);
    }



}

async function resolveServiceName(dbServiceName, duration, pricePerPerson) {
    // if service already provided, trust it
    if (dbServiceName && dbServiceName.trim() !== "") {
        console.log("returned literal service name", dbServiceName)
        return dbServiceName;
    }

    // fetch services
    const { data: services, error } = await supabase
        .from("services")
        .select("id, name, standard_duration_prices");

    if (error) {
        console.error("Error fetching services:", error);
        throw new Error("Error fetching services:", error)
    }

    if (!services || services.length === 0) {
        console.warn(
            `No services in DB. Price: ${pricePerPerson}, Duration: ${duration}`
        );
        // fallback default if known case
        if (pricePerPerson === 50 && duration === 60) {
            console.log("Using old Relaxzy Massage")
            return "Relaxzy";
        }
        return null;
    }

    // look for a matching service
    const serviceMatch = services.find((s) => {
        try {
            let arr;
            if (typeof s.standard_duration_prices === "string") {
                arr = JSON.parse(s.standard_duration_prices);
            } else {
                arr = s.standard_duration_prices; // already parsed (array/object)
            }
            console.log(
                `Standard duration prices for ${s.name}:, ${JSON.stringify(arr)}. Looking for duration: ${duration}, pricePerPerson: ${pricePerPerson}`
            );
            const match = arr.some(
                (p) =>
                    Number(p.duration) === Number(duration) &&
                    Number(p.price) === Number(pricePerPerson)
            );
            console.log(`Checking service: ${s.name}`, arr, { duration, pricePerPerson, match });
            return match;
        } catch (e) {
            console.error("JSON parse failed for", s.name, e);
            return false;
        }
    });

    if (serviceMatch) {
        return serviceMatch.name;
    }

    // fallback if no service matched
    if (
        pricePerPerson === 50 ||
        duration === 60 ||
        pricePerPerson === 45 ||
        duration === 45
    ) {
        console.warn("Fallback: matched old Relaxzy booking.");
        return "Relaxzy";
    }

    return null;
}

async function importBookings() {
    const total = jsonData.length; // total bookings
    let count = 0; // processed bookings
    const failedRows = []; // store failed rows

    for (const row of jsonData) {
        try {
            count++; // increment before processing for 1-based index in message

            // --- CLIENT ---
            let clientId = null;
            if (row.Name || row.Phone) {

                if (row.Phone) {
                    row.Phone = validatePhone(String(row.Phone));
                }

                let { data: client } = row.Phone
                    ? await supabase
                        .from("clients")
                        .select("id")
                        .eq("phone", row.Phone)
                        .single()
                    : { data: null, error: null };

                if (!client && row.Name) {
                    const { data: nameMatch } = await supabase
                        .from("clients")
                        .select("id, phone")
                        .eq("name", row.Name)
                        .maybeSingle();

                    if (nameMatch) {
                        client = nameMatch;
                        if (!nameMatch.phone && row.Phone) {
                            const { data: updated, error: updateError } =
                                await supabase
                                    .from("clients")
                                    .update({ phone: row.Phone })
                                    .eq("id", nameMatch.id);

                            if (updated) {
                                console.log("Updated client phone:", updated);
                            }
                            if (updateError) {
                                console.error(
                                    "Error updating client phone in Supabase:",
                                    updateError
                                );
                                throw new Error(
                                    "Error updating client phone in Supabase:",
                                    updateError
                                );
                            }
                        }
                    }
                }

                if (!client) {
                    const { data: inserted, error: insertError } =
                            await supabase
                            .from("clients")
                            .insert({
                                name: row.Name || null,
                                surname: null,
                                phone: row.Phone || null,
                            })
                            .select("id")
                            .single();

                    if (inserted) {
                        console.log("Inserted new client:", inserted);
                    }
                    if (insertError) {
                        console.error(
                            "Error inserting new client in Supabase:",
                            insertError
                        );
                        throw new Error(
                            "Invalid phone number in Supabase",
                            insertError
                        );
                    }

                    client = inserted;
                }
                clientId = client?.id ?? null;
            }

            // --- SERVICE ---
            const serviceMap = {
                Thai: "Traditional Thai",
                Oil: "Thai Oil",
                Relaxzy: "Relaxzy",
                FL: "Feet & Legs",
                BS: "Back & Shoulders",
                DT: "Deep Tissue",
            };
            let dbServiceName = row.Massage
                ? serviceMap[row.Massage] || row.Massage
                : null;

            const { duration, multiplier } = parseDuration(row.Duration);
            const pricePerPerson = (parseNumber(row.Price) || 0) / multiplier;

            dbServiceName = await resolveServiceName(
                dbServiceName,
                duration,
                pricePerPerson
            );

            console.log(dbServiceName.toString().toUpperCase())

            const { data: service, error: serviceError } = await supabase
                .from("services")
                .select("id")
                .eq("name", dbServiceName)
                .single();

            if (serviceError || !service) {
                throw new Error("❌ Service not found:", {
                    dbServiceName,
                    serviceError,
                });
            }

            if (serviceError) {
                throw new Error(`Service mapping failed for: ${dbServiceName}`);
            }
            const serviceId = service.id;

            const startDate = parseStartDate(row);
            const endDate = new Date(startDate.getTime() + duration * 60000);

            // --- BOOKINGS & PAYMENTS ---
            for (let i = 0; i < multiplier; i++) {
                const bookingClientId = i === 0 ? clientId : null;
                const comments = row.Comments ? String(row.Comments).trim() : null;

                const bookingInfo = {
                    client_id: bookingClientId,
                    service_id: serviceId,
                    start_time: startDate.toISOString(),
                    end_time: endDate.toISOString(),
                    notes:
                        i === 0
                            ? [
                                comments,
                                row.TipT
                                    ? "Propina en tarjeta " + row.TipT
                                    : null,
                            ]
                                .filter(Boolean)
                                .join(", ") || null
                            : null,
                    status: "completed",
                };

                const { data: bookingData, error: bookingError } =
                    await supabase
                        .from("bookings")
                        .upsert([bookingInfo], {
                            onConflict: "client_id,service_id,start_time",
                        })
                        .select()
                        .maybeSingle(); // always return row if exists

                if (bookingError) {
                    console.error("❌ Booking insert error:", bookingError);
                    throw new Error(
                        `Booking insert failed for: ${JSON.stringify(
                            bookingInfo
                        )} -> ${bookingError.message}`
                    );
                }

                if (!bookingData || bookingData.length === 0) {
                    console.warn(
                        "⚠️ No booking returned (likely duplicate, no changes):",
                        {
                            client_id: bookingClientId,
                            service_id: serviceId,
                            start_time: startDate.toISOString(),
                        }
                    );
                }

                console.log("Booking upsert result:", bookingData);
                const bookingId = bookingData.id;

                const cashPayment =
                    (parseNumber(row.PaymentE) || 0) / multiplier;
                const cardPayment =
                    (parseNumber(row.PaymentT) || 0) / multiplier;
                const cardTip = (parseNumber(row.TipT) || 0) / multiplier;

                let payments = [];
                if (cashPayment > 0)
                    payments.push({
                        booking_id: bookingId,
                        amount: cashPayment,
                        method: "cash",
                        paid_at: new Date().toISOString(),
                        paid: true,
                    });
                if (cardPayment > 0)
                    payments.push({
                        booking_id: bookingId,
                        amount: cardPayment + cardTip,
                        method: "credit card",
                        paid_at: new Date().toISOString(),
                        paid: true,
                    });
                else if (cardTip > 0)
                    payments.push({
                        booking_id: bookingId,
                        amount: cardTip,
                        method: "credit card",
                        paid_at: new Date().toISOString(),
                        paid: true,
                    });

                for (const payment of payments) {
                    const { data: paymentData, error: paymentError } =
                        await supabase
                            .from("payments")
                            .upsert([payment], {
                                onConflict: "booking_id,method",
                            })
                            .select()
                            .maybeSingle();

                    if (paymentError) {
                        console.error("❌ Payment insert error:", paymentError);
                        throw new Error(
                            `Payment insert failed for: ${payment}`
                        );
                    }

                    if (!paymentData || paymentData.length === 0) {
                        console.warn(
                            "⚠️ No payment returned (likely duplicate, no changes):",
                            {
                                payment: payment,
                            }
                        );
                    }

                    console.log("Payment upsert result:", paymentData);
                }
            }

            console.log(
                `✅ Imported booking on ${startDate.toISOString()} (${row.Massage
                }) x${multiplier}`
            );
            console.log(`Imported ${count} of ${total}`);
        } catch (err) {
            console.error("❌ Error importing row:", row, err.message);
            failedRows.push({ row, error: err.message });
        } finally {
            console.log(
                "-----------------------------------------------------"
            );
        }
    }

    // --- REPORT ---
    console.log("\n🎉 Import finished!");
    if (failedRows.length > 0) {
        console.log(`❌ ${failedRows.length} bookings failed to import:\n`);
        failedRows.forEach((f, idx) => {
            console.log(
                `${idx + 1}. Massage: ${f.row.Massage}, Date: ${f.row.File}-${f.row.Sheet
                }T${f.row.StartTime}, Phone: ${f.row.Phone}, Error: ${f.error}`
            );
        });
    } else {
        console.log("✅ All bookings imported successfully!");
    }
}

importBookings();
