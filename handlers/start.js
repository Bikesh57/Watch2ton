const bot = require("../bot");

function handleStart(msg) {
  const chatId = msg.chat.id;
  const userId = msg.from.id;

  const keyboard = {
    reply_markup: {
      keyboard: [[
        {
          text: "🚀 Launch Watch2TON",
          web_app: { url: `https://watch2ton.vercel.app?start=${userId}` }
        }
      ]],
      resize_keyboard: true,
      one_time_keyboard: true
    }
  };

  bot.sendMessage(chatId, "🎉 Welcome to Watch2TON! Click below to launch the app and start earning TON by watching ads.", keyboard);
}

module.exports = handleStart;
