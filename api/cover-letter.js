module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, position, company, jobDescription, summary, language, skills } = req.body;

  const langNames = {
    ru: 'Russian', en: 'English', de: 'German',
    fr: 'French', es: 'Spanish', it: 'Italian', pl: 'Polish'
  };
  const targetLang = langNames[language] || 'Russian';

  const prompt = `You are a professional career consultant. Write a compelling, warm, and specific cover letter in ${targetLang}.

Candidate: ${name}
Applying for: ${position}
${company ? `Company / Team: ${company}` : ''}
${jobDescription ? `Job description: ${jobDescription}` : ''}
Professional summary: ${summary}
Key skills: ${(skills || []).join(', ')}

Write the cover letter so that:
- It opens with genuine interest in the specific role (not generic)
- Second paragraph highlights 2-3 concrete achievements/strengths from the profile
- Closing paragraph ends with a confident call to action
- Tone is professional but human — not robotic or template-like
- Total length: 3 short paragraphs maximum

Return ONLY valid JSON, no markdown, no extra text:
{
  "greeting": "greeting line in ${targetLang}",
  "opening": "first paragraph — why this role and what value they bring",
  "body": "second paragraph — specific achievements that match the role",
  "closing": "third paragraph — call to action and contact",
  "signature": "sign-off line with name in ${targetLang}"
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
        max_tokens: 900,
      }),
    });

    const data = await response.json();
    const text = data.choices[0].message.content;

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON found');

    const letter = JSON.parse(jsonMatch[0]);
    res.status(200).json({ letter });

  } catch (error) {
    res.status(500).json({ error: 'Ошибка генерации письма. Попробуй ещё раз.' });
  }
};
