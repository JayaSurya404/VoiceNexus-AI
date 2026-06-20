import { createHmac, timingSafeEqual } from "node:crypto";

import { z } from "zod";

import { env } from "../config/env.js";
import { RealtimeError } from "../shared/errors.js";

const mediaStreamClaimsSchema = z.object({
  organizationId: z.string().min(1),
  callSessionId: z.string().min(1),
  providerCallSid: z.string().min(1).nullable().optional(),
  exp: z.number().int().positive(),
});

export type MediaStreamClaims = z.infer<typeof mediaStreamClaimsSchema>;

export class MediaStreamTokenService {
  verify(token: string): MediaStreamClaims {
    const [payloadPart, signaturePart] = token.split(".");

    if (!payloadPart || !signaturePart) {
      throw RealtimeError.unauthorized("Media stream token is malformed");
    }

    const expected = createHmac("sha256", env.MEDIA_STREAM_SECRET).update(payloadPart).digest("base64url");

    if (!safeEqual(signaturePart, expected)) {
      throw RealtimeError.unauthorized("Media stream token signature is invalid");
    }

    const payload = JSON.parse(Buffer.from(payloadPart, "base64url").toString("utf8")) as unknown;
    const claims = mediaStreamClaimsSchema.parse(payload);

    if (claims.exp < Math.floor(Date.now() / 1000)) {
      throw RealtimeError.unauthorized("Media stream token has expired");
    }

    return claims;
  }
}

function safeEqual(left: string, right: string): boolean {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }

  return timingSafeEqual(leftBuffer, rightBuffer);
}
