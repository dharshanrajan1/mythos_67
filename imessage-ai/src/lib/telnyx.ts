import { env } from "./env.js";

type SendSmsInput = {
  to: string;
  body: string;
};

export async function sendSms(input: SendSmsInput) {
  if (!env.TELNYX_API_KEY || !env.TELNYX_PHONE_NUMBER) {
    return {
      providerMessageId: null,
      rawPayload: {
        skipped: true,
        reason: "Missing Telnyx credentials",
        body: input.body,
      },
    };
  }

  const response = await fetch("https://api.telnyx.com/v2/messages", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.TELNYX_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: env.TELNYX_PHONE_NUMBER,
      to: input.to,
      text: input.body,
    }),
  });

  const rawPayload = await response.json();

  if (!response.ok) {
    throw new Error(`Telnyx send failed: ${response.status} ${JSON.stringify(rawPayload)}`);
  }

  return {
    providerMessageId: (rawPayload as { data?: { id?: string } }).data?.id ?? null,
    rawPayload,
  };
}
