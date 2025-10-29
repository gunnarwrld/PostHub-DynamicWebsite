/**
 * Hash-based SPA Routing
 * 
 * Enable single-page navigation without page reloads
 * Hash routing (#home, #posts) doesn't trigger server requests
 */

import { loadPosts } from './posts.js';
import { appData } from './config.js';

// ========== Navigation Setup ==========

// Initialize all navigation event listeners
export function setupNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    
    // Attach click handlers to nav links
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();  // Stop default link behavior
            const viewName = link.getAttribute('data-view');  // Get view from data attribute
            showView(viewName);
            
            // Update URL hash (enables browser back/forward buttons)
            window.location.hash = viewName;
        });
    });

    // Back button from post detail → posts view
    document.getElementById('back-btn').addEventListener('click', () => {
        showView('posts');
        window.location.hash = 'posts';
    });

    // Back button from profile → posts view
    document.getElementById('profile-back-btn').addEventListener('click', () => {
        showView('posts');
        window.location.hash = 'posts';
    });

    // Route handler (responds to URL hash changes)
    const handleRoute = () => {
        const hash = window.location.hash.slice(1) || 'home';  // Remove '#', default to 'home'
        showView(hash);
    };

    // Listen for back/forward browser buttons
    window.addEventListener('hashchange', handleRoute);

    // Handle initial page load (when user lands on site)
    handleRoute();
}

// ========== View Management ==========

// Show/hide views based on route
export function showView(viewName) {
    // Hide all pages
    document.querySelectorAll('.page').forEach(page => {
        page.classList.add('hidden');
    });
    
    // Show requested page
    const view = document.getElementById(viewName);
    if (view) {
        view.classList.remove('hidden');
    }
    
    // Update nav link styling
    updateActiveNav(viewName);
    
    // Lazy load posts on first visit to posts page
    // Guard clause prevents duplicate requests
    if (viewName === 'posts' && appData.posts.length === 0 && !appData.isLoading) {
        loadPosts();
    }
}

// Update active nav link (visual feedback)
function updateActiveNav(viewName) {
    document.querySelectorAll('.nav-link').forEach(link => {
        // Add 'active' class if link's view matches current view
        link.classList.toggle('active', link.getAttribute('data-view') === viewName);
    });
}
