module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const {
    name, position, email, phone, city,
    company, period, duties, education, skills, about,
    interview
  } = req.body;

  let interviewBlock = '';
  if (interview) {
    interviewBlock = `
Ответы кандидата на интервью:
- Главное достижение: ${interview.achievement || '—'}
- Что нравится в работе: ${interview.enjoys || '—'}
- В чём сильнее других: ${interview.strength || '—'}
- Карьерная цель: ${interview.goal || '—'}`;

    if (interview.specific1_q && interview.specific1_a) {
      interviewBlock += `\n- ${interview.specific1_q} — ${interview.specific1_a}`;
    }
    if (interview.specific2_q && interview.specific2_a) {
      interviewBlock += `\n- ${interview.specific2_q} — ${interview.specific2_a}`;
    }
    if (interview.extra) {
      interviewBlock += `\n- Дополнительно: ${interview.extra}`;
    }
  }

  const prompt = `Ты профессиональный карьерный консультант с 15-летним опытом. На основе данных кандидата напиши профессиональное резюме. Верни ТОЛЬКО валидный JSON без markdown, без пояснений.

ВАЖНО: Весь текст резюме пиши от первого лица — "я работал", "я разработал", "я увеличил". Не пиши "кандидат" или "он/она". Используй живые, конкретные детали из ответов на интервью — они делают резюме настоящим, а не шаблонным.

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
${interviewBlock}

Верни JSON в таком формате:
{
  "name": "полное имя",
  "position": "желаемая должность",
  "email": "email",
  "phone": "телефон",
  "city": "город",
  "summary": "3-4 предложения от первого лица. Живое, личное, сильное. Используй детали из интервью. Например: 'Я специалист с X-летним опытом...'",
  "experience": [
    {
      "company": "название компании",
      "role": "должность",
      "period": "период",
      "achievements": [
        "Я разработал/внедрил/достиг... — конкретный результат с деталями из интервью",
        "Я разработал/внедрил/достиг... — конкретный результат",
        "Я разработал/внедрил/достиг... — конкретный результат"
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
        max_tokens: 1500,
      }),
    });

    const data = await response.json();
    const text = data.choices[0].message.content;

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON found');

    const resumeData = JSON.parse(jsonMatch[0]);
    res.status(200).json({ resume: resumeData });

  } catch (error) {
    res.status(500).json({ error: 'Ошибка генерации. Попробуй ещё раз.' });
  }
}
