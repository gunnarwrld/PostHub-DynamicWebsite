// Global state to store data
const appData = {
    posts: [],
    users: {}, // Object for easier lookup by ID
    currentSkip: 0, // How many posts we've already loaded
    postsPerPage: 10, // Posts Limit
    totalPosts: 0, // Total posts available from API
    isLoading: false, // Track if we're currently loading
    currentPost: null, // Store currently viewed post
    currentUser: null // Store currently viewed user
};

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

// 7. Function to fetch user data by ID
async function fetchUser(userId) {
    // Check if we already have this user cached
    if (appData.users[userId]) {
        return appData.users[userId]; // Return cached data
    }
    
    // If not cached, fetch from API
    try {
        const response = await fetch(`https://dummyjson.com/users/${userId}`);
        
        if (!response.ok) {
            throw new Error(`Failed to fetch user: ${response.status}`);
        }
        
        const user = await response.json();
        
        // Cache the user for future use
        appData.users[userId] = user;
        
        return user;
    } catch (error) {
        console.error(`Error fetching user ${userId}:`, error);
        throw error; // Re-throw to handle in calling function
    }
}

