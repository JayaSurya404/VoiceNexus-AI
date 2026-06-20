import type { TelephonyProvider as TelephonyProviderName } from "@voicenexus/contracts";

import type { TelephonyProvider } from "../../application/ports/telephony-provider.js";
import { AppError } from "../../shared/app-error.js";
import { TwilioProvider } from "./twilio-provider.js";

interface ProviderFactoryConfig {
  twilioAccountSid: string;
  twilioAuthToken: string;
}

export class ProviderFactory {
  private readonly twilioProvider: TwilioProvider;

  constructor(config: ProviderFactoryConfig) {
    this.twilioProvider = new TwilioProvider({
      accountSid: config.twilioAccountSid,
      authToken: config.twilioAuthToken,
    });
  }

  getProvider(provider: TelephonyProviderName): TelephonyProvider {
    if (provider === "TWILIO") {
      return this.twilioProvider;
    }

    throw AppError.badRequest("PROVIDER_NOT_SUPPORTED", "This telephony provider is not available yet");
  }
}
