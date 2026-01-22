/* ═══════════════════════════════════════════════════════════════════════════
   GLISH LANDING PAGE - JAVASCRIPT
   FAQ accordion, form validation, header scroll, and interactions
   ═══════════════════════════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', function () {
    // Initialize all components
    initHeader();
    initFAQAccordion();
    initForms();
    initSmoothScroll();
    initCountdownTimer();
});

/* ─────────────────────────────────────────────────────────────────────────────
   COUNTDOWN TIMER (15 minutes)
   ───────────────────────────────────────────────────────────────────────────── */
function initCountdownTimer() {
    const minutesEl = document.getElementById('countdown-minutes');
    const secondsEl = document.getElementById('countdown-seconds');
    const urgencyBar = document.getElementById('urgency-bar');

    if (!minutesEl || !secondsEl || !urgencyBar) return;

    // Check if there's a saved end time in localStorage
    let endTime = localStorage.getItem('glish_countdown_end');

    if (!endTime) {
        // Set 15 minutes from now
        endTime = Date.now() + (15 * 60 * 1000);
        localStorage.setItem('glish_countdown_end', endTime);
    } else {
        endTime = parseInt(endTime);
    }

    function updateCountdown() {
        const now = Date.now();
        const remaining = endTime - now;

        if (remaining <= 0) {
            // Timer expired
            minutesEl.textContent = '00';
            secondsEl.textContent = '00';
            urgencyBar.classList.add('urgency-bar--expired');

            // Update text to show expired message
            const textElements = urgencyBar.querySelectorAll('.urgency-bar__text');
            if (textElements.length >= 2) {
                textElements[0].innerHTML = '⏰ <strong>La oferta expiró</strong>';
                textElements[1].innerHTML = 'pero aún puedes <strong>agendar tu diagnóstico gratis</strong>';
            }

            return; // Stop the timer
        }

        const minutes = Math.floor(remaining / 60000);
        const seconds = Math.floor((remaining % 60000) / 1000);

        minutesEl.textContent = minutes.toString().padStart(2, '0');
        secondsEl.textContent = seconds.toString().padStart(2, '0');

        // Continue updating
        requestAnimationFrame(updateCountdown);
    }

    // Start countdown
    updateCountdown();
}

/* ─────────────────────────────────────────────────────────────────────────────
   HEADER SCROLL BEHAVIOR
   ───────────────────────────────────────────────────────────────────────────── */
function initHeader() {
    const header = document.getElementById('header');
    let lastScroll = 0;

    window.addEventListener('scroll', function () {
        const currentScroll = window.pageYOffset;

        // Add scrolled class when page is scrolled
        if (currentScroll > 50) {
            header.classList.add('header--scrolled');
        } else {
            header.classList.remove('header--scrolled');
        }

        lastScroll = currentScroll;
    });
}

/* ─────────────────────────────────────────────────────────────────────────────
   FAQ ACCORDION
   ───────────────────────────────────────────────────────────────────────────── */
function initFAQAccordion() {
    const faqItems = document.querySelectorAll('.faq-item');

    faqItems.forEach(item => {
        const question = item.querySelector('.faq-item__question');

        question.addEventListener('click', function () {
            const isActive = item.classList.contains('active');

            // Close all other items
            faqItems.forEach(otherItem => {
                if (otherItem !== item) {
                    otherItem.classList.remove('active');
                    otherItem.querySelector('.faq-item__question').setAttribute('aria-expanded', 'false');
                }
            });

            // Toggle current item
            item.classList.toggle('active');
            question.setAttribute('aria-expanded', !isActive);
        });

        // Keyboard accessibility
        question.addEventListener('keydown', function (e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                question.click();
            }
        });
    });
}

/* ─────────────────────────────────────────────────────────────────────────────
   FORM VALIDATION & SUBMISSION
   ───────────────────────────────────────────────────────────────────────────── */
function initForms() {
    const forms = document.querySelectorAll('.lead-form');

    forms.forEach(form => {
        form.addEventListener('submit', handleFormSubmit);

        // Add real-time validation
        const inputs = form.querySelectorAll('input, select');
        inputs.forEach(input => {
            input.addEventListener('blur', validateField);
            input.addEventListener('input', clearError);
        });
    });
}

