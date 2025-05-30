require('dotenv').config();
const bot = require('./api/botInstance');

const WEBHOOK_URL = process.env.WEBHOOK_URL || "https://watch2ton.vercel.app/api/bot";

(async () => {
  try {
    await bot.deleteWebHook();
    await bot.setWebHook(WEBHOOK_URL);
    console.log(`✅ Webhook successfully set to: ${WEBHOOK_URL}`);
  } catch (error) {
    console.error("❌ Failed to set webhook:", error.message);
  }
})();
