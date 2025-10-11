import {toast} from 'react-toastify'
import { useState } from 'react';
import { BookingModel } from '@/types';

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

  const handleAccept = () => {
    console.log('Banco creado:', bookingFormData);
    toast.success('El banco se ha añadido correctamente.');
    setIsOpenBookingDialog(false);
    setBookingFormData(initialStateBookingForm);
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
  };
};