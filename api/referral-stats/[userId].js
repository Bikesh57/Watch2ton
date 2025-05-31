const fs = require('fs');
const path = require('path');

export default function handler(req, res) {
  const { userId } = req.query;
  if (!userId) return res.status(400).json({ error: 'Missing userId' });

  const usersPath = path.join(process.cwd(), 'users.json');

  if (!fs.existsSync(usersPath)) {
    return res.status(404).json({ error: 'Users file not found' });
  }

  const users = JSON.parse(fs.readFileSync(usersPath, 'utf-8'));
  const user = users[userId];

  if (!user) return res.status(404).json({ error: 'User not found' });

  res.status(200).json({
    referrals: user.referrals || [],
    earnings: user.earnings || 0,
  });
}
