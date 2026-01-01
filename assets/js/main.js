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

/* assets/js/main.js - Trecho do Formulário Atualizado */

// --- FORMULÁRIO DE LEADS (Integração Formspree) ---
const leadForm = document.getElementById('leadGenForm');
const feedbackMsg = document.getElementById('form-feedback');

if (leadForm) {
    leadForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const btn = leadForm.querySelector('button');
        const originalText = btn.innerText;
        
        // Dados do formulário
        const formData = new FormData(leadForm);
        
        // Feedback visual imediato
        btn.innerText = translations[currentLang].form_sending;
        btn.disabled = true;

        try {
            // SUBSTITUA PELA SUA URL DO FORMSPREE AQUI
            const response = await fetch('https://formspree.io/f/mlgdgvny', { 
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json'
                }
            });

            if (response.ok) {
                // Sucesso
                feedbackMsg.style.display = 'block';
                feedbackMsg.style.color = '#00D084'; // Verde sucesso
                feedbackMsg.innerText = translations[currentLang].form_success_msg;
                leadForm.reset();
                btn.innerText = translations[currentLang].form_btn_success;
            } else {
                // Erro do Formspree (ex: spam, captcha)
                const data = await response.json();
                if (Object.hasOwn(data, 'errors')) {
                    throw new Error(data["errors"].map(error => error["message"]).join(", "));
                } else {
                    throw new Error('Erro ao enviar.');
                }
            }
        } catch (error) {
            console.error(error);
            feedbackMsg.style.display = 'block';
            feedbackMsg.style.color = '#E84E1B'; // Laranja erro
            feedbackMsg.innerText = translations[currentLang].form_error_msg;
            btn.innerText = translations[currentLang].form_btn_error;
        } finally {
            // Restaura o botão após 5 segundos
            setTimeout(() => {
                btn.disabled = false;
                btn.innerText = originalText;
                feedbackMsg.style.display = 'none';
            }, 5000);
        }
    });
}