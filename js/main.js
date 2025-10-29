/**
 * Application Entry Point
 * Initializes all modules when DOM is ready and sets up the application
 */

// Import setup functions from each module
import { setupNavigation } from './navigation.js';
import { setupModal } from './users.js';
import { setupContactForm, characterCounter } from './contact.js';
import { setupLoadMoreButton, setupBackToTopButton } from './posts.js';
import { randomWelcomeMessages } from './home.js';

// Wait for DOM to load before initializing (prevents null element errors)
document.addEventListener('DOMContentLoaded', () => {
    
    // Setup navigation (hash routing, view switching)
    setupNavigation();

    // Setup user profile modal (close handlers: X button, outside click, Escape key)
    setupModal();

    // Setup contact form (submit handler, validation)
    setupContactForm();

    // Setup posts pagination button
    setupLoadMoreButton();

    // Setup scroll-to-top button (shows after 200px scroll)
    setupBackToTopButton();

    // Setup live character counter for textarea
    characterCounter();

    // Display random welcome message
    randomWelcomeMessages();

});
