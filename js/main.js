/**
 * Application Entry Point
 * Initializes all modules and sets up the application
 */
import { setupNavigation } from './navigation.js';
import { setupModal } from './users.js';
import { setupContactForm } from './contact.js';
import { setupLoadMoreButton } from './posts.js';

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
});
