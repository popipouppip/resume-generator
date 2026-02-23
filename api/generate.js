export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, position, email, phone, city, company, period, duties, education, skills, about } = req.body;

  const prompt = `Ты профессиональный HR-специалист. Напиши профессиональное резюме на русском языке на основе этих данных:

Имя: ${name}
Желаемая должность: ${position}
Email: ${email}
Телефон: ${phone}
Город: ${city}
Компания и должность: ${company}
Период работы: ${period}
Обязанности: ${duties}
Образование: ${education}
Навыки: ${skills}
О себе: ${about}

Напиши резюме в таком формате (используй эти точные заголовки):

ИМЯ: [имя]
ДОЛЖНОСТЬ: [желаемая должность]
КОНТАКТЫ: [email] | [телефон] | [город]

О СЕБЕ:
[2-3 предложения, раскрывающие сильные стороны кандидата, написанные профессионально]

ОПЫТ РАБОТЫ:
[компания и должность] | [период]
[3-4 пункта с конкретными достижениями, начинай каждый с глагола действия]

ОБРАЗОВАНИЕ:
[учебное заведение и специальность]

НАВЫКИ:
[навыки через запятую, добавь релевантные навыки для должности]

Пиши убедительно и профессионально. Подчеркни сильные стороны кандидата.`;

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
        max_tokens: 1000,
      }),
    });

    const data = await response.json();
    const resumeText = data.choices[0].message.content;

    res.status(200).json({ resume: resumeText });
  } catch (error) {
    res.status(500).json({ error: 'Ошибка генерации. Попробуй ещё раз.' });
  }
}
