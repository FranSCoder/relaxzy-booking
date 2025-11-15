import { FormFieldConfigModel } from '@/types/formFieldConfig';
import { menuPageModel } from '../types/menuPage';
import { BookingModel, BookingStatus } from '@/types/bookings';

export const menuPages: menuPageModel[] = [
  { text: 'Bookings', href: '/bookings' },
  { text: 'Clients', href: '/clients' },
  { text: 'Payments', href: '/payments' },
  { text: 'Services', href: '/services' },
];

export const drawerWidth: number = 240;

export const BOOKING_DEFAULT_DURATIONS = ['30', '60', '90', '120'];

export const BOOKING_DEFAULT_SERVICES = ['Traditional Thai', 'Thai Oil', 'Relaxzy', 'Deep Tissue', 'Feet & Legs', 'Back & Shoulders'];

export const BOOKING_DEFAULT_STATUSES: BookingStatus[] = ['confirmed', 'cancelled', 'pending'];

export const AGENDA_LENGTH = 30;

export const FORM_FIELDS_ADD_BOOKING: FormFieldConfigModel<BookingModel>[] = [
  { formKey: 'name', label: 'Name', size: 6, type: 'textfield', autoFocus: true },
  { formKey: 'surname', label: 'Surname(s)', size: 6, type: 'textfield' },
  { formKey: 'phone', label: 'Phone', size: 6, type: 'textfield' },
  { formKey: 'email', label: 'Email', size: 6, type: 'textfield' },
  { formKey: 'start_time', label: 'Date & Time', size: 6, type: 'datepicker', showTime: true },
  { formKey: 'duration', label: 'Duration', size: 6, type: 'select', elements: BOOKING_DEFAULT_DURATIONS },
  { formKey: 'service_name', label: 'Massage', size: 6, type: 'select', elements: BOOKING_DEFAULT_SERVICES },
  { formKey: 'notes', label: 'Notes', size: 6, type: 'textfield' },
];

export const FORM_FIELDS_EDIT_BOOKING: FormFieldConfigModel<BookingModel>[] = [
  { formKey: "service_name", label: "Service", size: 6,  type: "select", elements: BOOKING_DEFAULT_SERVICES },
  { formKey: "status", label: "Status", size: 6, type: "select", elements: BOOKING_DEFAULT_STATUSES },
  { formKey: "start_time", label: "Start Time", size: 6, type: "datetime" },
  { formKey: 'duration', label: 'Duration', size: 6, type: 'select', elements: BOOKING_DEFAULT_DURATIONS },
  { formKey: "notes", label: "Notes", size: 6, type: "text" },
];

