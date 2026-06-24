declare module "twilio" {
  interface TwilioCallCreateInput {
    to: string;
    from: string;
    url: string;
    statusCallback?: string;
    statusCallbackEvent?: string[];
    statusCallbackMethod?: "POST";
  }

  interface TwilioCallInstance {
    sid: string;
    status?: string;
  }

  interface TwilioClient {
    calls: {
      create(input: TwilioCallCreateInput): Promise<TwilioCallInstance>;
    };
  }

  const createTwilioClient: (accountSid: string, authToken: string) => TwilioClient;
  export default createTwilioClient;
}
