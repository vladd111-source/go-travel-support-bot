export default async function handler(req, res) {
  if (req.method === "POST") {
    const { message } = req.body;
    const chatId = message?.chat?.id;
    const text = message?.text?.toLowerCase();

    const helpText = `❓ Поддержка Go Travel:

— Частые вопросы:
• Как забронировать отель?
• Как сохранить в избранное?
• Почему не загружается перелёт?

📬 Напиши менеджеру: @your_manager_username`;

    if (chatId) {
      await fetch(`https://api.telegram.org/bot${process.env.BOT_TOKEN}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: chatId, text: helpText }),
      });
    }

    return res.status(200).send("ok");
  }

  res.status(405).send("Method Not Allowed");
}
