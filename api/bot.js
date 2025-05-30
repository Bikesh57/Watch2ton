import bot from "../../bot";

export default async function handler(req, res) {
  if (req.method === "POST") {
    try {
      await bot.processUpdate(req.body);
      return res.send("OK");
    } catch (err) {
      console.error("Error in bot update:", err);
      return res.status(500).send("Error");
    }
  } else {
    res.status(405).send("Method Not Allowed");
  }
}
