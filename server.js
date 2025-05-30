const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const TelegramBot = require("node-telegram-bot-api");
const fs = require("fs-extra");

const USERS_FILE = "users.json";
let users = fs.existsSync(USERS_FILE) ? fs.readJsonSync(USERS_FILE) : {};

const app = express();
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const WEBHOOK_URL = process.env.WEBHOOK_URL || "https://watch2ton.vercel.app/api/bot"; // Vercel path must start with /api

if (!TELEGRAM_BOT_TOKEN) {
  throw new Error("Missing TELEGRAM_BOT_TOKEN environment variable");
}

// Initialize bot for webhook mode only
const bot = new TelegramBot(TELEGRAM_BOT_TOKEN);

// Telegram webhook endpoint
app.post("/api/bot", (req, res) => {
  bot.processUpdate(req.body);
  res.sendStatus(200);
});

// Bot logic: on /start
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;

  const keyboard = {
    reply_markup: {
      keyboard: [[
        {
          text: "🚀 Launch Watch2TON",
          web_app: { url: `https://watch2ton.vercel.app/?start=${userId}` }
        }
      ]],
      resize_keyboard: true,
      one_time_keyboard: true
    }
  };

  bot.sendMessage(chatId, "🎉 Welcome to Watch2TON! Click below to launch the app and start earning TON by watching ads.", keyboard);
});

app.use(cors());
app.use(bodyParser.json());
app.use(express.static("public"));

// ===================== API ROUTES =====================

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

  // Reset daily ad limit if 24 hours passed
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

  if (user.adsWatched === 1 && user.refBy && !user.hasRewardedReferrer) {
    const referrer = users[user.refBy];
    if (referrer) {
      referrer.coins += 5;
      user.hasRewardedReferrer = true;
      console.log(`Referrer ${user.refBy} rewarded by ${userId}'s first ad`);
      bot.sendMessage(user.refBy, `🎉 You earned 5 coins from your referral ${userId}'s first ad watch!`);
    }
  }

  fs.writeJsonSync(USERS_FILE, users);

  res.json({
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
  const tonAmount = (withdrawnCoins * 0.0001).toFixed(4);

  user.coins = 0;

  bot.sendMessage(userId, `💸 Withdrawal request received for ${withdrawnCoins} coins (${tonAmount} TON). Processing soon...`);

  fs.writeJsonSync(USERS_FILE, users);

  res.json({
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
