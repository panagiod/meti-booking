import { create } from "zustand";
import { persist } from "zustand/middleware";

interface BookingData {
  instructorId: string;
  instructorName: string;
  serviceName: string;
  servicePrice: number;
  serviceFee: number;
  serviceTotal: number;
  duration: number;
  date: string;
  time: string;
  rescheduleHours: number;
}

interface BookingStore {
  booking: BookingData | null;
  setBooking: (data: BookingData) => void;
  clearBooking: () => void;
}

export const useBookingStore = create<BookingStore>()(
  persist(
    (set) => ({
      booking: null,
      setBooking: (data) => set({ booking: data }),
      clearBooking: () => set({ booking: null }),
    }),
    {
      name: "meti-booking-storage",
    }
  )
);
