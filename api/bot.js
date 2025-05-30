// /api/bot.js
const bot = require('../botInstance');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).send('Method Not Allowed');
    return;
  }

  try {
    console.log('Telegram webhook hit');  // Debug line
    await bot.processUpdate(req.body);
    res.status(200).send('OK');
  } catch (error) {
    console.error('Error processing update:', error);
    res.status(500).send('Error');
  }
};
