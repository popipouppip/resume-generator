module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { position } = req.body;

  const prompt = `Ты дружелюбный карьерный консультант. Тебе нужно придумать ровно 2 вопроса для интервью, специфичных для профессии: "${position}".

Вопросы должны быть живыми, неожиданными, тёплыми — не скучными HR-вопросами. Задавай про то, что реально важно именно в этой профессии. Примеры духа вопросов (НЕ копируй, придумай свои для данной профессии):
- Для повара: "Какое блюдо ты готовишь с особой гордостью и почему?"
- Для программиста: "Какой баг или задача тебя однажды по-настоящему захватила?"
- Для учителя: "Был ли момент, когда ты видел как у ученика что-то щёлкнуло — и как это на тебя повлияло?"

Верни ТОЛЬКО валидный JSON без markdown:
{
  "questions": [
    "Первый вопрос?",
    "Второй вопрос?"
  ]
}`;

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.9,
        max_tokens: 300,
      }),
    });

    const data = await response.json();
    const text = data.choices[0].message.content;

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON');

    const parsed = JSON.parse(jsonMatch[0]);
    res.status(200).json({ questions: parsed.questions || [] });

  } catch {
    // Если что-то пошло не так — возвращаем пустой массив, интервью продолжится без спецвопросов
    res.status(200).json({ questions: [] });
  }
}
