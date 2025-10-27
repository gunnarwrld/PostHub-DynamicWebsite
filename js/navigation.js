/**
 * Navigation and View Management
 */
import { loadPosts } from './posts.js';
import { appData } from './config.js';

/**
 * Setup navigation link event listeners
 */
export function setupNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const viewName = link.getAttribute('data-view');
            showView(viewName);
            
            // Update URL hash
            window.location.hash = viewName;
        });
    });

    // Setup back button from post detail
    document.getElementById('back-btn').addEventListener('click', () => {
        showView('posts');
        window.location.hash = 'posts';
    });

    // Setup back button from profile
    document.getElementById('profile-back-btn').addEventListener('click', () => {
        showView('posts');
        window.location.hash = 'posts';
    });

    // Handle initial page load and hash changes
    const handleRoute = () => {
        const hash = window.location.hash.slice(1) || 'home';
        showView(hash);
    };

    // Listen for hash changes
    window.addEventListener('hashchange', handleRoute);

    // Handle initial route on page load
    handleRoute();
}

/**
 * Switch between different views (Home, Posts, Post Detail, Profile, Contact)
 */
export function showView(viewName) {
    // Hide all views
    document.querySelectorAll('.page').forEach(page => {
        page.classList.add('hidden');
    });
    
    // Show the requested view
    const view = document.getElementById(viewName);
    if (view) {
        view.classList.remove('hidden');
    }
    
    // Update active navigation state
    updateActiveNav(viewName);
    
    // Load posts if viewing posts page for the first time
    if (viewName === 'posts' && appData.posts.length === 0 && !appData.isLoading) {
        loadPosts();
    }
}

/**
 * Update active navigation link styling
 */
function updateActiveNav(viewName) {
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.toggle('active', link.getAttribute('data-view') === viewName);
    });
}
