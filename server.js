const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const TelegramBot = require("node-telegram-bot-api");

const fs = require("fs-extra");
const USERS_FILE = "users.json";
let users = fs.existsSync(USERS_FILE) ? fs.readJsonSync(USERS_FILE) : {};

const app = express();
const PORT = 3000;
const NGROK_URL = "https://3dab-2407-1400-aa3d-6250-903b-8cca-1d63-3622.ngrok-free.app";
const TELEGRAM_BOT_TOKEN = "7704408902:AAFnuxZcvt_cFhGGZl2eqwoZlQiv7owWzrs";
const bot = new TelegramBot(TELEGRAM_BOT_TOKEN);



bot.command('start', (ctx) => ctx.reply('Hello from Watch2TON'))

app.use(bot.webhookCallback('/bot'))
bot.setWebhook('https://watch2ton.vercel.app/bot')

app.use(cors());
app.use(bodyParser.json());
app.use(express.static("public"));

// Register /start listener globally
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;

  const keyboard = {
    reply_markup: {
      keyboard: [[
        {
          text: "🚀 Launch Watch2TON",
          web_app: { url: `${NGROK_URL}?start=${userId}` }
        }
      ]],
      resize_keyboard: true,
      one_time_keyboard: true
    }
  };

  bot.sendMessage(chatId, "🎉 Welcome to Watch2TON! Click below to launch the app and start earning TON by watching ads.", keyboard);
});

// Get or create user
app.get("/api/user/:userId", (req, res) => {
  const { userId } = req.params;
  const ref = req.query.ref;

  if (!users[userId]) {
    users[userId] = {
      coins: 0,
      adsWatched: 0,
      refBy: ref || null,
      hasRewardedReferrer: false,
      lastReset: Date.now()
    };
    console.log(`New user ${userId} created. Referred by: ${ref || "none"}`);
  }

  res.json(users[userId]);
});

// Watch ad
app.post("/api/watch", (req, res) => {
  const { userId } = req.body;
  const user = users[userId];

  if (!user) {
    return res.status(404).json({ success: false, message: "User not found." });
  }

  // Reset daily ad limit if 24 hours have passed
  const now = Date.now();
  const lastReset = user.lastReset || 0;
  if (now - lastReset >= 24 * 60 * 60 * 1000) {
    user.adsWatched = 0;
    user.lastReset = now;
  }

  if (user.adsWatched >= 10) {
    return res.status(400).json({ success: false, message: "Ad limit reached for today." });
  }

  user.adsWatched += 1;
  user.coins += 1;

  // Referral bonus for first ad watch
  if (user.adsWatched === 1 && user.refBy && !user.hasRewardedReferrer) {
    const referrer = users[user.refBy];
    if (referrer) {
      referrer.coins += 5;
      user.hasRewardedReferrer = true;
      console.log(`Referrer ${user.refBy} rewarded by ${userId}'s first ad`);
      bot.sendMessage(user.refBy, `🎉 You earned 5 coins from your referral ${userId}'s first ad watch!`);
    }
  }

  // Save user data to file
  fs.writeJsonSync(USERS_FILE, users);

  return res.json({
    success: true,
    coins: user.coins,
    adsWatched: user.adsWatched
  });
});

// Withdraw
app.post("/api/withdraw", (req, res) => {
  const { userId } = req.body;
  const user = users[userId];

  if (!user) {
    return res.status(404).json({ success: false, message: "User not found." });
  }

  if (user.coins < 100) {
    return res.status(400).json({ success: false, message: "You need at least 100 coins (0.01 TON) to withdraw." });
  }

  const withdrawnCoins = user.coins;
  const tonAmount = (withdrawnCoins * 0.0001).toFixed(4); // Rounded to 4 decimal places

  user.coins = 0;

  bot.sendMessage(userId, `💸 Withdrawal request received for ${withdrawnCoins} coins (${tonAmount} TON). Processing soon...`);

  // Save user data to file
  fs.writeJsonSync(USERS_FILE, users);

  return res.json({
    success: true,
    message: `Withdrawal request received for ${tonAmount} TON!`
  });
});

// Referral stats
app.get("/api/referral-stats/:userId", (req, res) => {
  const { userId } = req.params;
  let referrals = 0;
  let bonus = 0;

  for (const id in users) {
    if (users[id].refBy === userId && users[id].hasRewardedReferrer) {
      referrals++;
      bonus += 5;
    }
  }

  res.json({ referrals, bonus });
});

module.exports = app;

