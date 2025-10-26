export interface BookingModel {
    name?: string;
    surname?: string;
    phone?: string;
    email?: string;
    start_time: string;
    duration: string;
    service_name: string;
    notes?: string;
    status: string;
    created_at?: string;
    updated_at?: string;
}

export interface BookingDTO {
  id: string;
  client_name: string;
  client_surname: string;
  service_name: string;
  start_time: string | Date;
  end_time: string | Date;
}

export interface BookingWithDetailsDTO {
    booking_id: string;
    start_time: string;
    end_time: string;
    booking_notes: string;
    status: string;
    booking_created_at: string;
    booking_updated_at: string;

    client_id: string;
    client_name: string;
    client_surname: string;
    client_email: string;
    client_phone: string;
    client_notes: string;
    client_created_at: string;

    therapist_id: string;
    therapist_name: string;
    therapist_email: string;
    therapist_phone: string;
    therapist_notes: string;
    therapist_created_at: string;

    service_id: string;
    service_name: string;
    service_created_at: string;

    payment_id: string | null;         // payments are optional
    payment_amount: number | null;
    payment_method: string | null;
    payment_refunded: boolean | null;
    payment_paid_at: string | null;
};