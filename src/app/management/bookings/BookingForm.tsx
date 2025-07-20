"use client";

import { useState, useEffect, useRef } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { createClient } from "@/utils/supabase/client";
import debounce from "lodash.debounce";

type DurationOption = { label: string; value: number };
type Therapist = { id: string; full_name: string };
type Service = { id: string; name: string };
type Client = { id: string; full_name: string; email: string; phone: string };
type FormData = {
    name: string;
    email: string;
    phone: string;
    service: string;
    date: string;
    time: string;
    duration: string;
    therapist: string;
};

const BookingPage = () => {
    const supabase = createClient();

    const roundToNearest5Minutes = (date: Date) => {
        const minutes = 5;
        const ms = 1000 * 60 * minutes;
        return new Date(Math.round(date.getTime() / ms) * ms);
    };
    const parseDate = (str: string) => (str ? new Date(str) : null);
    const parseDateTime = (date: string, time: string) => {
        if (!date || !time) return null;
        const dateTimeString = `${date}T${time}`;
        const parsed = new Date(dateTimeString);
        return isNaN(parsed.getTime()) ? null : parsed;
    };
    const formatDate = (date: Date | null) =>
        date ? date.toISOString().split("T")[0] : "";
    const formatTime = (date: Date | null) =>
        date ? date.toTimeString().split(":").slice(0, 2).join(":") : "";

    const durationOptions: DurationOption[] = [
        { label: "30m", value: 30 },
        { label: "45m", value: 45 },
        { label: "1h", value: 60 },
        { label: "1h15m", value: 75 },
        { label: "1h30m", value: 90 },
        { label: "1h45m", value: 105 },
        { label: "2h", value: 120 },
    ];
    const now = new Date();
    const roundedTime = roundToNearest5Minutes(now);

    const [formData, setFormData] = useState<FormData>({
        name: "",
        email: "",
        phone: "",
        service: "",
        date: formatDate(roundedTime),
        time: formatTime(roundedTime),
        duration: "60",
        therapist: "",
    });
    const [therapists, setTherapists] = useState<Therapist[]>([]);
    const [services, setServices] = useState<Service[]>([]);
    const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [searchResults, setSearchResults] = useState<Client[]>([]);
    const [isSearching, setIsSearching] = useState(false);

    // fetch data
    useEffect(() => {
        const fetchData = async () => {
            const [tRes, sRes] = await Promise.all([
                supabase
                    .from("therapists")
                    .select("id, full_name")
                    .order("full_name", { ascending: true }),
                supabase
                    .from("services")
                    .select("id, name")
                    .order("name", { ascending: false }),
            ]);

            if (!tRes.error && tRes.data) {
              setTherapists(tRes.data);
              setFormData((prev) => ({ ...prev, therapist: tRes.data[0].full_name}));
            } ;
            if (!sRes.error && sRes.data) {
              setServices(sRes.data);
              setFormData((prev) => ({ ...prev, service: sRes.data[0].name}));
            }
        };

        fetchData();
        
    }, [supabase]);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSelectCustomer = (client: Client) => {
        setFormData((prev) => ({
            ...prev,
            name: client.full_name || "",
            email: client.email || "",
            phone: client.phone || "",
        }));
        setSelectedClientId(client.id);
        setSearchTerm("");
        setSearchResults([]);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const startDateTimeStr = `${formData.date}T${formData.time}`;
        const startDateTime = new Date(startDateTimeStr);
        if (isNaN(startDateTime.getTime())) {
            alert("Invalid date or time");
            return;
        }

        const endDateTime = new Date(
            startDateTime.getTime() + parseInt(formData.duration) * 60000
        );

        const selectedService = services.find(
            (s) => s.name === formData.service
        );
        if (!selectedService) {
            alert("Invalid service selected");
            return;
        }

        const selectedTherapist = therapists.find(
            (t) => t.full_name === formData.therapist
        );

        const { error } = await supabase.from("bookings").insert([
            {
                client_id: selectedClientId, // <-- make sure you track & set this elsewhere
                therapist_id: selectedTherapist?.id || null,
                service_id: selectedService.id,
                start_time: startDateTime.toISOString(),
                end_time: endDateTime.toISOString(),
                notes: "", // optional
                status: "confirmed", // or whatever default
            },
        ]);

        if (error) {
            console.error(error);
            alert("Failed to create booking");
        } else {
            alert("Booking created!");
            // optionally reset form
        }
    };

    // Fuzzy search
    const debouncedSearch = useRef(
        debounce(async (text: string) => {
            if (!text) {
                setSearchResults([]);
                setIsSearching(false);
                return;
            }

            const { data, error } = await supabase.rpc("search_clients_fuzzy", {
                search_term: text,
            });

            if (!error && data) {
                setSearchResults(data.slice(0, 3));
                setIsSearching(true);
            } else {
                console.error(error);
            }
        }, 300)
    ).current;

    const handleSearch = (text: string) => {
        setSearchTerm(text);
        debouncedSearch(text);
    };

    return (
        <div className="flex flex-col justify-center md:flex-row gap-6 p-4">
            {/* Left: Booking Form */}
            <form
                onSubmit={handleSubmit}
                className="flex-1 max-w-xl p-4 rounded-2xl shadow-lg space-y-4 bg-white dark:bg-neutral-900">
                <h2 className="text-2xl font-bold">New Booking</h2>

                <input
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Customer Name"
                    className="w-full p-2 border rounded-xl"
                    required
                />
                <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Email Address"
                    className="w-full p-2 border rounded-xl"
                />
                <div className="flex gap-2">
                    <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="Phone Number"
                        className="w-1/2 p-2 border rounded-xl"
                        required
                    />

                    <select
                        name="service"
                        value={formData.service}
                        onChange={handleChange}
                        className="w-1/2 p-2 border rounded-xl dark:bg-neutral-900"
                        required>
                        {services.map((s) => (
                            <option key={s.id} value={s.name}>
                                {s.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="flex gap-2">
                    <div className="relative w-1/2">
                        <DatePicker
                            selected={parseDate(formData.date)}
                            onChange={(date: Date | null) =>
                                setFormData((prev) => ({
                                    ...prev,
                                    date: formatDate(date),
                                }))
                            }
                            dateFormat="dd/MM/yyyy"
                            placeholderText="Select Date"
                            className="min-w-full p-2 border rounded-xl"
                        />
                    </div>

                    <div className="relative w-1/2">
                        <DatePicker
                            selected={parseDateTime(
                                formData.date,
                                formData.time
                            )}
                            onChange={(date: Date | null) =>
                                setFormData((prev) => ({
                                    ...prev,
                                    time: formatTime(date),
                                }))
                            }
                            showTimeSelect
                            showTimeSelectOnly
                            timeIntervals={5}
                            timeCaption="Time"
                            dateFormat="HH:mm"
                            placeholderText="Select Time"
                            className="w-full p-2 border rounded-xl"
                        />
                    </div>
                </div>

                <div className="flex gap-2">
                    <select
                        name="duration"
                        value={formData.duration}
                        onChange={handleChange}
                        className="w-1/2 p-2 border rounded-xl dark:bg-neutral-900"
                        required>
                        <option value="">Select Duration</option>
                        {durationOptions.map(({ label, value }) => (
                            <option key={value} value={value}>
                                {label}
                            </option>
                        ))}
                    </select>

                    <select
                        name="therapist"
                        value={formData.therapist}
                        onChange={handleChange}
                        className="w-1/2 p-2 border rounded-xl dark:bg-neutral-900">
                        {therapists.map((t) => (
                            <option key={t.id} value={t.full_name}>
                                {t.full_name}
                            </option>
                        ))}
                    </select>
                </div>

                <button
                    type="submit"
                    className="w-full bg-green-600 text-white py-2 rounded-xl hover:bg-green-700 transition">
                    Add Booking
                </button>
            </form>

            {/* Right: Find Existing Customer */}
            <div className="w-full md:w-1/3 p-4 rounded-2xl shadow-lg bg-white dark:bg-neutral-900">
                <h2 className="text-xl font-bold mb-2">
                    Find Existing Customer
                </h2>

                <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => handleSearch(e.target.value)}
                    placeholder="Search customers..."
                    className="w-full p-2 mb-4 border rounded-xl"
                />

                {isSearching && searchResults.length > 0 && (
                    <div className="space-y-2">
                        {searchResults.map((client) => (
                            <button
                                type="button"
                                key={client.id}
                                onClick={() => handleSelectCustomer(client)}
                                className="w-full text-left p-2 border rounded-xl bg-gray-50 dark:bg-neutral-800 hover:bg-gray-100 dark:hover:bg-neutral-700 transition">
                                <div className="font-semibold">
                                    {client.full_name}
                                </div>
                                <div className="text-sm">{client.email}</div>
                                <div className="text-sm">{client.phone}</div>
                            </button>
                        ))}
                    </div>
                )}

                {isSearching && searchResults.length === 0 && (
                    <p>No customers found.</p>
                )}
            </div>
        </div>
    );
};

export default BookingPage;
