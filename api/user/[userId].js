const fs = require("fs-extra");
const USERS_FILE = "users.json";

export default async function handler(req, res) {
  const { userId, ref } = req.query;

  if (!userId) {
    return res.status(400).json({ error: "Missing userId in query" });
  }

  let users = fs.existsSync(USERS_FILE) ? fs.readJsonSync(USERS_FILE) : {};

  if (!users[userId]) {
    users[userId] = {
      coins: 0,
      adsWatched: 0,
      refBy: ref || null,
      hasRewardedReferrer: false,
      lastReset: Date.now()
    };
    console.log(`🆕 New user: ${userId}, Referred by: ${ref || "None"}`);
    fs.writeJsonSync(USERS_FILE, users); // Only write when a new user is added
  }

  res.status(200).json(users[userId]);
}
