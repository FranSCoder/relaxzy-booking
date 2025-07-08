'use client'

import { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { FormData } from "./FormData";
import { createClient } from "@/utils/supabase/client";

type DurationOption = {
  label: string;
  value: number;
};

type Therapist = {
  id: string;
  full_name: string;
};

const BookingForm = () => {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    phone: "",
    service: "",
    date: "",
    time: "",
    duration: "60",
    therapist: "",
  });
  const [therapists, setTherapists] = useState<Therapist[]>([]);

  useEffect(() => {
    const fetchTherapists = async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("therapists")
        .select("id, full_name")
        .order("full_name", { ascending: true });

      if (error) {
        console.error("Error fetching therapists:", error.message);
      } else if (data) {
        setTherapists(data);
      }
    };

    fetchTherapists();
  }, []);

  const services = [
    "Traditional Thai Massage",
    "Oil Thai Massage",
    "Relaxzy Massage",
    "Foot & Leg Massage",
  ];

  const durationOptions: DurationOption[] = [
    { label: "30m", value: 30 },
    { label: "45m", value: 45 },
    { label: "1h", value: 60 },
    { label: "1h15m", value: 75 },
    { label: "1h30m", value: 90 },
    { label: "1h45m", value: 105 },
    { label: "2h", value: 120 },
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Booking submitted:", formData);
    // Add Supabase logic here
  };

  const parseDateTime = (date: string, time: string) => {
    if (!date || !time) return null;
    const dateTimeString = `${date}T${time}`;
    const parsed = new Date(dateTimeString);
    return isNaN(parsed.getTime()) ? null : parsed;
  };

  const parseDate = (str: string) => (str ? new Date(str) : null);
  const formatDate = (date: Date | null) =>
    date ? date.toISOString().split("T")[0] : "";
  const formatTime = (date: Date | null) =>
    date ? date.toTimeString().split(":").slice(0, 2).join(":") : "";

  return (
    <form onSubmit={handleSubmit} className="max-w-xl mx-auto p-4 rounded-2xl shadow-lg space-y-4">
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

      <input
        type="tel"
        name="phone"
        value={formData.phone}
        onChange={handleChange}
        placeholder="Phone Number"
        className="w-full p-2 border rounded-xl"
        required
      />

      <select
        name="service"
        value={formData.service}
        onChange={handleChange}
        className="w-full p-2 border rounded-xl dark:bg-neutral-950"
        required
      >
        <option value="">Select Service</option>
        {services.map((service) => (
          <option key={service} value={service}>
            {service}
          </option>
        ))}
      </select>

      {/* Date & Time Picker */}
      <div className="flex gap-2">
        {/* Date Picker */}
        <div className="relative w-1/2">
          <DatePicker
            selected={parseDate(formData.date)}
            onChange={(date: Date | null) =>
              setFormData((prev) => ({
                ...prev,
                date: formatDate(date),
              }))
            }
            dateFormat="yyyy-MM-dd"
            placeholderText="Select Date"
            className="w-full p-2 pl-10 border rounded-xl bg-white text-black dark:bg-neutral-950 dark:text-white dark:border-gray-700"
          />
          <svg
            className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500 dark:text-gray-300 pointer-events-none"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>

        {/* Time Picker */}
        <div className="relative w-1/2">
          <DatePicker
            selected={parseDateTime(formData.date, formData.time)}
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
            className="w-full p-2 pl-10 border rounded-xl bg-white text-black dark:bg-neutral-950 dark:text-white dark:border-gray-700"
          />
          <svg
            className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500 dark:text-gray-300 pointer-events-none"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
      </div>

      <select
        name="duration"
        value={formData.duration}
        onChange={handleChange}
        className="w-full p-2 border rounded-xl dark:bg-neutral-950"
        required
      >
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
        className="w-full p-2 border rounded-xl dark:bg-neutral-950"
      >
        <option value="">Assign Automatically</option>
        {therapists.map((t) => (
          <option key={t.id} value={t.id}>
            {t.full_name}
          </option>
        ))}
      </select>

      <button
        type="submit"
        className="w-full bg-green-600 text-white py-2 rounded-xl hover:bg-green-700 transition"
      >
        Add Booking
      </button>
    </form>
  );
};

export default BookingForm;
