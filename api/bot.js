const bot = require("./botInstance");

module.exports = async (req, res) => {
  try {
    await bot.processUpdate(req.body);
    res.status(200).send("OK");
  } catch (error) {
    console.error("Error processing update:", error);
    res.status(500).send("Error");
  }
};
