export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).send("Method Not Allowed");
  }

  const { message } = req.body;

  if (!message) {
    console.log("⚠️ Нет message в теле запроса");
    return res.status(200).send("No message");
  }

  const chatId = message.chat?.id;
  const text = message.text?.toLowerCase() || "";

  const helpText = `❓ <b>Поддержка Go Travel</b>:

<b>— Частые вопросы:</b>
• Как забронировать отель?
• Как сохранить в избранное?
• Почему не загружается перелёт?

👇 Нажми кнопку ниже, чтобы написать менеджеру:`;

  try {
    if (chatId) {
      await fetch(`https://api.telegram.org/bot${process.env.BOT_TOKEN}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text: helpText,
          parse_mode: "HTML",
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: "📬 Написать менеджеру",
                  url: "https://t.me/your_manager_username" // 🔁 Замени на актуальный username
                }
              ]
            ]
          }
        }),
      });
    }

    res.status(200).send("ok");
  } catch (error) {
    console.error("❌ Ошибка отправки сообщения:", error);
    res.status(500).send("Error");
  }
}
