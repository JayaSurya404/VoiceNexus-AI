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
    console.info("[media-stream-token] verifying token", {
      parts: token.split(".").length,
      tokenLength: token.length,
    });
    const [payloadPart, signaturePart] = token.split(".");

    if (!payloadPart || !signaturePart) {
      console.error("[media-stream-token] malformed token", {
        hasPayload: Boolean(payloadPart),
        hasSignature: Boolean(signaturePart),
      });
      throw RealtimeError.unauthorized("Media stream token is malformed");
    }

    const expected = createHmac("sha256", env.MEDIA_STREAM_SECRET).update(payloadPart).digest("base64url");

    if (!safeEqual(signaturePart, expected)) {
      console.error("[media-stream-token] invalid signature", {
        payloadLength: payloadPart.length,
        signatureLength: signaturePart.length,
      });
      throw RealtimeError.unauthorized("Media stream token signature is invalid");
    }

    const payload = JSON.parse(Buffer.from(payloadPart, "base64url").toString("utf8")) as unknown;
    const claims = mediaStreamClaimsSchema.parse(payload);

    if (claims.exp < Math.floor(Date.now() / 1000)) {
      console.error("[media-stream-token] expired token", {
        organizationId: claims.organizationId,
        callSessionId: claims.callSessionId,
        exp: claims.exp,
      });
      throw RealtimeError.unauthorized("Media stream token has expired");
    }

    console.info("[media-stream-token] verified", {
      organizationId: claims.organizationId,
      callSessionId: claims.callSessionId,
      providerCallSid: claims.providerCallSid ?? null,
      exp: claims.exp,
    });
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
