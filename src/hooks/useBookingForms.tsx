import {toast} from 'react-toastify'
import { useState, useEffect } from 'react';
import { BookingModel } from '@/types/bookings';

const initialStateBookingForm: BookingModel = {
  name: "",
  surname: "",
  phone: "",
  email: "",
  start_time: "",
  duration: "",
  service_name: "",
  notes: "",
  status: "",
  created_at: "",
  updated_at: ""
};

export const useBookingForm = () => {
  const [isOpenBookingDialog, setIsOpenBookingDialog] = useState<boolean>(false);

  const [bookingFormData, setBookingFormData] = useState<BookingModel>(initialStateBookingForm);
  const [availableServices, setAvailableServices] = useState<string[]>([]);
  const [availableDurations, setAvailableDurations] = useState<string[]>([]);

  useEffect(() => {
    const fetchLookups = async () => {
      try {
        const res = await fetch('/api/services');
        if (!res.ok) {
          console.error('Failed to fetch services lookup:', res.statusText);
          return;
        }
        const services = await res.json();
        // services expected shape: { service_name, service_duration }
  const uniqueServices = Array.from(new Set(services.map((s: any) => String(s.service_name)))).filter(Boolean) as string[]
  setAvailableServices(uniqueServices);
  const uniqueDurations = Array.from(new Set(services.map((s: any) => String(s.service_duration ?? '')))).filter(Boolean) as string[];
  setAvailableDurations(uniqueDurations);
      } catch (err) {
        console.error('Lookup fetch error', err);
      }
    };

    fetchLookups();
  }, []);

  const handleAccept = () => {
    (async () => {
      try {
        const res = await fetch('/api/bookings/new', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(bookingFormData),
        });
        const data = await res.json();
        if (!res.ok) {
          console.error('Booking create error', data);
          toast.error(data?.error || 'Error creating booking');
          return;
        }
        console.log('A new reservation has been created:', data.booking);
        toast.success('The reservation has been created successfully.');
        setIsOpenBookingDialog(false);
        setBookingFormData(initialStateBookingForm);
      } catch (err) {
        console.error('Network or server error creating booking', err);
        toast.error('Error creating booking');
      }
    })();
  };

  const handleCancel = () => {
    setIsOpenBookingDialog(false);
    setBookingFormData(initialStateBookingForm);
  };

  return {
    isOpenBookingDialog,
    setIsOpenBookingDialog,
    bookingFormData,
    setBookingFormData,
    handleAccept,
    handleCancel,
    availableServices,
    availableDurations,
  };
};