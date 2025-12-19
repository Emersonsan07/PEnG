/**
 * @jest-environment jsdom
 */

const fs = require('fs');
const path = require('path');

// Load the HTML file content to simulate the DOM
const html = fs.readFileSync(path.resolve(__dirname, '../index.html'), 'utf8');

describe('PENG Website Functionality', () => {
    beforeEach(() => {
        // Set up the DOM from index.html
        document.documentElement.innerHTML = html;
        
        // Mock timers for setTimeout tests
        jest.useFakeTimers();
        
        // Reset modules to ensure script.js executes fresh for each test
        jest.resetModules();
        
        // Load the script (this executes the event listeners and initial logic)
        // We require it here because it needs the DOM to be ready
        require('../script.js');
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    test('Newsletter form submission updates button state and resets', () => {
        const form = document.querySelector('.newsletter-form');
        const btn = form.querySelector('button');
        const originalText = btn.innerText;

        // 1. Simulate Form Submission
        form.dispatchEvent(new Event('submit'));

        // 2. Check Immediate State (Subscribed)
        expect(btn.innerText).toBe('Subscribed!');
        expect(btn.style.color).toBe('rgb(0, 208, 132)'); // #00D084 converted to rgb
        expect(btn.style.backgroundColor).toBe('rgb(255, 255, 255)'); // #fff

        // 3. Fast-forward time by 3 seconds
        jest.advanceTimersByTime(3000);

        // 4. Check Reset State
        expect(btn.innerText).toBe(originalText);
        expect(btn.style.backgroundColor).toBe('');
    });

    test('Calculator updates results correctly when input changes', () => {
        const gasInput = document.getElementById('gasInput');
        const fuelResult = document.getElementById('fuelResult');
        const co2Result = document.getElementById('co2Result');
        const revResult = document.getElementById('revResult');

        // Import the function to call it manually (since oninput isn't auto-triggered in JSDOM by value change)
        const { calculateImpact } = require('../script.js');

        // 1. Change Input Value to 20,000
        gasInput.value = "20000";
        
        // 2. Run Calculation
        calculateImpact();

        // 3. Verify Math
        // Fuel: 20000 * 0.52 = 10400
        expect(fuelResult.innerText).toBe('10,400');
        // CO2: 20000 * 0.0025 = 50.0
        expect(co2Result.innerText).toBe('50.0');
        // Revenue: 10400 * 1.6 = 16640
        expect(revResult.innerText).toBe('$16,640');
    });
});