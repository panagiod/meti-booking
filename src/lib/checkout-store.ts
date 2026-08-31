import { create } from "zustand";

interface CheckoutStore {
  isCheckingOut: boolean;
  setCheckingOut: (value: boolean) => void;
}

export const useCheckoutStore = create<CheckoutStore>((set) => ({
  isCheckingOut: false,
  setCheckingOut: (value) => set({ isCheckingOut: value }),
}));
