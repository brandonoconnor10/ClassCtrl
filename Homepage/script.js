// Navigation toggle for mobile
const navToggle = document.querySelector('.nav-toggle');
const navLinks = document.querySelector('.nav-links');

navToggle.addEventListener('click', () => {
  navLinks.classList.toggle('nav-active');
  navToggle.classList.toggle('toggle-active');
});

// Smooth scroll for nav links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const targetId = this.getAttribute('href').substring(1);
    const targetElement = document.getElementById(targetId);
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: 'smooth' });
      // Update active class
      document.querySelectorAll('.nav-links a').forEach(link => link.classList.remove('active'));
      this.classList.add('active');
      // Close mobile menu if open
      navLinks.classList.remove('nav-active');
      navToggle.classList.remove('toggle-active');
    }
  });
});

// Scroll to section on page load if URL has a hash
window.addEventListener('DOMContentLoaded', () => {
  const hash = window.location.hash; // e.g., "#features"
  if (hash) {
    const targetElement = document.querySelector(hash);
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: 'smooth' });
      // Update active class for nav link
      document.querySelectorAll('.nav-links a').forEach(link => link.classList.remove('active'));
      const activeLink = document.querySelector(`.nav-links a[href="${hash}"]`);
      if (activeLink) {
        activeLink.classList.add('active');
      }
    }
  }
});

// Scroll animation for elements
const animateOnScrollElements = document.querySelectorAll('.animate-on-scroll');

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
    }
  });
}, { threshold: 0.2 });

animateOnScrollElements.forEach(element => observer.observe(element));