function handleFormSubmit(e) {
    e.preventDefault();

    const form = e.target;
    const formData = new FormData(form);
    let isValid = true;

    // Validate all fields
    const fields = form.querySelectorAll('input, select');
    fields.forEach(field => {
        if (!validateField({ target: field })) {
            isValid = false;
        }
    });

    if (!isValid) {
        return;
    }

    // Collect form data
    const data = {
        name: formData.get('name'),
        whatsapp: formData.get('whatsapp'),
        schedule: formData.get('schedule'),
        timestamp: new Date().toLocaleString('es-MX'),
        source: window.location.href
    };

    // Disable submit button and show loading
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="loading-spinner"></span> Enviando...';

    // ═══════════════════════════════════════════════════════════════════════
    // GOOGLE SHEETS CONFIGURATION
    // ═══════════════════════════════════════════════════════════════════════
    // 1. Create a Google Sheet
    // 2. Go to Extensions > Apps Script
    // 3. Paste the code from google-apps-script.js (created in your project)
    // 4. Deploy as web app (allow anonymous access)
    // 5. Copy the URL and paste it below
    const GOOGLE_SHEETS_URL = 'https://script.google.com/a/macros/grupoglivo.com/s/AKfycbyTsDIza-sPf2ZEiB8BZEBymKvhvTri0CSAEppcOPVUW06II9H09vkULG2pkDzxFstf/exec';

    // WhatsApp number (with country code, no + sign)
    const WHATSAPP_NUMBER = '5213314360000';
    // ═══════════════════════════════════════════════════════════════════════

    // Create WhatsApp message
    const whatsappMessage = encodeURIComponent(
        `¡Hola! Soy ${data.name} y quiero agendar mi diagnóstico gratuito de inglés. ` +
        `Mi número es ${data.whatsapp} y prefiero que me contacten en la ${data.schedule}. 📚`
    );
    const whatsappURL = `https://wa.me/${WHATSAPP_NUMBER}?text=${whatsappMessage}`;

    // Send to Google Sheets first, then redirect to WhatsApp
    if (GOOGLE_SHEETS_URL && GOOGLE_SHEETS_URL !== 'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE') {
        // Send data to Google Sheets
        fetch(GOOGLE_SHEETS_URL, {
            method: 'POST',
            mode: 'no-cors', // Required for Google Apps Script
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        })
            .then(() => {
                console.log('Data sent to Google Sheets:', data);
                // Show success and redirect to WhatsApp
                showFormSuccess(form, data);
                setTimeout(() => {
                    window.open(whatsappURL, '_blank');
                }, 1000);
            })
            .catch(error => {
                console.error('Error sending to Google Sheets:', error);
                // Still show success and redirect (don't block user)
                showFormSuccess(form, data);
                setTimeout(() => {
                    window.open(whatsappURL, '_blank');
                }, 1000);
            });
    } else {
        // Google Sheets not configured, just redirect to WhatsApp
        console.log('Form submitted (Sheets not configured):', data);
        showFormSuccess(form, data);
        setTimeout(() => {
            window.open(whatsappURL, '_blank');
        }, 1000);
    }
}

function validateField(e) {
    const field = e.target;
    const value = field.value.trim();
    const fieldName = field.name;
    let isValid = true;
    let errorMessage = '';

    // Remove existing error
    clearError({ target: field });

    // Required validation
    if (field.required && !value) {
        isValid = false;
        errorMessage = 'Este campo es requerido';
    }

    // Specific validations
    if (value && fieldName === 'whatsapp') {
        // Clean phone number for validation
        const cleanPhone = value.replace(/\D/g, '');
        if (cleanPhone.length < 10) {
            isValid = false;
            errorMessage = 'Ingresa un número válido de 10 dígitos';
        }
    }

    if (value && fieldName === 'name') {
        if (value.length < 3) {
            isValid = false;
            errorMessage = 'El nombre debe tener al menos 3 caracteres';
        }
    }

    // Show error if invalid
    if (!isValid) {
        showFieldError(field, errorMessage);
    }

    return isValid;
}

function showFieldError(field, message) {
    field.classList.add('field--error');

    // Create error message element
    const errorEl = document.createElement('span');
    errorEl.className = 'field-error';
    errorEl.textContent = message;
    errorEl.style.cssText = `
        color: #ef4444;
        font-size: 0.75rem;
        margin-top: 0.25rem;
        display: block;
    `;

    // Add error styling to field
    field.style.borderColor = '#ef4444';

    // Insert error message after field
    field.parentNode.appendChild(errorEl);
}

