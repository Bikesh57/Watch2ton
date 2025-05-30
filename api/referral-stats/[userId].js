const fs = require("fs-extra");
const USERS_FILE = "users.json";

let users = fs.existsSync(USERS_FILE) ? fs.readJsonSync(USERS_FILE) : {};

export default async function handler(req, res) {
  const { userId } = req.query;

  let referrals = 0;
  let bonus = 0;

  for (const id in users) {
    if (users[id].refBy === userId && users[id].hasRewardedReferrer) {
      referrals++;
      bonus += 5;
    }
  }

  res.json({ referrals, bonus });
}
