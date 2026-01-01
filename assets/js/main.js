/* assets/js/main.js */

// --- CONFIGURAÇÃO DE IDIOMA ---
let currentLang = 'en';

function updateLanguage(lang) {
    if (typeof translations !== 'undefined' && translations[lang]) {
        currentLang = lang;
        
        // Atualiza textos
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (translations[lang][key]) {
                el.style.opacity = 0;
                setTimeout(() => {
                    el.textContent = translations[lang][key];
                    el.style.opacity = 1;
                }, 200);
            }
        });
        
        // Recalcula para atualizar moeda/unidades
        calculateImpact();
    }
}

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    // Detectar idioma
    const userLang = navigator.language || navigator.userLanguage;
    let targetLang = 'en';
    if (userLang.startsWith('pt')) targetLang = 'pt';
    else if (userLang.startsWith('fr')) targetLang = 'fr';

    const langSelector = document.getElementById('language-select');
    if (langSelector) {
        langSelector.value = targetLang;
        langSelector.addEventListener('change', (e) => updateLanguage(e.target.value));
    }
    updateLanguage(targetLang);

    // Data no footer
    const yearEl = document.getElementById('year');
    if(yearEl) yearEl.textContent = new Date().getFullYear();
    
    // Bind da Calculadora
    const gasInput = document.getElementById('gasInput');
    if(gasInput) gasInput.addEventListener('input', calculateImpact);
});

// --- OBSERVERS (Animações) ---
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('active');
            observer.unobserve(entry.target);
        }
    });
}, { threshold: 0.1 });

document.querySelectorAll('.scroll-reveal').forEach((el) => observer.observe(el));

// --- CALCULADORA ---
function calculateImpact() {
    const volumeInput = document.getElementById('gasInput');
    if(!volumeInput) return;

    const volume = parseFloat(volumeInput.value);
    const gasValueEl = document.getElementById('gasValue');
    if(gasValueEl) gasValueEl.innerText = volume.toLocaleString(currentLang);

    const fuel = Math.round(volume * 0.52);
    const barrels = (fuel / 158.98).toFixed(1);
    const co2 = (volume * 0.0025).toFixed(1);
    const revenue = Math.round(fuel * 1.6);

    document.getElementById('fuelResult').innerText = `${fuel.toLocaleString(currentLang)} L (${barrels} bbl)`;
    document.getElementById('co2Result').innerText = co2.replace('.', ',');
    
    let currencyPrefix = "$";
    if (currentLang === 'pt') currencyPrefix = "R$ ";
    else if (currentLang === 'fr') currencyPrefix = "€ ";

    document.getElementById('revResult').innerText = currencyPrefix + revenue.toLocaleString(currentLang);
}

// --- FORMULÁRIO DE LEADS (Conectado ao Backend) ---
const leadForm = document.getElementById('leadGenForm');
const feedbackMsg = document.getElementById('form-feedback');

if (leadForm) {
    leadForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = leadForm.querySelector('button');
        const originalText = btn.innerText;
        
        btn.innerText = "Processando...";
        btn.disabled = true;

        const formData = {
            name: leadForm.querySelector('[name="name"]').value,
            email: leadForm.querySelector('[name="email"]').value,
            company: leadForm.querySelector('[name="company"]').value,
            position: leadForm.querySelector('[name="position"]').value,
            interest: leadForm.querySelector('[name="interest"]').value,
            date: new Date().toISOString()
        };

        try {
            // DEMONSTRAÇÃO: URL de teste para simular sucesso (JSONPlaceholder).
            // Para produção real, substitua por seu backend ou serviço como Formspree/Formsubmit.
            const response = await fetch('https://jsonplaceholder.typicode.com/posts', { 
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                feedbackMsg.style.display = 'block';
                feedbackMsg.style.color = '#00D084';
                feedbackMsg.innerText = "Recebemos seus dados! Nossa equipe entrará em contato.";
                leadForm.reset();
            } else {
                throw new Error('Erro no servidor');
            }
        } catch (error) {
            console.error(error);
            feedbackMsg.style.display = 'block';
            feedbackMsg.style.color = '#E84E1B';
            feedbackMsg.innerText = "Erro ao enviar. Tente novamente.";
        } finally {
            setTimeout(() => {
                btn.disabled = false;
                btn.innerText = originalText;
            }, 5000);
        }
    });
}