document.addEventListener('DOMContentLoaded', () => {
    setupNavigation();

    // Check if there's a hash in URL (e.g., #posts)
    const hash = window.location.hash.slice(1) || 'home';
    showView(hash);    
});

// Setup navigation links
function setupNavigation() {
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
}

// Switch between different views (Home, Post Detail, Profile)
function showView(viewName) {
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

// Update active navigation link
function updateActiveNav(viewName) {
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.toggle('active', link.getAttribute('data-view') === viewName);
    });
}