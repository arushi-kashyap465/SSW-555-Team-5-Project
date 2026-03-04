document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('authForm');
  const message = document.getElementById('message');
  const signupBtn = document.getElementById('signupBtn');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    message.textContent = '';

    const email = form.email.value.trim();
    const password = form.password.value;

    if (!email || !password) {
      message.textContent = 'Please provide both email and password.';
      return;
    }

    try {
      const res = await fetch('/login', {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({email, password})
      });

      if (res.ok) {
        window.location.href = '/'; // or app landing after auth
      } else {
        const body = await res.json().catch(()=>({error:'Sign in failed'}));
        message.textContent = body.error || 'Sign in failed';
      }
    } catch (err) {
      message.textContent = 'Network error. Try again.';
    }
  });

  signupBtn.addEventListener('click', () => {
    // simple client-side behavior — navigate to a signup route if implemented
    window.location.href = '/signup';
  });
});