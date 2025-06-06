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

  // 🔍 Лог
  console.log("🆕 Запрос в поддержку от:");
  console.log(`👤 Имя: ${firstName} ${lastName}`);
  console.log(`🔗 Username: @${username}`);
  console.log(`🆔 ID: ${userId}`);
  console.log(`💬 Сообщение: ${text}`);

  const helpText = `❓ <b>Поддержка Go Travel</b>:

<b>— Частые вопросы:</b>
• Как забронировать отель?
• Как сохранить в избранное?
• Почему не загружается перелёт?

👇 Нажми кнопку ниже, чтобы написать менеджеру:`;

  try {
    if (!chatId) {
      return res.status(200).send("No chat ID");
    }

    // ✅ Обработка перехода по ссылке start=user_123456789
    if (text.startsWith("/start user_")) {
      const targetUserId = text.split("_")[1];

      await fetch(`https://api.telegram.org/bot${process.env.BOT_TOKEN}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: process.env.MANAGER_CHAT_ID,
          text: `📥 Пользователь нажал "Написать менеджеру":\n\n👤 <b>${firstName} ${lastName}</b>\n🔗 @${username || "без username"}\n🆔 <code>${targetUserId}</code>`,
          parse_mode: "HTML",
        }),
      });

      await fetch(`https://api.telegram.org/bot${process.env.BOT_TOKEN}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text: "✅ Спасибо! Менеджер скоро с вами свяжется.",
        }),
      });

      return res.status(200).send("ok");
    }

    // Стандартный старт
    if (text === "/start") {
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
                  url: `https://t.me/GoTravelSupportBot?start=user_${userId}`
                }
              ]
            ]
          }
        }),
      });

      return res.status(200).send("ok");
    }

    // Ответ пользователю
    await fetch(`https://api.telegram.org/bot${process.env.BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: "✉️ Спасибо за сообщение! Мы ответим как можно скорее.",
      }),
    });

    // Уведомление менеджеру
    await fetch(`https://api.telegram.org/bot${process.env.BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: process.env.MANAGER_CHAT_ID,
        text: `📨 <b>Новое сообщение от пользователя</b>:\n\n👤 <b>${firstName} ${lastName}</b>\n🔗 @${username || "без username"}\n🆔 <code>${userId}</code>\n\n💬 <i>${message.text}</i>`,
        parse_mode: "HTML",
      }),
    });

    res.status(200).send("ok");
  } catch (error) {
    console.error("❌ Ошибка обработки:", error);
    res.status(500).send("Error");
  }
}
