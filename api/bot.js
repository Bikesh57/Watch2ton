// /api/bot.js

const TelegramBot = require('node-telegram-bot-api');
const TOKEN = process.env.BOT_TOKEN;

if (!TOKEN) throw new Error("BOT_TOKEN not set in environment");

const bot = new TelegramBot(TOKEN);

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).send('Method Not Allowed');
    return;
  }

  try {
    const update = req.body;
    const message = update.message;

    // Log incoming
    console.log("Incoming update:", JSON.stringify(update));

    if (message && message.text === '/start') {
      const chatId = message.chat.id;
      const text = `🎉 Welcome to Watch2TON! Click below to launch the app and start earning TON by watching ads.`;
      const launchUrl = 'https://watch2ton.vercel.app';

      await bot.sendMessage(chatId, text, {
        reply_markup: {
          inline_keyboard: [[
            { text: '🚀 Launch App', web_app: { url: launchUrl } }
          ]]
        }
      });
    }

    res.status(200).send('OK');
  } catch (error) {
    console.error('Error processing update:', error);
    res.status(500).send('Error');
  }
};
