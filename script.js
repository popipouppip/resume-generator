const form = document.getElementById('resumeForm');
if (form) {
  form.addEventListener('submit', function (e) {
    e.preventDefault();

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

    localStorage.setItem('formData', JSON.stringify(data));
    window.location.href = 'interview.html';
  });
}
