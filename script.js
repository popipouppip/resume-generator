const form = document.getElementById('resumeForm');
if (form) {
  form.addEventListener('submit', async function (e) {
    e.preventDefault();

    const btn = document.getElementById('generateBtn');
    btn.textContent = 'Генерирую...';
    btn.disabled = true;

    const data = {
      name:      document.getElementById('name').value,
      position:  document.getElementById('position').value,
      email:     document.getElementById('email').value,
      phone:     document.getElementById('phone').value,
      city:      document.getElementById('city').value,
      company:   document.getElementById('company').value,
      period:    document.getElementById('period').value,
      duties:    document.getElementById('duties').value,
      education: document.getElementById('education').value,
      skills:    document.getElementById('skills').value,
      about:     document.getElementById('about').value,
    };

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (result.resume) {
        localStorage.setItem('resumeText', result.resume);
        window.location.href = 'result.html';
      } else {
        alert('Ошибка. Попробуй ещё раз.');
        btn.textContent = 'Сгенерировать резюме →';
        btn.disabled = false;
      }
    } catch (error) {
      alert('Ошибка соединения. Попробуй ещё раз.');
      btn.textContent = 'Сгенерировать резюме →';
      btn.disabled = false;
    }
  });
}
