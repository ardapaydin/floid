import { create } from "zustand";

type TwoFactorDialogData = {
  function?: () => void;
  mfa?: {
    ticket: string;
    options: string[];
  };
};

type TwoFactorDialogStore = {
  isOpen: boolean;
  data: TwoFactorDialogData;
  setIsOpen: (open: boolean) => void;
  setData: (data: TwoFactorDialogData) => void;
};

export const useTwoFactorDialogStore = create<TwoFactorDialogStore>((set) => ({
  isOpen: false,
  data: {},
  setIsOpen: (open) => set({ isOpen: open }),
  setData: (d) => set({ data: d }),
}));
