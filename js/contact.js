/**
 * CONTACT.JS - Contact Form & Character Counter
 * 
 * Handle form submission and provide live character count
 * Shows success message when user submits contact form
 */

import { createSpan } from "./helpers.js";

// Initialize contact form submission handler
export function setupContactForm() {
    const form = document.getElementById('contact-form');
    let successTimeoutId = null;  // Store timeout ID to clear if needed

    form.addEventListener('submit', (e) => {
        e.preventDefault();  // Prevent default form submission (page reload)

        // Get form values
        const name = document.getElementById('name').value.trim();
        const email = document.getElementById('email').value.trim();
        const message = document.getElementById('message').value.trim();

        // Clear existing timeout to prevent overlapping success messages
        if (successTimeoutId) {
            clearTimeout(successTimeoutId);
        }

        // Show success message
        const successMessage = document.getElementById('success-message');
        successMessage.classList.remove('hidden');

        // Reset form fields
        form.reset();

        // Auto-hide success message after 5 seconds
        successTimeoutId = setTimeout(() => {
            successMessage.classList.add('hidden');
            successTimeoutId = null;  // Clear reference
        }, 5000);
    });
}

// Live character counter for message textarea
export function characterCounter() {
    const charCounter = document.getElementById('messageCounter');
    const message = document.getElementById('message');

    // Update counter on every keystroke
    message.addEventListener('input', ()=>{
        const charCount = message.value.length;
        // Proper grammar: "1 character" vs "2 characters"
        charCounter.textContent = `You have typed: ${charCount} character${charCount !== 1 ? 's': ''}.`;
    })
}