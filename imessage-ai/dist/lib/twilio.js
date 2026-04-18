import { env } from "./env.js";
export async function sendSms(input) {
    const sid = env.TWILIO_ACCOUNT_SID;
    const token = env.TWILIO_AUTH_TOKEN;
    const from = env.TWILIO_PHONE_NUMBER;
    if (!sid || !token || !from) {
        return {
            providerMessageId: null,
            rawPayload: {
                skipped: true,
                reason: "Missing Twilio credentials",
                body: input.body,
            },
        };
    }
    const auth = Buffer.from(`${sid}:${token}`).toString("base64");
    const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
        method: "POST",
        headers: {
            Authorization: `Basic ${auth}`,
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
            To: input.to,
            From: from,
            Body: input.body,
        }),
    });
    const rawPayload = await response.json();
    if (!response.ok) {
        throw new Error(`Twilio send failed: ${response.status}`);
    }
    return {
        providerMessageId: rawPayload.sid,
        rawPayload,
    };
}
