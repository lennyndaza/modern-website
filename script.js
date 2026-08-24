
// ---------- Footer year ----------
document.getElementById('year').textContent = new Date().getFullYear();

// ---------- Navbar scroll state ----------
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () =>
{
  navbar.classList.toggle('scrolled', window.scrollY > 40);
}, { passive: true });

// ---------- Mobile menu ----------
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('navLinks');

hamburger.addEventListener('click', () =>
{
  hamburger.classList.toggle('active');
  navLinks.classList.toggle('mobile-open');
});

navLinks.querySelectorAll('a').forEach(link =>
{
  link.addEventListener('click', () =>
  {
    hamburger.classList.remove('active');
    navLinks.classList.remove('mobile-open');
  });
});

// ---------- Cursor glow ----------
const cursorGlow = document.getElementById('cursorGlow');
const isTouch = window.matchMedia('(pointer: coarse)').matches;

if (!isTouch)
{
  window.addEventListener('mousemove', (e) =>
  {
    cursorGlow.style.opacity = '1';
    cursorGlow.style.left = e.clientX + 'px';
    cursorGlow.style.top = e.clientY + 'px';
  });
  window.addEventListener('mouseleave', () =>
  {
    cursorGlow.style.opacity = '0';
  });
}

// ---------- Scroll reveal ----------
const revealEls = document.querySelectorAll('.reveal');
revealEls.forEach((el, i) => el.style.setProperty('--i', i % 6));

const revealObserver = new IntersectionObserver((entries) =>
{
  entries.forEach(entry =>
  {
    if (entry.isIntersecting)
    {
      entry.target.classList.add('in-view');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

revealEls.forEach(el => revealObserver.observe(el));

// ---------- Animated stat counters ----------
const statNums = document.querySelectorAll('.stat-num');

function animateCount(el)
{
  const target = parseInt(el.dataset.count, 10);
  const duration = 1400;
  const start = performance.now();

  function tick(now)
  {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.round(eased * target);
    if (progress < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

const statsObserver = new IntersectionObserver((entries) =>
{
  entries.forEach(entry =>
  {
    if (entry.isIntersecting)
    {
      animateCount(entry.target);
      statsObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });

statNums.forEach(el => statsObserver.observe(el));

// ---------- Rotating hero word ----------
const typedTextEl = document.getElementById('typedText');
const words = ['digital experiences', 'modern websites', 'lasting brands', 'products people love'];
let wordIndex = 0;

function cycleWord()
{
  wordIndex = (wordIndex + 1) % words.length;
  typedTextEl.style.opacity = '0';
  setTimeout(() =>
  {
    typedTextEl.textContent = words[wordIndex];
    typedTextEl.style.opacity = '1';
  }, 400);
}
typedTextEl.style.transition = 'opacity 0.4s ease';
setInterval(cycleWord, 3200);

// ---------- EmailJS config ----------
// Sign up at https://www.emailjs.com, then replace these three values with
// your own Public Key, Service ID, and Template ID from the EmailJS dashboard.
const EMAILJS_PUBLIC_KEY = 'YOUR_PUBLIC_KEY';
const EMAILJS_SERVICE_ID = 'YOUR_SERVICE_ID';
const EMAILJS_TEMPLATE_ID = 'YOUR_TEMPLATE_ID';

if (window.emailjs)
{
  emailjs.init({ publicKey: EMAILJS_PUBLIC_KEY });
}

// ---------- Contact form validation & submit ----------
const form = document.getElementById('contactForm');
const submitBtn = document.getElementById('submitBtn');
const formStatus = document.getElementById('formStatus');
const honeypot = document.getElementById('company');

const SUBMIT_COOLDOWN_MS = 60 * 1000;
const LAST_SUBMIT_KEY = 'novaContactLastSubmit';

const fields = form.querySelectorAll('input[required], textarea[required]');

fields.forEach(field =>
{
  field.addEventListener('blur', () => field.classList.add('touched'));
  field.addEventListener('input', () =>
  {
    if (field.classList.contains('touched'))
    {
      // re-validate live once touched
      field.checkValidity();
    }
  });
});

form.addEventListener('submit', (e) =>
{
  e.preventDefault();

  formStatus.classList.remove('success', 'error');

  // Honeypot: real visitors never see or fill this field. If it has a
  // value, the submission came from a bot — pretend it worked and stop.
  if (honeypot.value.trim() !== '')
  {
    formStatus.textContent = "Thanks! Your message has been sent — we'll be in touch soon.";
    formStatus.classList.add('success');
    form.reset();
    fields.forEach(field => field.classList.remove('touched'));
    return;
  }

  const lastSubmit = Number(localStorage.getItem(LAST_SUBMIT_KEY) || 0);
  const msSinceLast = Date.now() - lastSubmit;
  if (msSinceLast < SUBMIT_COOLDOWN_MS)
  {
    const waitSeconds = Math.ceil((SUBMIT_COOLDOWN_MS - msSinceLast) / 1000);
    formStatus.textContent = `Please wait ${waitSeconds}s before sending another message.`;
    formStatus.classList.add('error');
    return;
  }

  let isValid = true;
  fields.forEach(field =>
  {
    field.classList.add('touched');
    if (!field.checkValidity()) isValid = false;
  });

  if (!isValid)
  {
    formStatus.textContent = 'Please fix the highlighted fields.';
    formStatus.classList.add('error');
    return;
  }

  submitBtn.classList.add('loading');
  submitBtn.disabled = true;
  formStatus.textContent = '';

  emailjs.sendForm(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, form)
    .then(() =>
    {
      localStorage.setItem(LAST_SUBMIT_KEY, String(Date.now()));
      formStatus.textContent = "Thanks! Your message has been sent — we'll be in touch soon.";
      formStatus.classList.remove('error');
      formStatus.classList.add('success');
      form.reset();
      fields.forEach(field => field.classList.remove('touched'));
    })
    .catch((err) =>
    {
      console.error('EmailJS error:', err);
      formStatus.textContent = "Something went wrong sending your message. Please try again or email us directly.";
      formStatus.classList.remove('success');
      formStatus.classList.add('error');
    })
    .finally(() =>
    {
      submitBtn.classList.remove('loading');
      submitBtn.disabled = false;
    });
});
