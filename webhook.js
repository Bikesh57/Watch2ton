const TelegramBot = require("node-telegram-bot-api");
require("dotenv").config();

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const WEBHOOK_URL = process.env.WEBHOOK_URL || "https://watch2ton.vercel.app/api/bot";

const bot = new TelegramBot(TELEGRAM_BOT_TOKEN, { polling: false });

(async () => {
  try {
    await bot.setWebHook(WEBHOOK_URL);
    console.log("✅ Webhook set to:", WEBHOOK_URL);
  } catch (err) {
    console.error("❌ Failed to set webhook:", err.message);
  }
})();
