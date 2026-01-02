/* tests/script.test.js */
/**
 * @jest-environment jsdom
 */

const fs = require('fs');
const path = require('path');

// Carrega o HTML da raiz
const html = fs.readFileSync(path.resolve(__dirname, '../index.html'), 'utf8');

describe('PENG Website Functionality', () => {
    beforeEach(() => {
        document.documentElement.innerHTML = html;
        jest.useFakeTimers();
        jest.resetModules();
        
        // Simula o objeto de traduções global (pois i18n.js não é carregado no Jest padrão)
        global.translations = { en: { res_fuel: "Production" } };
        
        // Carrega o script principal do novo caminho
        require('../js/main.js');
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    test('Calculator updates results', () => {
        const gasInput = document.getElementById('gasInput');
        const fuelResult = document.getElementById('fuelResult');
        
        // Simula mudança de valor
        gasInput.value = "20000";
        gasInput.dispatchEvent(new Event('input'));
        
        // Verifica cálculo (20000 * 0.52 = 10400)
        expect(fuelResult.innerText).toContain('10,400');
    });
});