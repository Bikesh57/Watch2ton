// botInstance.js
require('dotenv').config(); // Add this line at the top
const TelegramBot = require('node-telegram-bot-api');
const TOKEN = process.env.BOT_TOKEN;

if (!TOKEN) throw new Error("BOT_TOKEN not set in environment");

const bot = new TelegramBot(TOKEN);

bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  const text = `🎉 Welcome to Watch2TON! Click below to launch the app and start earning TON by watching ads.`;
  const launchUrl = 'https://watch2ton.vercel.app'; // Your frontend

  bot.sendMessage(chatId, text, {
    reply_markup: {
      inline_keyboard: [[
        { text: '🚀 Launch App', web_app: { url: launchUrl } }
      ]]
    }
  });
});

module.exports = bot;
