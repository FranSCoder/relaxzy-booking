"use client";

import { useState, useEffect, useRef } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { createClient } from "@/utils/supabase/client";
import debounce from "lodash.debounce";

type DurationOption = { label: string; value: number };
type Service = { id: string; name: string };
type Client = { id: string; name: string | null; surname: string | null; email: string; phone: string };
type FormData = {
    name: string;
    email: string;
    phone: string;
    service: string;
    date: string;
    time: string;
    duration: string;
};

const BookingForm = () => {
    const supabase = createClient();

    const roundUpToNext5Minutes = (date: Date) => {
        const d = new Date(date); // clone so we don't mutate
        const minutes = d.getMinutes();
        const remainder = minutes % 5;

        if (remainder === 0) {
            // already on a 5-minute mark
            d.setSeconds(0, 0); // also clear seconds & ms
            return d;
        }

        d.setMinutes(minutes + (5 - remainder));
        d.setSeconds(0, 0);
        return d;
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
        { label: "1h", value: 60 },
        { label: "1h30m", value: 90 },
        { label: "2h", value: 120 },
    ];
    const now = new Date();
    const roundedTime = roundUpToNext5Minutes(now);

    const [formData, setFormData] = useState<FormData>({
        name: "",
        email: "",
        phone: "",
        service: "",
        date: formatDate(roundedTime),
        time: formatTime(roundedTime),
        duration: "60",
    });
    const [services, setServices] = useState<Service[]>([]);
    const [selectedClientId, setSelectedClientId] = useState<string | null>(
        null
    );
    const [searchTerm, setSearchTerm] = useState("");
    const [searchResults, setSearchResults] = useState<Client[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isCreatingBooking, setIsCreatingBooking] = useState(false);
    const [isCreatingCustomer, setIsCreatingCustomer] = useState(false);

    // fetch data
    useEffect(() => {
        const fetchData = async () => {
            const sRes = await supabase
                .from("services")
                .select("id, name")
                .order("name", { ascending: false });

            if (!sRes.error && sRes.data) {
                setServices(sRes.data);
                setFormData((prev) => ({
                    ...prev,
                    service: sRes.data[0].name,
                }));
            }
        };

        fetchData();
        setIsSubmitting(false);
    }, [supabase, isSubmitting, isCreatingBooking]);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSelectCustomer = (client: Client) => {
        setFormData((prev) => ({
            ...prev,
            name: `${client.name || ""}${client.surname ? ` ${client.surname}` : ""}`,
            email: client.email || "",
            phone: client.phone || "",
        }));
        setSelectedClientId(client.id);
        setSearchTerm("");
        setSearchResults([]);
        setIsSearching(false);
    };

    const toogleCreatingBooking = () => {
        setIsCreatingBooking((prev) => !prev);
        setIsCreatingCustomer(false);
        setFormData({
            name: "",
            email: "",
            phone: "",
            service: "",
            date: formatDate(roundedTime),
            time: formatTime(roundedTime),
            duration: "60",
        });
        if (!isCreatingBooking && !isCreatingCustomer) {
            focusSearchCustomers.current!.focus();
        }
    };

    const toggleCreatingCustomer = () => {
        setIsCreatingCustomer((prev) => !prev);
        setSearchTerm("");
        setSearchResults([]);
        setIsSearching(false);
        if (!isCreatingCustomer) {
            setTimeout(() => {
                focusCustomerName.current!.focus();
            }, 100);
        } else {
            focusSearchCustomers.current!.focus();
            setFormData((prev) => ({
                ...prev,
                name: "",
                email: "",
                phone: "",
            }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const startDateTimeStr = `${formData.date}T${formData.time}`;
        const startDateTime = new Date(startDateTimeStr);

        if (isNaN(startDateTime.getTime())) {
            alert("Invalid date or time");
            return;
        }

        const now = new Date();
        now.setSeconds(0);
        now.setMilliseconds(0);

        if (startDateTime < now) {
            const confirmed = window.confirm(
                "The selected date and time is in the past. Are you sure you want to continue?"
            );
            if (!confirmed) {
                return; // user chose No
            }
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

        if (isCreatingCustomer && !formData.name) {
            alert("Customer name is required");
            return;
        }

        if (isCreatingCustomer && (!formData.email || !formData.phone)) {
            alert("Email or phone number are required for new customers");
            return;
        }

        let clientIdToUse = selectedClientId;

        if (isCreatingCustomer) {
            // 1. Check for existing client by email or phone
            const { data: existingClients, error: clientSearchError } = await supabase
            .from("clients")
            .select("id, name, surname, email, phone")
            .or(`email.eq.${formData.email},phone.eq.${formData.phone}`);

            if (clientSearchError) {
                alert("Error searching for existing client");
                setIsSubmitting(false);
                return;
            }

            if (existingClients && existingClients.length > 0) {
                // If email or phone matches, do not create, use that client
                alert("A customer with this email or phone already exists. Please use the search to select them.");
                setIsSubmitting(false);
                return;
            }

            // 2. Check for name-only match
            const { data: nameMatches, error: nameSearchError } = await supabase
                .from("clients")
                .select("id, name, surname, email, phone")
                .eq("name", formData.name);

            if (nameSearchError) {
                alert("Error searching for name matches");
                setIsSubmitting(false);
                return;
            }

            if (nameMatches && nameMatches.length > 0) {
                const proceed = window.confirm(
                    `A customer with the same name already exists.\nName: ${formData.name}\nEmail: ${nameMatches[0].email}\nPhone: ${nameMatches[0].phone}\nDo you want to continue creating a new customer?`
                );
                if (!proceed) {
                    setIsSubmitting(false);
                    return;
                }
            }

            // 3. Create the new client
            // split provided full name into name and surname (basic split on first space)
            const [firstName, ...rest] = formData.name.trim().split(" ");
            const lastName = rest.join(" ") || null;

            const { data: newClient, error: createClientError } = await supabase
                .from("clients")
                .insert([
                    {
                        name: firstName,
                        surname: lastName,
                        email: formData.email,
                        phone: formData.phone,
                    },
                ])
                .select("id")
                .single();

            if (createClientError || !newClient) {
                alert("Failed to create new customer");
                setIsSubmitting(false);
                return;
            }
            clientIdToUse = newClient.id;
        }

        setIsSubmitting(true);

        const { error } = await supabase.from("bookings").insert([
            {
                client_id: clientIdToUse,
                service_id: selectedService.id,
                start_time: startDateTime.toISOString(),
                end_time: endDateTime.toISOString(),
                notes: "",
                status: "confirmed",
            },
        ]);

        if (error) {
            console.error(error);
            alert("Failed to create booking");
        } else {
            alert("Booking created!");
            setFormData({
                name: "",
                email: "",
                phone: "",
                service: "",
                date: formatDate(new Date()),
                time: formatTime(roundUpToNext5Minutes(new Date())),
                duration: "60",
            });
        }

        setSelectedClientId(null);
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
                setSearchResults(data.slice(0, 10));
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

    const focusCustomerName = useRef<HTMLInputElement>(null);
    const focusSearchCustomers = useRef<HTMLInputElement>(null);

    return (
        <div className="flex justify-center relative">
            <div className="w-1/4"></div>
            <div
                className={`px-4 bg-neutral-100 dark:bg-neutral-800 w-2/4 rounded-xl flex flex-col justify-center items-center ${
                    isCreatingBooking ? "pb-4" : ""
                }`}>
                <button
                    type="button"
                    className={`w-fit rounded-xl transition p-2 my-4 focus:outline-none focus:ring-0 ${
                        isCreatingBooking
                            ? "bg-green-900 hover:bg-green-800"
                            : "bg-green-700 hover:bg-green-600"
                    }`}
                    onClick={toogleCreatingBooking}>
                    {isCreatingBooking
                        ? "Close Create Booking"
                        : "Create Booking"}
                </button>
                <div
                    className={`flex flex-col justify-center md:flex-row gap-6 overflow-hidden transition-all duration-500 ease-in-out ${
                        isCreatingBooking
                            ? "max-h-[2000px] opacity-100"
                            : "max-h-0 opacity-0"
                    }`}>
                    {/* Left: Booking Form */}
                    <form
                        onSubmit={handleSubmit}
                        className="flex flex-col space-y-4 flex-1 w-xl p-4 rounded-xl shadow-lg bg-white dark:bg-neutral-900">
                        <div className="flex justify-between">
                            <h2 className="text-2xl font-bold">New Booking</h2>
                            <button
                                type="button"
                                className={`focus:outline-none focus:ring-0 rounded-xl w-fit p-2 shadow-lg transition ${
                                    isCreatingCustomer
                                        ? "bg-green-900 hover:bg-green-800"
                                        : "bg-green-700 hover:bg-green-600"
                                }`}
                                onClick={toggleCreatingCustomer}>
                                {isCreatingCustomer
                                    ? "Search Customers"
                                    : "New Customer"}
                            </button>
                        </div>
                        <input
                            name="name"
                            ref={focusCustomerName}
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Customer Name (*)"
                            disabled={!isCreatingCustomer}
                            className={`focus:outline-none focus:ring-0 w-full p-2 border rounded-xl transition ${
                                isCreatingCustomer
                                    ? ""
                                    : "cursor-not-allowed select-none bg-neutral-950"
                            }`}
                            required
                        />
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="Email Address"
                            disabled={!isCreatingCustomer}
                            className={`focus:outline-none focus:ring-0 w-full p-2 border rounded-xl transition ${
                                isCreatingCustomer
                                    ? ""
                                    : "cursor-not-allowed select-none bg-neutral-950"
                            }`}
                        />
                        <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            placeholder="Phone Number"
                            disabled={!isCreatingCustomer}
                            className={`focus:outline-none focus:ring-0 w-full p-2 border rounded-xl transition ${
                                isCreatingCustomer
                                    ? ""
                                    : "cursor-not-allowed select-none bg-neutral-950"
                            }`}
                            required
                        />
                        <div className="flex gap-2">
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
                                className="w-full p-2 border rounded-xl"
                                wrapperClassName="w-full"
                            />

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
                                wrapperClassName="w-full"
                                filterTime={(time) =>
                                    new Date(time).getHours() >= 10 &&
                                    new Date(time).getHours() < 22
                                }
                            />
                        </div>

                        <div className="flex gap-2">
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
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-green-600 text-white py-2 rounded-xl hover:bg-green-700 transition">
                            Add Booking
                        </button>
                    </form>
                </div>
            </div>
            <div className="w-1/4 relative">
                {/* Right: Find Existing Customer */}
                <div
                    className={`whitespace-nowrap p-4 rounded-xl shadow-lg bg-white dark:bg-neutral-900 overflow-hidden transition-all duration-500 ease-in-out ${
                        !isCreatingCustomer && isCreatingBooking
                            ? "md:w-full max-h-full opacity-100"
                            : "absolute w-0 max-h-0 opacity-0"
                    }`}>
                    <h2 className="text-xl font-bold mb-2">
                        Find Existing Customer
                    </h2>

                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => handleSearch(e.target.value)}
                        placeholder="Search customers..."
                        className="w-full p-2 mb-4 border rounded-xl"
                        ref={focusSearchCustomers}
                    />

                    {isSearching && searchResults.length > 0 && (
                        <div className="space-y-2 flex flex-col">
                            {searchResults.map((client) => (
                                <button
                                    type="button"
                                    key={client.id}
                                    onClick={() => handleSelectCustomer(client)}
                                    className="w-full text-left p-2 border rounded-xl bg-gray-50 dark:bg-neutral-800 hover:bg-gray-100 dark:hover:bg-neutral-700 transition">
                                    <div className="text-sm font-semibold">
                                        {`${client.name || ""}${client.surname ? ` ${client.surname}` : ""}`}
                                    </div>
                                    <div className="text-sm">
                                        {client.email}
                                    </div>
                                    <div className="text-sm">
                                        {client.phone}
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}

                    {isSearching && searchResults.length === 0 && (
                        <p>No customers found.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BookingForm;
