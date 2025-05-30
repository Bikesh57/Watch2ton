const express = require("express");
const fs = require("fs");
const path = require("path");
const bodyParser = require("body-parser");
const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(express.static("frontend"));

const DATA_FILE = path.join(__dirname, "users.json");

function loadUsers() {
  if (!fs.existsSync(DATA_FILE)) return {};
  return JSON.parse(fs.readFileSync(DATA_FILE));
}

function saveUsers(users) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(users, null, 2));
}

app.get("/api/user", (req, res) => {
  const userId = req.query.userId;
  const users = loadUsers();
  const user = users[userId] || { coins: 0, viewsToday: 0, lastViewDate: "", wallet: "" };
  const today = new Date().toISOString().split("T")[0];
  if (user.lastViewDate !== today) {
    user.viewsToday = 0;
    user.lastViewDate = today;
  }
  res.json(user);
});

app.post("/api/claimReward", (req, res) => {
  const { userId } = req.body;
  const users = loadUsers();
  const today = new Date().toISOString().split("T")[0];
  const user = users[userId] || { coins: 0, viewsToday: 0, lastViewDate: "", wallet: "" };

  if (user.lastViewDate !== today) {
    user.viewsToday = 0;
    user.lastViewDate = today;
  }

  if (user.viewsToday >= 10) {
    return res.json({ message: "Daily ad limit reached.", coins: user.coins, viewsToday: user.viewsToday });
  }

  user.viewsToday++;
  user.coins += 10;
  users[userId] = user;
  saveUsers(users);
  res.json({ message: "10 coins added!", coins: user.coins, viewsToday: user.viewsToday });
});

app.post("/api/withdraw", (req, res) => {
  const { userId, wallet } = req.body;
  const users = loadUsers();
  if (!wallet.startsWith("ton://")) return res.json({ message: "Invalid TON wallet URL" });

  users[userId] = users[userId] || { coins: 0, viewsToday: 0, lastViewDate: "", wallet: "" };
  users[userId].wallet = wallet;
  saveUsers(users);
  res.json({ message: "Withdrawal request submitted." });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
