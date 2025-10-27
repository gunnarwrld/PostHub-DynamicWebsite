import { createSpan } from "./helpers.js";
/**
 * Contact Form Management
 */

/**
 * Setup contact form submission handler
 */
export function setupContactForm() {
    const form = document.getElementById('contact-form');
    let successTimeoutId = null;

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        // Get form data
        const name = document.getElementById('name').value.trim();
        const email = document.getElementById('email').value.trim();
        const message = document.getElementById('message').value.trim();

        // Clear any existing timeout to prevent overlapping
        if (successTimeoutId) {
            clearTimeout(successTimeoutId);
        }

        // Show success message 
        const successMessage = document.getElementById('success-message');
        successMessage.classList.remove('hidden');

        // Reset form
        form.reset();

        // Hide success message after 5 seconds and store timeout ID
        successTimeoutId = setTimeout(() => {
            successMessage.classList.add('hidden');
            successTimeoutId = null;
        }, 5000);
    });
}

export function characterCounter() {
    const charCounter = document.getElementById('messageCounter');
    const message = document.getElementById('message');

    message.addEventListener('input', ()=>{
        const charCount = message.value.length;
        charCounter.textContent = `You have typed: ${charCount} character${charCount !== 1 ? 's': ''}.`;
    })}