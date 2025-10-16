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
    setupLoadMoreButton();
    setupContactForm();
    setupModal();

    // Check if there's a hash in URL (e.g., #posts)
    const hash = window.location.hash.slice(1) || 'home';
    showView(hash);

    //Back button from post details
    document.getElementById('back-btn').addEventListener('click', () => {
        showView('posts');
    });
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

// Function to fetch user data by ID
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

// Async function to fetch posts (initial load)
async function loadPosts() {
    // Prevent loading if already loading
    if (appData.isLoading) return;
    
    const postsContainer = document.getElementById('posts-container');
    const loadMoreBtn = document.getElementById('load-more-btn');
    const spinner = document.getElementById('loading-spinner');
    
    try {
        // Set loading state
        appData.isLoading = true;
        showSpinner();
        
        // Fetch batch of posts from DummyJSON API
        const response = await fetch(`https://dummyjson.com/posts?limit=${appData.postsPerPage}&skip=${appData.currentSkip}`);
        
        if (!response.ok) {
            throw new Error(`Failed to fetch posts: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Store total number of posts available
        appData.totalPosts = data.total;
        
        // Check if no posts were returned
        if (data.posts.length === 0 && appData.posts.length === 0) {
            postsContainer.innerHTML = '<div class="empty-state">No posts available at the moment.</div>';
            hideSpinner();
            return;
        }
        
        // Add new posts to our state
        appData.posts.push(...data.posts);
        
        // Update skip counter
        appData.currentSkip += data.posts.length;
        
        // Display each post with usernames!
        for (const post of data.posts) {
            await displayPost(post);
        }
        
        // Hide spinner
        hideSpinner();
        
        // Show or hide "Load More" button
        updateLoadMoreButton();
        
    } catch (error) {
        console.error('Error loading posts:', error);
        hideSpinner();
        postsContainer.innerHTML = '<div class="error-state">Failed to load posts. Please check your internet connection and try again.</div>';
    } finally {
        // Always reset loading state
        appData.isLoading = false;
    }
}

// Function to display a single post
async function displayPost(post) {
    // STEP 1: Get the container where we'll put this post
    const postsContainer = document.getElementById('posts-container');
    
    // STEP 1.5: Fetch the user data for this post
    try {
        const user = await fetchUser(post.userId);
        const authorName = user ? `${user.firstName} ${user.lastName}` : `User ${post.userId}`;
        
        // STEP 2: Create a new article element
        const postElement = document.createElement('article');
        
        postElement.className = 'post-card';
        
        // STEP 3: Process the tags array into HTML
        const tagsHTML = post.tags.map(tag => 
            `<span class="tag">${tag}</span>`
        ).join('');
        
        // STEP 4: Build the HTML structure
        postElement.innerHTML = `
            <h3 class="post-title" data-post-id="${post.id}">${post.title}</h3>
            <div class="post-meta">
                <span class="author" data-user-id="${post.userId}">👤 ${authorName}</span>
                <span class="reactions">❤️ ${post.reactions.likes} likes</span>
                <span class="views">👁️ ${post.views} views</span>
            </div>
            <p class="post-body">${post.body}</p>
            <div class="post-tags">${tagsHTML}</div>
        `;
        
        // STEP 5: Add click event listeners
        const postTitle = postElement.querySelector('.post-title');
        const authorSpan = postElement.querySelector('.author');
        
        // Click on title → view post detail
        postTitle.addEventListener('click', () => {
            viewPostDetail(post.id);
        });
        
        // Click on author → open modal with profile
        authorSpan.addEventListener('click', () => {
            openUserProfileModal(post.userId);
        });
        
        // STEP 6: Add the post to the page
        postsContainer.appendChild(postElement);
    } catch (error) {
        console.error('Error displaying post:', error);
        // Still show the post even if user fetch fails
        const postElement = document.createElement('article');
        postElement.className = 'post-card';
        postElement.innerHTML = `
            <h3 class="post-title">${post.title}</h3>
            <div class="post-meta">
                <span class="author">👤 User ${post.userId}</span>
                <span class="reactions">❤️ ${post.reactions.likes} likes</span>
            </div>
            <p class="post-body">${post.body}</p>
        `;
        postsContainer.appendChild(postElement);
    }
}

// Load more posts when button is clicked
async function loadMorePosts() {
    const loadMoreBtn = document.getElementById('load-more-btn');
    
    // Disable button while loading
    loadMoreBtn.disabled = true;
    loadMoreBtn.textContent = 'Loading...';
    
    await loadPosts();
    
    // Re-enable button
    loadMoreBtn.disabled = false;
    loadMoreBtn.textContent = 'Load More Posts';
}

// Setup the "Load More" button
function setupLoadMoreButton() {
    const loadMoreBtn = document.getElementById('load-more-btn');
    loadMoreBtn.addEventListener('click', loadMorePosts);
}

// Show/hide Load More button based on available posts
function updateLoadMoreButton() {
    const loadMoreBtn = document.getElementById('load-more-btn');
    
    if (appData.currentSkip >= appData.totalPosts) {
        // No more posts to load
        loadMoreBtn.classList.add('hidden');
    } else {
        // More posts available
        loadMoreBtn.classList.remove('hidden');
    }
}

// Show loading spinner
function showSpinner() {
    const spinner = document.getElementById('loading-spinner');
    spinner.classList.remove('hidden');
}

// Hide loading spinner
function hideSpinner() {
    const spinner = document.getElementById('loading-spinner');
    spinner.classList.add('hidden');
}

// View post detail wit comments
async function viewPostDetail(postId) {
    showView('post-detail')

    const postContent = document.getElementById('post-content');
    const commentsContainer = document.getElementById('comments-container');

    // Show loading state
    postContent.innerHTML = '<p>Loading post...</p>';
    commentsContainer.innerHTML = '';

    try{
        const postResponse = await fetch(`https://dummyjson.com/posts/${postId}`);

        if (!postResponse.ok){
            throw new Error(`Failed to fetch post: ${postResponse.status}`);
        }

        const post = await postResponse.json();

        // Store the current post
        appData.currentPost = post;

        // Fetch the author
        const user = await fetchUser(post.userId);
        const authorName = user ? `${user.firstName} ${user.lastName}` : `User ${post.userId}`;

        //Display post details
        const tagsHTML = post.tags.map(tag => `<span class="tag">${tag}</span>`).join('');

        postContent.innerHTML = `
            <article class="post-detail-card">
                <h2>${post.title}</h2>
                <div class="post-meta">
                    <span class="author" data-user-id="${post.userId}">👤 ${authorName}</span>
                    <span class="reactions">❤️ ${post.reactions.likes} likes | 👎 ${post.reactions.dislikes} dislikes</span>
                    <span class="views">👁️ ${post.views} views</span>
                </div>
                <div class="post-tags">${tagsHTML}</div>
                <p class="post-full-body">${post.body}</p>
            </article>
        `;

        // Add click event to auhot in detail view
        const authorInDetail = postContent.querySelector('.author');
        if(authorInDetail){
            authorInDetail.addEventListener('click', () => {
                openUserProfileModal(post.userId);
            });
        }

        // Load comments
        await loadComments(postId);

    } catch(error){
        console.error('Error loading post detail:', error);
        postContent.innerHTML = '<div class= "error-state">Failed to load post. Please check your connection and try again.</div>';
    }
}

async function loadComments(postId){
    const commentsContainer = document.getElementById('comments-container');
    commentsContainer.innerHTML = '<p>Loading comments...</p>';

    try{
        const response = await fetch(`https://dummyjson.com/comments/post/${postId}`);

        if(!response.ok){
            throw new Error(`Failed to fetch comments: ${response.status}`);
        }

        const data = await response.json();

        if (data.comments.lenght === 0){
            commentsContainer.innerHTML = '<div class="empty-state">No comments available for this post.</div>';
            return;
        }

        commentsContainer.innerHTML = '';

        data.comments.forEach(comment => {
            const commentElement = document.createElement('div')
            commentElement.className = 'comment-card';
            commentElement.innerHTML = `
                <div class="comment-header">
                    <strong>👤 ${comment.user.username}</strong>
                    <span class="comment-likes">❤️ ${comment.likes}</span>
                </div>
                <p class="comment-body">${comment.body}</p>
            `;
            commentsContainer.appendChild(commentElement);
        });

    } catch (error){
        console.error('Error loading comments;', error);
        commentsContainer.innerHTML = '<div class="error-state">Failed to load comments. Please check your connection and try again.</div>';
    }
}

// Modal setup and close functionality
function setupModal(){
    const modal = document.getElementById('profile-modal');
    const closeBtn = document.querySelector('.close-modal');

    // Close modal when clicking x
    closeBtn.addEventListener('click', () => {
        modal.classList.add('hidden');
    });

    // Close modal when clicking outside the modal
    modal.addEventListener('click', (e) => {
        if(e.target === modal){
            modal.classList.add('hidden');
        }
    });

    // Close modal with Escape key
    document.addEventListener('keydown', (e) => {
        if(e.target === modal){
            modal.classList.add('hidden');
        }
    });
}

// Open user profile (in modal)
async function openUserProfileModal(userId) {
    const modal = document.getElementById('profile-modal');
    const modalContent = document.getElementById('modal-profile-content');

    // Show modal
    modal.classList.remove('hidden');
    modalContent.innerHTML = '<p style="text-align: center;">Loading profile...</p>';

    try {
        // Fetch user details (will use cache if available)
        const user = await fetchUser(userId);

        if(!user){
            modalContent.innerHTML = '<div class="error-state">User not found</div>';
            return;
        }

        // Display user profile in modal with full details
        modalContent.innerHTML = `
            <div class="modal-profile-header">
                <img src="${user.image}" alt="${user.firstName} ${user.lastName}" class="modal-profile-image">
                <h2 class="modal-profile-name">${user.firstName} ${user.lastName}</h2>
                <p class="modal-profile-username">@${user.username}</p>
            </div>
            <div class="modal-profile-details">
                <div class="profile-detail-item">
                    <strong>📧 Email:</strong>
                    <span>${user.email}</span>
                </div>
                <div class="profile-detail-item">
                    <strong>📍 Address:</strong>
                    <span>${user.address.address}, ${user.address.city}, ${user.address.state} ${user.address.postalCode}</span>
                </div>
                <div class="profile-detail-item">
                    <strong>📞 Phone:</strong>
                    <span>${user.phone}</span>
                </div>
                <div class="profile-detail-item">
                    <strong>🎂 Age:</strong>
                    <span>${user.age} years old</span>
                </div>
                <div class="profile-detail-item">
                    <strong>👁️ Eye Color:</strong>
                    <span>${user.eyeColor}</span>
                </div>
                <div class="profile-detail-item">
                    <strong>📏 Height:</strong>
                    <span>${user.height} cm</span>
                </div>
                <div class="profile-detail-item">
                    <strong>⚖️ Weight:</strong>
                    <span>${user.weight} kg</span>
                </div>
                <div class="profile-detail-item">
                    <strong>🩸 Blood Type:</strong>
                    <span>${user.bloodGroup}</span>
                </div>
            </div>
        `;

    } catch(error){
        console.error('Error loading user profile:', error);
        modalContent.innerHTML= '<div class="error-state">Failed to load profile. Please check your internet connection and try again.</div>';
    }
}

// View user profile with their posts
async function viewUserProfile(userId) {

    showView('profile');

    const profileContent = document.getElementById('profile-content');
    const userPostsContainer = document.getElementById('user-posts-container');

    //Show loading state
    profileContent.innerHTML = '<p>Loading profile...</p>';
    userPostsContainer.innerHTML ='';

    try {
        // Fetch user details
        const user = await fetchUser(userId);

        if(!user){
            profileContent.innerHTML = '<div class="error-states">User not found.</div>';
            return;
        }

        // Store current user 
        appData.currentUser = user;

        // Display user profile
        profileContent.innerHTML = `
            <div class="profile-card">
                <div class="profile-header">
                    <img src="${user.image}" alt="${user.firstName} ${user.lastName}" class="profile-image">
                    <div class="profile-info">
                        <h2>${user.firstName} ${user.lastName}</h2>
                        <p class="profile-username">@${user.username}</p>
                        <p class="profile-email">📧 ${user.email}</p>
                        <p class="profile-details">
                            📍 ${user.address.city}, ${user.address.state}<br>
                            🎂 Age: ${user.age} | 
                            👁️ ${user.eyeColor} eyes | 
                            ${user.height}cm
                        </p>
                    </div>
                </div>
            </div>
        `;

        // Load user´s posts
        await loadUserPosts(userId);

    } catch (error) {
        console.error('Error loading profile', error);
        profileContent.innerHTML = '<div class="error-state">Failed to load profile. Please check your connection and try again.</div>';        
    }
}

// Load all posts by a specific user
async function loadUserPosts(userId) {
    const userPostsContainer = document.getElementById('user-posts-container');
    userPostsContainer.innerHTML = '<p>Loading user posts...</p>';
    
    try {
        const response = await fetch(`https://dummyjson.com/posts/user/${userId}`);
        
        if (!response.ok) {
            throw new Error(`Failed to fetch user posts: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.posts.length === 0) {
            userPostsContainer.innerHTML = '<div class="empty-state">No posts available from this user.</div>';
            return;
        }
        
        userPostsContainer.innerHTML = '';
        
        for (const post of data.posts) {
            const postElement = document.createElement('article');
            postElement.className = 'post-card';
            
            const tagsHTML = post.tags.map(tag => `<span class="tag">${tag}</span>`).join('');
            
            postElement.innerHTML = `
                <h3 class="post-title" data-post-id="${post.id}">${post.title}</h3>
                <div class="post-meta">
                    <span class="reactions">❤️ ${post.reactions.likes} likes</span>
                    <span class="views">👁️ ${post.views} views</span>
                </div>
                <p class="post-body">${post.body}</p>
                <div class="post-tags">${tagsHTML}</div>
            `;
            
            // Add click event to view post detail
            const postTitle = postElement.querySelector('.post-title');
            postTitle.addEventListener('click', () => {
                viewPostDetail(post.id);
            });
            
            userPostsContainer.appendChild(postElement);
        }
        
    } catch (error) {
        console.error('Error loading user posts:', error);
        userPostsContainer.innerHTML = '<div class="error-state">Failed to load user posts. Please check your connection and try again.</div>';
    }
}

// Contact Form
function setupContactForm(){
    const form = document.getElementById('contact-form');

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        // Get form data
        const name = document.getElementById('name').value.trim();
        const email = document.getElementById('email').value.trim();
        const message = document.getElementById('message').value.trim();

        // Success message 
        const successMessage = document.getElementById('success-message');
        successMessage.classList.remove('hidden');

        // Reset form
        form.reset();

        // Hide success message after 5 sec
        setTimeout(() => {successMessage.classList.add('hidden');}, 5000)
        });
}








