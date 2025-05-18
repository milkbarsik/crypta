import { create } from "zustand";

type Tcipher = {
	cipherType: boolean;
	setCipherType: (value: boolean) => void;
	getCipherType: () => boolean;
}

export const useCipher = create<Tcipher>((set, get) => ({
	cipherType: false,

	setCipherType: (value: boolean) => set((state) => ({...state, cipherType: value})),

	getCipherType: () => get().cipherType
}))