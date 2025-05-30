const TelegramBot = require("node-telegram-bot-api");
require("dotenv").config();

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

if (!TELEGRAM_BOT_TOKEN) {
  throw new Error("Missing TELEGRAM_BOT_TOKEN");
}

const bot = new TelegramBot(TELEGRAM_BOT_TOKEN, { polling: false });

// Import the /start handler
const handleStart = require("./handlers/start");

// Register the /start command
bot.onText(/\/start/, handleStart);

module.exports = bot;
