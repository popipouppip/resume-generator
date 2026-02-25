const form = document.getElementById('resumeForm');
if (form) {
  form.addEventListener('submit', function (e) {
    e.preventDefault();

    // Собираем все места работы
    const jobs = [];
    document.querySelectorAll('.job-entry').forEach(entry => {
      const company = entry.querySelector('.job-company').value.trim();
      const period  = entry.querySelector('.job-period').value.trim();
      const duties  = entry.querySelector('.job-duties').value.trim();
      if (company || duties) jobs.push({ company, period, duties });
    });

    // Собираем все образования
    const educations = [];
    document.querySelectorAll('.edu-field').forEach(field => {
      const val = field.value.trim();
      if (val) educations.push(val);
    });

    const data = {
      name:           document.getElementById('name').value.trim(),
      position:       document.getElementById('position').value.trim(),
      email:          document.getElementById('email').value.trim(),
      phone:          document.getElementById('phone').value.trim(),
      city:           document.getElementById('city').value.trim(),
      jobs,
      educations,
      skills:         document.getElementById('skills').value.trim(),
      about:          document.getElementById('about').value.trim(),
      language:       document.getElementById('language').value,
      linkedin:       document.getElementById('linkedin').value.trim(),
      github:         document.getElementById('github').value.trim(),
      portfolio:      document.getElementById('portfolio').value.trim(),
      targetCompany:  document.getElementById('targetCompany').value.trim(),
      jobDescription: document.getElementById('jobDescription').value.trim(),
    };

    localStorage.setItem('formData', JSON.stringify(data));
    window.location.href = 'interview.html';
  });
}
