/**
 * Lonzen & Heucher GmbH – main.js
 * Vanilla JavaScript: navigation, scroll effects, form validation, animations
 */

'use strict';

/* ============================================================
   1. DOM References
   ============================================================ */
const header      = document.getElementById('site-header');
const hamburger   = document.getElementById('hamburger');
const mobileMenu  = document.getElementById('mobile-menu');
const contactForm = document.getElementById('contact-form');
const yearEl      = document.getElementById('year');

/* ============================================================
   2. Current Year in Footer
   ============================================================ */
if (yearEl) {
  yearEl.textContent = new Date().getFullYear();
}

/* ============================================================
   3. Header Scroll Shadow
   Adds a shadow class when the user scrolls past 10px
   ============================================================ */
function onScroll() {
  if (window.scrollY > 10) {
    header.classList.add('scrolled');
  } else {
    header.classList.remove('scrolled');
  }

  // Also update active nav link
  updateActiveNavLink();
}

window.addEventListener('scroll', onScroll, { passive: true });

/* ============================================================
   4. Active Navigation Link Tracking
   Highlights the nav link corresponding to the visible section
   ============================================================ */
const sections   = document.querySelectorAll('main section[id]');
const navLinks   = document.querySelectorAll('.nav-link');

function updateActiveNavLink() {
  let currentId = '';
  const scrollPos = window.scrollY + 100; // offset for header height

  sections.forEach(section => {
    if (scrollPos >= section.offsetTop) {
      currentId = section.getAttribute('id');
    }
  });

  navLinks.forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('href') === `#${currentId}`) {
      link.classList.add('active');
    }
  });
}

/* ============================================================
   5. Mobile Menu Toggle
   ============================================================ */
if (hamburger && mobileMenu) {
  hamburger.addEventListener('click', () => {
    const isOpen = hamburger.classList.toggle('is-open');
    mobileMenu.classList.toggle('is-open', isOpen);
    hamburger.setAttribute('aria-expanded', String(isOpen));
    mobileMenu.setAttribute('aria-hidden', String(!isOpen));
  });

  // Close mobile menu when a link is clicked
  mobileMenu.querySelectorAll('.mobile-nav__link').forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('is-open');
      mobileMenu.classList.remove('is-open');
      hamburger.setAttribute('aria-expanded', 'false');
      mobileMenu.setAttribute('aria-hidden', 'true');
    });
  });

  // Close mobile menu when clicking outside
  document.addEventListener('click', (e) => {
    if (
      mobileMenu.classList.contains('is-open') &&
      !header.contains(e.target)
    ) {
      hamburger.classList.remove('is-open');
      mobileMenu.classList.remove('is-open');
      hamburger.setAttribute('aria-expanded', 'false');
      mobileMenu.setAttribute('aria-hidden', 'true');
    }
  });
}

/* ============================================================
   6. Smooth Scroll for Anchor Links
   Adds offset to account for the fixed header
   ============================================================ */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', (e) => {
    const targetId = anchor.getAttribute('href');
    if (targetId === '#') return;

    const targetEl = document.querySelector(targetId);
    if (!targetEl) return;

    e.preventDefault();

    const headerHeight = header.offsetHeight;
    const targetTop = targetEl.getBoundingClientRect().top + window.scrollY - headerHeight;

    window.scrollTo({
      top: targetTop,
      behavior: 'smooth'
    });
  });
});

/* ============================================================
   7. Intersection Observer – Fade-In Animations
   Elements with class .fade-in animate in when they enter the viewport
   ============================================================ */
const fadeObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        // Once animated, stop observing
        fadeObserver.unobserve(entry.target);
      }
    });
  },
  {
    threshold: 0.12,     // trigger when 12% is visible
    rootMargin: '0px 0px -40px 0px'
  }
);

// Observe all elements marked for animation
document.querySelectorAll('.fade-in').forEach(el => {
  fadeObserver.observe(el);
});

// Add fade-in class to key elements programmatically
// (avoids needing to hard-code in HTML for every element)
function initFadeAnimations() {
  const animatableSelectors = [
    '.intro-strip__item',
    '.service-card',
    '.gallery__item',
    '.about__text',
    '.about__image-wrap',
    '.about-teaser__text',
    '.about-teaser__images',
  ];

  animatableSelectors.forEach(selector => {
    document.querySelectorAll(selector).forEach((el, i) => {
      el.classList.add('fade-in');
      // Add staggered delay for grid items
      if (i > 0 && i <= 4) {
        el.classList.add(`fade-in--delay-${i}`);
      }
      fadeObserver.observe(el);
    });
  });
}

initFadeAnimations();

/* ============================================================
   8. Contact Form Validation & Submission
   ============================================================ */
