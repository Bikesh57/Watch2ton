const fs = require("fs-extra");
const USERS_FILE = "users.json";

let users = fs.existsSync(USERS_FILE) ? fs.readJsonSync(USERS_FILE) : {};

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { userId } = req.body;
  const user = users[userId];

  if (!user) return res.status(404).json({ success: false, message: "User not found." });

  if (user.coins < 100) {
    return res.status(400).json({ success: false, message: "You need at least 100 coins (0.01 TON) to withdraw." });
  }

  const withdrawnCoins = user.coins;
  const tonAmount = (withdrawnCoins * 0.0001).toFixed(4);
  user.coins = 0;

  fs.writeJsonSync(USERS_FILE, users);
  res.json({ success: true, message: `Withdrawal request received for ${tonAmount} TON!` });
}
