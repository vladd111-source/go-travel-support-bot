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

  const firstName = message.from?.first_name || "";
  const lastName = message.from?.last_name || "";
  const username = message.from?.username || "";
  const userId = message.from?.id;

  // 🔍 Логирование
  console.log("🆕 Запрос в поддержку от:");
  console.log(`👤 Имя: ${firstName} ${lastName}`);
  console.log(`🔗 Username: @${username}`);
  console.log(`🆔 ID: ${userId}`);
  console.log(`💬 Сообщение: ${text}`);

  const helpText = `❓ <b>Поддержка Go Travel</b>

<b>— Частые вопросы:</b>
• Как забронировать отель?
• Как сохранить в избранное?
• Почему не загружается перелёт?

✍️ Напиши свой вопрос, и мы ответим как можно скорее.`;

  try {
    if (chatId) {
      // Отправляем FAQ + призыв к действию
      await fetch(`https://api.telegram.org/bot${process.env.BOT_TOKEN}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text: helpText,
          parse_mode: "HTML",
        }),
      });

      // Уведомление менеджера в ЛС (если нужно):
      const managerChatId = process.env.MANAGER_CHAT_ID; // задаётся в .env
      if (managerChatId) {
        const forwardText = `📥 Новый вопрос в поддержку:

👤 ${firstName} ${lastName} (@${username})
🆔 ID: ${userId}

💬 Сообщение: ${text}`;

        await fetch(`https://api.telegram.org/bot${process.env.BOT_TOKEN}/sendMessage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: managerChatId,
            text: forwardText,
          }),
        });
      }
    }

    res.status(200).send("ok");
  } catch (error) {
    console.error("❌ Ошибка отправки сообщения:", error);
    res.status(500).send("Error");
  }
}