if (contactForm) {

  /**
   * Validates a single form field.
   * @param {HTMLInputElement|HTMLSelectElement|HTMLTextAreaElement} field
   * @returns {boolean} true if valid
   */
  function validateField(field) {
    const errorEl = document.getElementById(`${field.id}-error`);
    let message = '';

    if (field.type === 'checkbox') {
      if (!field.checked) {
        message = 'Bitte stimmen Sie der Datenschutzerklärung zu.';
      }
    } else if (field.value.trim() === '' && field.required) {
      message = 'Dieses Feld ist erforderlich.';
    } else if (field.type === 'email' && field.value.trim() !== '') {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(field.value.trim())) {
        message = 'Bitte geben Sie eine gültige E-Mail-Adresse ein.';
      }
    } else if (field.tagName === 'SELECT' && field.value === '' && field.required) {
      message = 'Bitte wählen Sie eine Option aus.';
    }

    if (errorEl) {
      errorEl.textContent = message;
      errorEl.classList.toggle('is-visible', message !== '');
    }

    field.classList.toggle('has-error', message !== '');
    return message === '';
  }

  // Validate on blur (when user leaves a field)
  contactForm.querySelectorAll('input, select, textarea').forEach(field => {
    field.addEventListener('blur', () => validateField(field));
    field.addEventListener('input', () => {
      // Clear error as user types
      if (field.classList.contains('has-error')) {
        validateField(field);
      }
    });
  });

  // Form submission
  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();

    // Validate all required fields
    const fieldsToValidate = contactForm.querySelectorAll('[required]');
    let isFormValid = true;

    fieldsToValidate.forEach(field => {
      if (!validateField(field)) {
        isFormValid = false;
      }
    });

    if (!isFormValid) {
      // Focus first error field
      const firstError = contactForm.querySelector('.has-error');
      if (firstError) firstError.focus();
      return;
    }

    // --- Simulate form submission ---
    // In production: replace this block with a fetch() call to your backend/email service
    const submitBtn = contactForm.querySelector('[type="submit"]');
    const successMsg = document.getElementById('form-success');

    submitBtn.disabled = true;
    submitBtn.textContent = 'Wird gesendet …';

    // Simulate async request (1.2 seconds)
    setTimeout(() => {
      contactForm.reset();
      submitBtn.disabled = false;
      submitBtn.textContent = 'Nachricht senden';

      if (successMsg) {
        successMsg.hidden = false;
        successMsg.scrollIntoView({ behavior: 'smooth', block: 'center' });

        // Hide success message after 8 seconds
        setTimeout(() => {
          successMsg.hidden = true;
        }, 8000);
      }
    }, 1200);
  });
}

/* ============================================================
   9. Gallery – Lightbox (simple, no dependencies)
   Click a gallery image to view it fullscreen
   ============================================================ */
(function initLightbox() {
  // Create overlay elements
  const overlay = document.createElement('div');
  overlay.id = 'lightbox-overlay';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.setAttribute('aria-label', 'Bildansicht');
  overlay.style.cssText = `
    display: none;
    position: fixed;
    inset: 0;
    z-index: 9999;
    background: rgba(0,0,0,0.88);
    align-items: center;
    justify-content: center;
    cursor: zoom-out;
    padding: 1rem;
  `;

  const lightboxImg = document.createElement('img');
  lightboxImg.style.cssText = `
    max-width: min(90vw, 1000px);
    max-height: 85vh;
    border-radius: 6px;
    box-shadow: 0 8px 40px rgba(0,0,0,0.6);
    object-fit: contain;
    cursor: default;
  `;

  const closeBtn = document.createElement('button');
  closeBtn.innerHTML = '&times;';
  closeBtn.setAttribute('aria-label', 'Schließen');
  closeBtn.style.cssText = `
    position: absolute;
    top: 1rem;
    right: 1.25rem;
    background: none;
    border: none;
    color: #fff;
    font-size: 2.5rem;
    line-height: 1;
    cursor: pointer;
    opacity: 0.8;
  `;

  overlay.appendChild(closeBtn);
  overlay.appendChild(lightboxImg);
  document.body.appendChild(overlay);

  function openLightbox(src, alt) {
    lightboxImg.src = src;
    lightboxImg.alt = alt || '';
    overlay.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    closeBtn.focus();
  }

  function closeLightbox() {
    overlay.style.display = 'none';
    document.body.style.overflow = '';
  }

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay || e.target === closeBtn) {
      closeLightbox();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && overlay.style.display === 'flex') {
      closeLightbox();
    }
  });

  // Attach click handlers to gallery images
  document.querySelectorAll('.gallery__item img').forEach(img => {
    img.style.cursor = 'zoom-in';
    img.addEventListener('click', () => {
      openLightbox(img.src, img.alt);
    });
  });
})();

/* ============================================================
   10. Initialise on DOMContentLoaded
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  // Trigger initial scroll check (in case page loads mid-scroll)
  onScroll();
  updateActiveNavLink();
});
