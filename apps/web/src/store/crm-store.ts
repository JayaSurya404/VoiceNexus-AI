"use client";

import type { LeadStatus } from "@voicenexus/contracts";
import { create } from "zustand";

interface CrmState {
  leadSearch: string;
  leadStatus: LeadStatus | "";
  tagFilter: string;
  setLeadSearch: (value: string) => void;
  setLeadStatus: (value: LeadStatus | "") => void;
  setTagFilter: (value: string) => void;
}

export const useCrmStore = create<CrmState>((set) => ({
  leadSearch: "",
  leadStatus: "",
  tagFilter: "",
  setLeadSearch: (leadSearch) => set({ leadSearch }),
  setLeadStatus: (leadStatus) => set({ leadStatus }),
  setTagFilter: (tagFilter) => set({ tagFilter }),
}));