function clearError(e) {
    const field = e.target;
    field.classList.remove('field--error');
    field.style.borderColor = '';

    // Remove error message
    const parent = field.parentNode;
    const existingError = parent.querySelector('.field-error');
    if (existingError) {
        existingError.remove();
    }
}

function showFormSuccess(form, data) {
    const formCard = form.closest('.form-card') || form.closest('.final-cta__form-container');

    if (formCard) {
        const successHTML = `
            <div class="form-success" style="
                text-align: center;
                padding: 2rem;
                animation: fadeInUp 0.5s ease-out;
            ">
                <div style="
                    width: 80px;
                    height: 80px;
                    background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin: 0 auto 1.5rem;
                    font-size: 2.5rem;
                ">✓</div>
                <h3 style="
                    font-family: 'Poppins', sans-serif;
                    font-size: 1.5rem;
                    color: #1e3a5f;
                    margin-bottom: 0.5rem;
                ">¡Gracias, ${data.name.split(' ')[0]}!</h3>
                <p style="
                    color: #4a5568;
                    margin-bottom: 1.5rem;
                    line-height: 1.6;
                ">
                    Recibimos tu solicitud. Te contactaremos por WhatsApp 
                    en la <strong>${data.schedule}</strong> para agendar tu diagnóstico gratuito.
                </p>
                <a href="https://wa.me/5213314360000?text=Hola%2C%20acabo%20de%20llenar%20el%20formulario%20y%20quiero%20agendar%20mi%20diagn%C3%B3stico%20%F0%9F%91%8B" 
                   target="_blank"
                   rel="noopener"
                   style="
                    display: inline-flex;
                    align-items: center;
                    gap: 0.5rem;
                    background: #25D366;
                    color: white;
                    padding: 0.875rem 1.5rem;
                    border-radius: 0.75rem;
                    font-weight: 600;
                    font-family: 'Poppins', sans-serif;
                    text-decoration: none;
                    transition: all 0.25s ease;
                ">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                    ¿Quieres respuesta inmediata? Escríbenos
                </a>
            </div>
        `;

        // Hide form and show success
        form.style.display = 'none';
        const divider = formCard.querySelector('.form-divider');
        const whatsappBtn = formCard.querySelector('.btn--whatsapp');
        if (divider) divider.style.display = 'none';
        if (whatsappBtn) whatsappBtn.style.display = 'none';

        formCard.insertAdjacentHTML('beforeend', successHTML);
    }
}

/* ─────────────────────────────────────────────────────────────────────────────
   SMOOTH SCROLL FOR ANCHOR LINKS
   ───────────────────────────────────────────────────────────────────────────── */
function initSmoothScroll() {
    const anchorLinks = document.querySelectorAll('a[href^="#"]');

    anchorLinks.forEach(link => {
        link.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');

            if (targetId === '#') return;

            const targetElement = document.querySelector(targetId);

            if (targetElement) {
                e.preventDefault();

                const headerHeight = document.getElementById('header').offsetHeight;
                const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset;
                const offsetPosition = targetPosition - headerHeight - 20;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

/* ─────────────────────────────────────────────────────────────────────────────
   INTERSECTION OBSERVER FOR ANIMATIONS
   ───────────────────────────────────────────────────────────────────────────── */
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-fade-in');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observe elements that should animate
    const animateElements = document.querySelectorAll(
        '.benefit-card, .testimonial-card, .step, .faq-item'
    );

    animateElements.forEach(el => {
        el.style.opacity = '0';
        observer.observe(el);
    });
}

// Optional: Initialize scroll animations
// Uncomment the line below to enable scroll animations
// initScrollAnimations();

/* ─────────────────────────────────────────────────────────────────────────────
   PHONE NUMBER FORMATTING
   ───────────────────────────────────────────────────────────────────────────── */
document.querySelectorAll('input[name="whatsapp"]').forEach(input => {
    input.addEventListener('input', function (e) {
        // Remove non-numeric characters
        let value = e.target.value.replace(/\D/g, '');

        // Limit to 10 digits
        value = value.slice(0, 10);

        // Format as XX XXXX XXXX
        if (value.length > 6) {
            value = value.slice(0, 2) + ' ' + value.slice(2, 6) + ' ' + value.slice(6);
        } else if (value.length > 2) {
            value = value.slice(0, 2) + ' ' + value.slice(2);
        }

        e.target.value = value;
    });
});
