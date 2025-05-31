import fs from "fs-extra";
const USERS_FILE = "users.json";

export default function handler(req, res) {
  const { userId } = req.query;

  if (!userId) {
    return res.status(400).json({ error: "Missing userId" });
  }

  const users = fs.existsSync(USERS_FILE) ? fs.readJsonSync(USERS_FILE) : {};
  const user = users[userId];

  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  // Safely provide fallback values
  res.json({
    referrals: user.referrals || [],
    earnings: user.earnings || 0
  });
}
