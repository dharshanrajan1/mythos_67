import "dotenv/config";
import { readFileSync, unlinkSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";
import { IMessageSDK, isImageAttachment, downloadAttachment } from "@photon-ai/imessage-kit";

const ALLOWED_NUMBER = process.env.ALLOWED_NUMBER ?? "+17202794283";
const AGENT_URL = process.env.AGENT_URL ?? process.env.RAILWAY_URL ?? "http://localhost:3001";

const sdk = new IMessageSDK({ debug: true });

async function handleMessage(text: string, sender: string, attachments: Awaited<ReturnType<typeof sdk.getMessages>>["messages"][0]["attachments"]) {
  try {
    const images: string[] = [];

    for (const att of attachments ?? []) {
      if (isImageAttachment(att)) {
        const tmpPath = join(tmpdir(), `fieldcoach_${Date.now()}_${Math.random().toString(36).slice(2)}.jpg`);
        try {
          await downloadAttachment(att, tmpPath);
          const b64 = readFileSync(tmpPath).toString("base64");
          images.push(`data:image/jpeg;base64,${b64}`);
          try { unlinkSync(tmpPath); } catch {}
        } catch (e) {
          console.error("[attachment] failed to read image:", e);
        }
      }
    }

    const response = await fetch(`${AGENT_URL}/simulate/sms`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ from: sender, body: text, images }),
    });

    const data = (await response.json()) as { replyText?: string };

    if (data.replyText) {
      await sdk.send(sender, data.replyText);
    }
  } catch (error) {
    console.error("Error handling message:", error);
  }
}

await sdk.startWatching({
  onMessage: async (msg) => {
    const attachCount = msg.attachments?.length ?? 0;
    console.log(`[inbound] sender=${msg.sender} isFromMe=${msg.isFromMe} text=${msg.text} attachments=${attachCount}`);

    if (msg.isFromMe) return;

    const sender = msg.sender;
    const text = msg.text ?? "";

    if (sender !== ALLOWED_NUMBER) {
      console.log(`[skipped] ${sender} is not in the allowed list`);
      return;
    }

    await handleMessage(text, sender, msg.attachments ?? []);
  },
  onError: (err) => {
    console.error("Watcher error:", err);
  },
});

console.log(`Field Coach watching for messages from ${ALLOWED_NUMBER} → agent at ${AGENT_URL}`);
setInterval(() => console.log("[heartbeat] still watching..."), 5000);

process.on("SIGINT", async () => {
  console.log("Shutting down...");
  await sdk.close();
  process.exit(0);
});
