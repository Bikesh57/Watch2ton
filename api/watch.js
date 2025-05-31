const fs = require("fs-extra");
const USERS_FILE = "users.json";

const users = fs.existsSync(USERS_FILE) ? fs.readJsonSync(USERS_FILE) : {};

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  // ✅ Accept both 'userId' and fallback to 'telegramId'
  const userId = req.body.userId || req.body.telegramId;
  const user = users[userId];

  if (!user) return res.status(404).json({ success: false, message: "User not found." });

  const now = Date.now();
  if (now - (user.lastReset || 0) >= 24 * 60 * 60 * 1000) {
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
  referrer.earnings = (referrer.earnings || 0) + 5;
  referrer.referrals = [...(referrer.referrals || []), userId];
  user.hasRewardedReferrer = true;
}
  }

  fs.writeJsonSync(USERS_FILE, users);
  res.json({ success: true, coins: user.coins, adsWatched: user.adsWatched });
}
