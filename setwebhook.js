require("dotenv").config();
const bot = require("./bot");

(async () => {
  try {
    await bot.deleteWebHook();
    await bot.setWebHook(process.env.WEBHOOK_URL || "https://watch2ton.vercel.app/api/bot");
    console.log("✅ Webhook successfully set.");
  } catch (error) {
    console.error("❌ Failed to set webhook:", error.message);
  }
})();
