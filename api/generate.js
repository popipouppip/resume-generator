module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, position, email, phone, city, company, period, duties, education, skills, about } = req.body;

  const prompt = `Ты профессиональный карьерный консультант с 15-летним опытом. На основе данных кандидата напиши профессиональное резюме. Верни ТОЛЬКО валидный JSON без markdown, без пояснений.

Данные кандидата:
Имя: ${name}
Должность: ${position}
Email: ${email}
Телефон: ${phone}
Город: ${city}
Компания: ${company}
Период: ${period}
Обязанности: ${duties}
Образование: ${education}
Навыки: ${skills}
О себе: ${about}

Верни JSON в таком формате:
{
  "name": "полное имя",
  "position": "желаемая должность",
  "email": "email",
  "phone": "телефон",
  "city": "город",
  "summary": "3-4 предложения. Сильное профессиональное резюме кандидата. Подчеркни экспертизу, ключевые достижения и ценность для работодателя. Пиши от третьего лица.",
  "experience": [
    {
      "company": "название компании",
      "role": "должность",
      "period": "период",
      "achievements": [
        "Конкретное достижение с цифрами или результатом",
        "Конкретное достижение с цифрами или результатом",
        "Конкретное достижение с цифрами или результатом"
      ]
    }
  ],
  "education": "учебное заведение и специальность",
  "skills": ["навык1", "навык2", "навык3", "навык4", "навык5", "навык6"]
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
        temperature: 0.7,
        max_tokens: 1200,
      }),
    });

    const data = await response.json();
    const text = data.choices[0].message.content;

    // Извлекаем JSON из ответа
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON found');

    const resumeData = JSON.parse(jsonMatch[0]);
    res.status(200).json({ resume: resumeData });

  } catch (error) {
    res.status(500).json({ error: 'Ошибка генерации. Попробуй ещё раз.' });
  }
}
