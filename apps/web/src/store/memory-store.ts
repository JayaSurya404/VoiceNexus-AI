"use client";

import { create } from "zustand";

interface MemoryState {
  selectedLeadId: string;
  setSelectedLeadId: (leadId: string) => void;
}

export const useMemoryStore = create<MemoryState>((set) => ({
  selectedLeadId: "",
  setSelectedLeadId: (selectedLeadId) => set({ selectedLeadId }),
}));
