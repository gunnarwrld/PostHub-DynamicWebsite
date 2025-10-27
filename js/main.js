/**
 * Application Entry Point
 * Initializes all modules and sets up the application
 */
import { setupNavigation } from './navigation.js';
import { setupModal } from './users.js';
import { setupContactForm, characterCounter } from './contact.js';
import { setupLoadMoreButton, setupBackToTopButton } from './posts.js';

/**
 * Initialize the application when DOM is ready
 */
document.addEventListener('DOMContentLoaded', () => {
    // Setup navigation
    setupNavigation();

    // Setup user profile modal
    setupModal();

    // Setup contact form
    setupContactForm();

    // Setup load more button for posts
    setupLoadMoreButton();

    // Setup back to top button
    setupBackToTopButton();

    // Live Character function for Contact Form
    characterCounter();

    // Random welcome message
        randomWelcomeMessages();

    function randomWelcomeMessages() {
    const welcomeMessages = ["Welcome User!", "Hello Person!", "Greetings Viewer!", "Hi There!"];
    document.getElementById("welcomeMessage").textContent = welcomeMessages[Math.floor(Math.random() * welcomeMessages.length)];
    }
});
