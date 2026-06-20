import type { TelephonyProvider } from "@voicenexus/contracts";

export interface PhoneNumberCapabilities {
  voice: boolean;
  sms: boolean;
  whatsapp: boolean;
}

export interface PhoneNumber {
  id: string;
  organizationId: string;
  provider: TelephonyProvider;
  phoneNumber: string;
  label: string;
  providerSid: string | null;
  status: "ACTIVE" | "INACTIVE";
  capabilities: PhoneNumberCapabilities;
  createdAt: Date;
  updatedAt: Date;
}

export interface NewPhoneNumber {
  organizationId: string;
  provider: TelephonyProvider;
  phoneNumber: string;
  label: string;
  providerSid: string | null;
  status: "ACTIVE" | "INACTIVE";
  capabilities: PhoneNumberCapabilities;
}
