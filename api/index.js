export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).send("Method Not Allowed");
  }

  const { message } = req.body;

  if (!message) {
    console.log("Нет message в теле запроса");
    return res.status(200).send("No message");
  }

  const chatId = message.chat?.id;
  const text = message.text?.toLowerCase() || "";

  const helpText = `❓ Поддержка Go Travel:

— Частые вопросы:
• Как забронировать отель?
• Как сохранить в избранное?
• Почему не загружается перелёт?

📬 Напиши менеджеру: @your_manager_username`;

  try {
    if (chatId) {
      await fetch(`https://api.telegram.org/bot${process.env.BOT_TOKEN}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: chatId, text: helpText }),
      });
    }

    res.status(200).send("ok");
  } catch (error) {
    console.error("❌ Ошибка отправки сообщения:", error);
    res.status(500).send("Error");
  }
}
