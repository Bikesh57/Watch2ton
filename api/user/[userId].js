const fs = require("fs-extra");
const USERS_FILE = "users.json";

export default async function handler(req, res) {
  const { userId } = req.query;
  const ref = req.query.ref;

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
  }

  fs.writeJsonSync(USERS_FILE, users);
  res.status(200).json(users[userId]);
}
