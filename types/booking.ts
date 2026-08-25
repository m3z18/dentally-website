export type BookingStep = 1 | 2 | 3 | 4 | 5 | 6;

export type TimeSlotStatus = "available" | "booked" | "closed";

export type TimeSlot = {
  value: string;
  label: string;
  status: TimeSlotStatus;
};

export type BookingDateOption = {
  value: string;
  dayName: string;
  dayNumber: string;
  monthName: string;
  available: boolean;
};

export type BookingFormData = {
  serviceId: string;
  date: string;
  time: string;
  patientName: string;
  phone: string;
  notes: string;
};

export type BookingAvailabilityState = "idle" | "loading" | "success" | "error";

export type BookingSuccess = {
  bookingReference: string;
  status: "pending";
};
