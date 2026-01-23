/* ═══════════════════════════════════════════════════════════════════════════
   GLISH LANDING PAGE - JAVASCRIPT
   ═══════════════════════════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', function () {
    initHeader();
    initFAQAccordion();
    initForms();
    initSmoothScroll();
    initCountdownTimer();
});

function initCountdownTimer() {
    const minutesEl = document.getElementById('countdown-minutes');
    const secondsEl = document.getElementById('countdown-seconds');
    const urgencyBar = document.getElementById('urgency-bar');

    if (!minutesEl || !secondsEl || !urgencyBar) return;

    let endTime = localStorage.getItem('glish_countdown_end');

    if (!endTime) {
        endTime = Date.now() + (15 * 60 * 1000);
        localStorage.setItem('glish_countdown_end', endTime);
    } else {
        endTime = parseInt(endTime);
    }

    function updateCountdown() {
        const now = Date.now();
        const remaining = endTime - now;

        if (remaining <= 0) {
            minutesEl.textContent = '00';
            secondsEl.textContent = '00';
            urgencyBar.classList.add('urgency-bar--expired');
            const textElements = urgencyBar.querySelectorAll('.urgency-bar__text');
            if (textElements.length >= 2) {
                textElements[0].innerHTML = '⏰ <strong>La oferta expiró</strong>';
                textElements[1].innerHTML = 'pero aún puedes <strong>agendar tu diagnóstico gratis</strong>';
            }
            return;
        }

        const minutes = Math.floor(remaining / 60000);
        const seconds = Math.floor((remaining % 60000) / 1000);

        minutesEl.textContent = minutes.toString().padStart(2, '0');
        secondsEl.textContent = seconds.toString().padStart(2, '0');

        requestAnimationFrame(updateCountdown);
    }

    updateCountdown();
}

function initHeader() {
    const header = document.getElementById('header');
    window.addEventListener('scroll', function () {
        if (window.pageYOffset > 50) {
            header.classList.add('header--scrolled');
        } else {
            header.classList.remove('header--scrolled');
        }
    });
}

function initFAQAccordion() {
    const faqItems = document.querySelectorAll('.faq-item');

    faqItems.forEach(item => {
        const question = item.querySelector('.faq-item__question');

        question.addEventListener('click', function () {
            const isActive = item.classList.contains('active');

            faqItems.forEach(otherItem => {
                if (otherItem !== item) {
                    otherItem.classList.remove('active');
                    otherItem.querySelector('.faq-item__question').setAttribute('aria-expanded', 'false');
                }
            });

            item.classList.toggle('active');
            question.setAttribute('aria-expanded', !isActive);
        });
    });
}

function initForms() {
    const forms = document.querySelectorAll('.lead-form');

    forms.forEach(form => {
        form.addEventListener('submit', handleFormSubmit);

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

    const fields = form.querySelectorAll('input, select');
    fields.forEach(field => {
        if (!validateField({ target: field })) {
            isValid = false;
        }
    });

    if (!isValid) return;

    const data = {
        name: formData.get('name'),
        whatsapp: formData.get('whatsapp'),
        schedule: formData.get('schedule'),
        timestamp: new Date().toLocaleString('es-MX'),
        source: window.location.href
    };

    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="loading-spinner"></span> Enviando...';

    const GOOGLE_SHEETS_URL = 'https://script.google.com/a/macros/grupoglivo.com/s/AKfycbyTsDIza-sPf2ZEiB8BZEBymKvhvTri0CSAEppcOPVUW06II9H09vkULG2pkDzxFstf/exec';
    const WHATSAPP_NUMBER = '5213314360000';

    const whatsappMessage = encodeURIComponent(
        `¡Hola! Soy ${data.name} y quiero agendar mi diagnóstico gratuito de inglés. Mi número es ${data.whatsapp} y prefiero que me contacten en la ${data.schedule}. 📚`
    );
    const whatsappURL = `https://wa.me/${WHATSAPP_NUMBER}?text=${whatsappMessage}`;

    fetch(GOOGLE_SHEETS_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    })
    .then(() => {
        showFormSuccess(form, data);
        setTimeout(() => window.open(whatsappURL, '_blank'), 1000);
    })
    .catch(() => {
        showFormSuccess(form, data);
        setTimeout(() => window.open(whatsappURL, '_blank'), 1000);
    });
}

function validateField(e) {
    const field = e.target;
    const value = field.value.trim();
    const fieldName = field.name;
    let isValid = true;
    let errorMessage = '';

    clearError({ target: field });

    if (field.required && !value) {
        isValid = false;
        errorMessage = 'Este campo es requerido';
    }

    if (value && fieldName === 'whatsapp') {
        const cleanPhone = value.replace(/\D/g, '');
        if (cleanPhone.length < 10) {
            isValid = false;
            errorMessage = 'Ingresa un número válido de 10 dígitos';
        }
    }

    if (value && fieldName === 'name' && value.length < 3) {
        isValid = false;
        errorMessage = 'El nombre debe tener al menos 3 caracteres';
    }

    if (!isValid) showFieldError(field, errorMessage);

    return isValid;
}

function showFieldError(field, message) {
    field.classList.add('field--error');
    const errorEl = document.createElement('span');
    errorEl.className = 'field-error';
    errorEl.textContent = message;
    errorEl.style.cssText = 'color: #ef4444; font-size: 0.75rem; margin-top: 0.25rem; display: block;';
    field.style.borderColor = '#ef4444';
    field.parentNode.appendChild(errorEl);
}

function clearError(e) {
    const field = e.target;
    field.classList.remove('field--error');
    field.style.borderColor = '';
    const existingError = field.parentNode.querySelector('.field-error');
    if (existingError) existingError.remove();
}

function showFormSuccess(form, data) {
    const formCard = form.closest('.form-card') || form.closest('.final-cta__form-container');

    if (formCard) {
        const successHTML = `
            <div class="form-success" style="text-align: center; padding: 2rem;">
                <div style="width: 80px; height: 80px; background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 1.5rem; font-size: 2.5rem;">✓</div>
                <h3 style="font-family: 'Montserrat', sans-serif; font-size: 1.5rem; color: #1e3a5f; margin-bottom: 0.5rem;">¡Gracias, ${data.name.split(' ')[0]}!</h3>
                <p style="color: #4a5568; margin-bottom: 1.5rem; line-height: 1.6;">Recibimos tu solicitud. Te contactaremos por WhatsApp en la <strong>${data.schedule}</strong> para agendar tu diagnóstico gratuito.</p>
            </div>
        `;

        form.style.display = 'none';
        const divider = formCard.querySelector('.form-divider');
        const whatsappBtn = formCard.querySelector('.btn--whatsapp');
        if (divider) divider.style.display = 'none';
        if (whatsappBtn) whatsappBtn.style.display = 'none';

        formCard.insertAdjacentHTML('beforeend', successHTML);
    }
}

function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(link => {
        link.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;

            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                e.preventDefault();
                const headerHeight = document.getElementById('header').offsetHeight;
                const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset;
                window.scrollTo({ top: targetPosition - headerHeight - 20, behavior: 'smooth' });
            }
        });
    });
}

document.querySelectorAll('input[name="whatsapp"]').forEach(input => {
    input.addEventListener('input', function (e) {
        let value = e.target.value.replace(/\D/g, '').slice(0, 10);
        if (value.length > 6) {
            value = value.slice(0, 2) + ' ' + value.slice(2, 6) + ' ' + value.slice(6);
        } else if (value.length > 2) {
            value = value.slice(0, 2) + ' ' + value.slice(2);
        }
        e.target.value = value;
    });
});
