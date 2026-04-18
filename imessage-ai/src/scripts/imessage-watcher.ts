import "dotenv/config";
import { IMessageSDK } from "@photon-ai/imessage-kit";

const ALLOWED_NUMBER = "+17202794283";
const RAILWAY_URL = process.env.RAILWAY_URL ?? "https://sam-production-ba56.up.railway.app";

const sdk = new IMessageSDK({ debug: true });

async function handleMessage(text: string, sender: string) {
  try {
    const response = await fetch(`${RAILWAY_URL}/simulate/sms`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ from: sender, body: text }),
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
    console.log(`[inbound] sender=${msg.sender} isFromMe=${msg.isFromMe} text=${msg.text}`);

    if (msg.isFromMe) return;

    const sender = msg.sender;
    const text = msg.text ?? "";

    if (sender !== ALLOWED_NUMBER) {
      console.log(`[skipped] ${sender} is not in the allowed list`);
      return;
    }

    await handleMessage(text, sender);
  },
  onError: (err) => {
    console.error("Watcher error:", err);
  },
});

console.log(`Sam is watching for messages from ${ALLOWED_NUMBER}...`);
setInterval(() => console.log("[heartbeat] still watching..."), 5000);

process.on("SIGINT", async () => {
  console.log("Shutting down...");
  await sdk.close();
  process.exit(0);
});
