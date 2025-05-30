// botInstance.js
const TelegramBot = require('node-telegram-bot-api');

const bot = new TelegramBot(process.env.BOT_TOKEN, { webHook: { port: false } }); // port: false for serverless
bot.setWebHook(`https://watch2ton.vercel.app/api/bot`);

bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, "🎉 Welcome to Watch2TON! Click below to launch the app and start earning TON by watching ads.", {
    reply_markup: {
      inline_keyboard: [
        [{ text: "🚀 Launch App", web_app: { url: "https://watch2ton.vercel.app" } }]
      ]
    }
  });
});

module.exports = bot;
