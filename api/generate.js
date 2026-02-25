module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const {
    name, position, email, phone, city,
    company, period, duties, education, skills, about,
    language, linkedin, github, portfolio, jobDescription,
    interview
  } = req.body;

  // Определяем язык вывода
  const langNames = {
    ru: 'Russian', en: 'English', de: 'German',
    fr: 'French', es: 'Spanish', it: 'Italian', pl: 'Polish'
  };
  const targetLang = langNames[language] || 'Russian';

  // Блок с ответами из интервью
  let interviewBlock = '';
  if (interview) {
    interviewBlock = `
Interview answers:
- Main achievement: ${interview.achievement || '—'}
- What they enjoy most: ${interview.enjoys || '—'}
- Strength vs others: ${interview.strength || '—'}
- Career goal: ${interview.goal || '—'}`;

    if (interview.specific1_q && interview.specific1_a) {
      interviewBlock += `\n- ${interview.specific1_q} — ${interview.specific1_a}`;
    }
    if (interview.specific2_q && interview.specific2_a) {
      interviewBlock += `\n- ${interview.specific2_q} — ${interview.specific2_a}`;
    }
    if (interview.extra) {
      interviewBlock += `\n- Additional: ${interview.extra}`;
    }
  }

  // Блок с вакансией (если есть)
  const jobBlock = jobDescription
    ? `\nTarget job vacancy — adapt resume keywords to match this:\n${jobDescription}`
    : '';

  const prompt = `You are a professional career consultant with 15 years of experience. Write a professional resume based on the candidate's data. Return ONLY valid JSON, no markdown, no explanations.

OUTPUT LANGUAGE: Write ALL resume text (summary, achievements, education) entirely in ${targetLang}. Every single word of generated content must be in ${targetLang}.

WRITING STYLE: Write in first person ("I developed", "I managed", "I increased" — translated to ${targetLang}). Use concrete details from the interview answers to make the resume personal and authentic, not generic.
${jobDescription ? '\nJOB MATCHING: Naturally incorporate relevant keywords and requirements from the target vacancy into the summary and achievements. Do not copy-paste, integrate naturally.' : ''}
Candidate data:
Name: ${name}
Desired position: ${position}
Email: ${email}
Phone: ${phone}
City: ${city}
Company / Role: ${company}
Period: ${period}
Duties / Achievements: ${duties}
Education: ${education}
Skills: ${skills}
About: ${about}
${interviewBlock}${jobBlock}

Return JSON in this exact format:
{
  "name": "full name",
  "position": "desired position",
  "email": "email",
  "phone": "phone",
  "city": "city",
  "summary": "3-4 sentences in first person in ${targetLang}. Personal, strong, specific. Include interview details.",
  "experience": [
    {
      "company": "company name",
      "role": "position title",
      "period": "period",
      "achievements": [
        "First-person achievement with specific result — in ${targetLang}",
        "First-person achievement with specific result — in ${targetLang}",
        "First-person achievement with specific result — in ${targetLang}"
      ]
    }
  ],
  "education": "institution and specialization — in ${targetLang}",
  "skills": ["skill1", "skill2", "skill3", "skill4", "skill5", "skill6"]
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

    // Добавляем ссылки из формы (AI их не генерирует, просто передаём)
    if (linkedin)  resumeData.linkedin  = linkedin;
    if (github)    resumeData.github    = github;
    if (portfolio) resumeData.portfolio = portfolio;

    res.status(200).json({ resume: resumeData });

  } catch (error) {
    res.status(500).json({ error: 'Ошибка генерации. Попробуй ещё раз.' });
  }
}
