// ===== PARTICLE CANVAS =====
const canvas = document.getElementById('particles');
const ctx = canvas.getContext('2d');

let particles = [];
let W, H;

function resize() {
  W = canvas.width = window.innerWidth;
  H = canvas.height = window.innerHeight;
}

resize();
window.addEventListener('resize', () => { resize(); initParticles(); });

class Particle {
  constructor() { this.reset(); }
  reset() {
    this.x = Math.random() * W;
    this.y = Math.random() * H;
    this.size = Math.random() * 1.5 + 0.3;
    this.speedX = (Math.random() - 0.5) * 0.3;
    this.speedY = (Math.random() - 0.5) * 0.3;
    this.opacity = Math.random() * 0.5 + 0.1;
    this.gold = Math.random() > 0.75;
  }
  update() {
    this.x += this.speedX;
    this.y += this.speedY;
    if (this.x < 0 || this.x > W || this.y < 0 || this.y > H) this.reset();
  }
  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fillStyle = this.gold
      ? `rgba(240,165,0,${this.opacity})`
      : `rgba(200,200,255,${this.opacity * 0.4})`;
    ctx.fill();
  }
}

function initParticles() {
  const count = Math.floor((W * H) / 12000);
  particles = Array.from({ length: count }, () => new Particle());
}

function animateParticles() {
  ctx.clearRect(0, 0, W, H);
  particles.forEach(p => { p.update(); p.draw(); });

  // Draw connections
  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const dx = particles[i].x - particles[j].x;
      const dy = particles[i].y - particles[j].y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 100) {
        ctx.beginPath();
        ctx.moveTo(particles[i].x, particles[i].y);
        ctx.lineTo(particles[j].x, particles[j].y);
        ctx.strokeStyle = `rgba(240,165,0,${(1 - dist / 100) * 0.07})`;
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }
    }
  }
  requestAnimationFrame(animateParticles);
}

initParticles();
animateParticles();

// ===== NAVBAR SCROLL =====
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 40);
  updateActiveLink();
});

// ===== ACTIVE NAV LINK =====
function updateActiveLink() {
  const sections = ['home', 'about', 'projects', 'contact'];
  const scrollY = window.scrollY + 120;
  sections.forEach(id => {
    const el = document.getElementById(id);
    const link = document.querySelector(`.nav-link[href="#${id}"]`);
    if (!el || !link) return;
    const top = el.offsetTop;
    const bottom = top + el.offsetHeight;
    link.classList.toggle('active', scrollY >= top && scrollY < bottom);
  });
}

// ===== HAMBURGER =====
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');
let menuOpen = false;

hamburger.addEventListener('click', () => {
  menuOpen = !menuOpen;
  mobileMenu.classList.toggle('open', menuOpen);
  const spans = hamburger.querySelectorAll('span');
  if (menuOpen) {
    spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
    spans[1].style.opacity = '0';
    spans[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
  } else {
    spans.forEach(s => { s.style.transform = ''; s.style.opacity = ''; });
  }
});

document.querySelectorAll('.mobile-link').forEach(link => {
  link.addEventListener('click', () => {
    menuOpen = false;
    mobileMenu.classList.remove('open');
    hamburger.querySelectorAll('span').forEach(s => { s.style.transform = ''; s.style.opacity = ''; });
  });
});

// ===== SCROLL REVEAL =====
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const delay = entry.target.dataset.delay || 0;
      setTimeout(() => entry.target.classList.add('visible'), Number(delay));
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.project-card').forEach(card => revealObserver.observe(card));

// ===== COUNTER ANIMATION =====
const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const el = entry.target;
    const target = Number(el.dataset.target);
    const duration = 1800;
    const step = target / (duration / 16);
    let current = 0;
    const update = () => {
      current = Math.min(current + step, target);
      el.textContent = Math.floor(current) + (target === 100 ? '' : '+');
      if (current < target) requestAnimationFrame(update);
      else el.textContent = target + (el.closest('.stat-card') && target < 100 ? '+' : (target === 100 ? '%' : ''));
    };
    requestAnimationFrame(update);
    counterObserver.unobserve(el);
  });
}, { threshold: 0.5 });

document.querySelectorAll('.stat-num').forEach(el => counterObserver.observe(el));

// ===== CONTACT FORM =====
const form = document.getElementById('contactForm');
const successMsg = document.getElementById('formSuccess');

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const btn = form.querySelector('.submit-btn');
  btn.style.opacity = '0.7';
  btn.disabled = true;
  btn.querySelector('span').textContent = 'Sending...';

  const data = new FormData(form);

  try {
    const res = await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      body: data
    });
    const json = await res.json();

    if (json.success) {
      form.reset();
      successMsg.classList.add('show');
      setTimeout(() => successMsg.classList.remove('show'), 5000);
    } else {
      alert('Something went wrong. Please try again.');
    }
  } catch {
    alert('Network error. Please try again.');
  } finally {
    btn.style.opacity = '';
    btn.disabled = false;
    btn.querySelector('span').textContent = 'Send Message';
  }
});

// ===== CONTACT OVERLAY =====
const contactOverlay = document.getElementById('contactOverlay');
const contactClose = document.getElementById('contactClose');

function openContact() {
  contactOverlay.classList.add('open');
  contactOverlay.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}

function closeContact() {
  contactOverlay.classList.remove('open');
  contactOverlay.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

// Nav link click
document.querySelectorAll('.nav-link[href="#contact"], .mobile-link[href="#contact"]').forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    openContact();
    // close mobile menu if open
    if (menuOpen) {
      menuOpen = false;
      mobileMenu.classList.remove('open');
      hamburger.querySelectorAll('span').forEach(s => { s.style.transform = ''; s.style.opacity = ''; });
    }
  });
});

contactClose.addEventListener('click', closeContact);

// Click backdrop to close
contactOverlay.addEventListener('click', e => {
  if (e.target === contactOverlay) closeContact();
});

// ESC key to close
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && contactOverlay.classList.contains('open')) closeContact();
});

// ===== SMOOTH ANCHOR SCROLL =====
document.querySelectorAll('a[href^="#"]').forEach(a => {
  if (a.getAttribute('href') === '#contact') return; // handled by overlay
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth' });
    }
  });
});

// ===== CURSOR GLOW (Desktop) =====
if (window.matchMedia('(pointer: fine)').matches) {
  const glow = document.createElement('div');
  glow.style.cssText = `
    position: fixed; pointer-events: none; z-index: 9999;
    width: 300px; height: 300px; border-radius: 50%;
    background: radial-gradient(circle, rgba(240,165,0,0.04) 0%, transparent 70%);
    transform: translate(-50%, -50%);
    transition: left 0.15s ease, top 0.15s ease;
    mix-blend-mode: screen;
  `;
  document.body.appendChild(glow);
  document.addEventListener('mousemove', e => {
    glow.style.left = e.clientX + 'px';
    glow.style.top = e.clientY + 'px';
  });
}
