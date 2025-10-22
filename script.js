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

// ==================== Helper Functions for Safe DOM Creation ====================

/**
 * Creates an article with specified class
 */
function createArticle(className = '') {
    const article = document.createElement('article');
    if (className) article.className = className;
    return article;
}
/**
 * Creates a div with specified class and optional text content
 */
function createDiv(className = '', textContent = '') {
    const div = document.createElement('div');
    if (className) div.className = className;
    if (textContent) div.textContent = textContent;
    return div;
}

/**
 * Creates a paragraph element with optional text content
 */
function createParagraph(textContent = '') {
    const p = document.createElement('p');
    if (textContent) p.textContent = textContent;
    return p;
}

/**
 * Creates a span element with optional class and text content
 */
function createSpan(className = '', textContent = '') {
    const span = document.createElement('span');
    if (className) span.className = className;
    if (textContent) span.textContent = textContent;
    return span;
}

/**
 * Safely creates an image element with src, alt, and optional class
 */
function createImage(src, alt, className = '') {
    const img = document.createElement('img');
    img.src = src;
    img.alt = alt;
    if (className) img.className = className;
    return img;
}

/**
 * Safely creates a heading element
 */
function createHeading(level, textContent, className = '') {
    const heading = document.createElement(`h${level}`);
    heading.textContent = textContent;
    if (className) heading.className = className;
    return heading;
}

/**
 * Clears all children from a container
 */
function clearContainer(container) {
    while (container.firstChild) {
        container.removeChild(container.firstChild);
    }
}

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
            const emptyState = createDiv('empty-state', 'No posts available at the moment.');
            postsContainer.appendChild(emptyState);
            hideSpinner();
            return;
        }
        
        // Add new posts to our state
        appData.posts.push(...data.posts);
        
        // Update skip counter
        appData.currentSkip += data.posts.length;
        
        // Display each post with usernames concurrently!
        await Promise.all(data.posts.map(post => displayPost(post)));
        
        // Hide spinner
        hideSpinner();
        
        // Show or hide "Load More" button
        updateLoadMoreButton();
        
    } catch (error) {
        console.error('Error loading posts:', error);
        hideSpinner();
        const errorState = createDiv('error-state', 'Failed to load posts. Please check your internet connection and try again.');
        postsContainer.appendChild(errorState);
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
        const postElement = createArticle('post-card');
        
        // STEP 3: Create title
        const title = createHeading(3, post.title, 'post-title');
        title.dataset.postId = post.id;
        title.style.cursor = 'pointer';
        title.addEventListener('click', () => viewPostDetail(post.id));
        
        // STEP 4: Create post meta
        const postMeta = createDiv('post-meta');
        
        // Author span
        const author = createSpan('author', `👤 ${authorName}`);
        author.dataset.userId = post.userId;
        author.style.cursor = 'pointer';
        author.addEventListener('click', () => openUserProfileModal(post.userId));
        postMeta.appendChild(author);
        
        // Reactions span
        const reactions = createSpan('reactions', `❤️ ${post.reactions.likes} likes`);
        postMeta.appendChild(reactions);
        
        // Views span
        const views = createSpan('views', `👁️ ${post.views} views`);
        postMeta.appendChild(views);
        
        // STEP 5: Create body
        const body = createParagraph(post.body);
        body.className = 'post-body';
        
        // STEP 6: Create tags
        const tagsContainer = createDiv('post-tags');
        post.tags.forEach(tag => {
            const tagSpan = createSpan('tag', tag);
            tagsContainer.appendChild(tagSpan);
        });
        
        // STEP 7: Append all to post element
        postElement.appendChild(title);
        postElement.appendChild(postMeta);
        postElement.appendChild(body);
        postElement.appendChild(tagsContainer);
        
        // STEP 8: Add the post to the page
        postsContainer.appendChild(postElement);
    } catch (error) {
        console.error('Error displaying post:', error);
        // Still show the post even if user fetch fails
        const postElement = createArticle('post-card');
        
        const title = createHeading(3, post.title, 'post-title');
        postElement.appendChild(title);
        
        const postMeta = createDiv('post-meta');
        const author = createSpan('author', `👤 User ${post.userId}`);
        const reactions = createSpan('reactions', `❤️ ${post.reactions?.likes ?? 'N/A'} likes`);
        postMeta.appendChild(author);
        postMeta.appendChild(reactions);
        postElement.appendChild(postMeta);
        
        const body = createParagraph(post.body);
        body.className = 'post-body';
        postElement.appendChild(body);
        
        document.getElementById('posts-container').appendChild(postElement);
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
    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', loadMorePosts);
    }
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
    if (spinner) {
        spinner.classList.remove('hidden');
    }
}

// Hide loading spinner
function hideSpinner() {
    const spinner = document.getElementById('loading-spinner');
    if (spinner) {
        spinner.classList.add('hidden');
    }
}

// View post detail with comments
async function viewPostDetail(postId) {
    showView('post-detail')

    const postContent = document.getElementById('post-content');
    const commentsContainer = document.getElementById('comments-container');

    // Clear containers
    clearContainer(postContent);
    clearContainer(commentsContainer);
    
    // Show loading state
    postContent.appendChild(createParagraph('Loading post...'));

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

        // Clear loading state
        clearContainer(postContent);

        // Create article element
        const article = createArticle('post-detail-card');

        // Add title
        const title = createHeading(2, post.title);
        article.appendChild(title);

        // Create post meta
        const postMeta = createDiv('post-meta');
        
        const author = createSpan('author', `👤 ${authorName}`);
        author.dataset.userId = post.userId;
        author.addEventListener('click', () => openUserProfileModal(post.userId));
        postMeta.appendChild(author);
        
        const reactions = createSpan('reactions', `❤️ ${post.reactions.likes} likes | 👎 ${post.reactions.dislikes} dislikes`);
        postMeta.appendChild(reactions);
        
        const views = createSpan('views', `👁️ ${post.views} views`);
        postMeta.appendChild(views);
        
        article.appendChild(postMeta);

        // Add tags
        const tagsContainer = createDiv('post-tags');
        post.tags.forEach(tag => {
            const tagSpan = createSpan('tag', tag);
            tagsContainer.appendChild(tagSpan);
        });
        article.appendChild(tagsContainer);

        // Add body
        const body = createParagraph(post.body);
        body.className = 'post-full-body';
        article.appendChild(body);

        postContent.appendChild(article);

        // Load comments
        await loadComments(postId);

    } catch(error){
        console.error('Error loading post detail:', error);
        clearContainer(postContent);
        const errorState = createDiv('error-state', 'Failed to load post. Please check your connection and try again.');
        postContent.appendChild(errorState);
    }
}

async function loadComments(postId){
    const commentsContainer = document.getElementById('comments-container');
    clearContainer(commentsContainer);
    
    // Show loading state
    commentsContainer.appendChild(createParagraph('Loading comments...'));

    try{
        const response = await fetch(`https://dummyjson.com/comments/post/${postId}`);

        if(!response.ok){
            throw new Error(`Failed to fetch comments: ${response.status}`);
        }

        const data = await response.json();

        if (data.comments.length === 0){
            clearContainer(commentsContainer);
            const emptyState = createDiv('empty-state', 'No comments available for this post.');
            commentsContainer.appendChild(emptyState);
            return;
        }

        clearContainer(commentsContainer);

        data.comments.forEach(comment => {
            const commentElement = createDiv('comment-card');
            
            // Comment header
            const header = createDiv('comment-header');
            const username = document.createElement('strong');
            username.textContent = `👤 ${comment.user.username}`;
            header.appendChild(username);
            
            const likes = createSpan('comment-likes', `❤️ ${comment.likes}`);
            header.appendChild(likes);
            
            commentElement.appendChild(header);
            
            // Comment body
            const body = createParagraph(comment.body);
            body.className = 'comment-body';
            commentElement.appendChild(body);
            
            commentsContainer.appendChild(commentElement);
        });

    } catch (error){
        console.error('Error loading comments:', error);
        clearContainer(commentsContainer);
        const errorState = createDiv('error-state', 'Failed to load comments. Please check your connection and try again.');
        commentsContainer.appendChild(errorState);
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
        if(e.key === 'Escape' && !modal.classList.contains('hidden')){
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
    clearContainer(modalContent);
    
    // Show loading state
    modalContent.appendChild(createParagraph('Loading profile...'));

    try {
        // Fetch user details (will use cache if available)
        const user = await fetchUser(userId);

        if(!user){
            clearContainer(modalContent);
            const errorState = createDiv('error-state', 'User not found');
            modalContent.appendChild(errorState);
            return;
        }

        clearContainer(modalContent);

        // Create profile header
        const profileHeader = createDiv('modal-profile-header');
        
        const profileImage = createImage(user.image, `${user.firstName} ${user.lastName}`, 'modal-profile-image');
        profileHeader.appendChild(profileImage);
        
        const profileName = createHeading(2, `${user.firstName} ${user.lastName}`, 'modal-profile-name');
        profileHeader.appendChild(profileName);
        
        const profileUsername = createParagraph(`@${user.username}`);
        profileUsername.className = 'modal-profile-username';
        profileHeader.appendChild(profileUsername);
        
        modalContent.appendChild(profileHeader);

        // Create profile details container
        const profileDetails = createDiv('modal-profile-details');

        // Helper function to add detail items
        const addDetailItem = (label, value) => {
            const item = createDiv('profile-detail-item');
            const labelEl = document.createElement('strong');
            labelEl.textContent = label;
            item.appendChild(labelEl);
            const valueEl = createSpan('', value);
            item.appendChild(valueEl);
            profileDetails.appendChild(item);
        };

        addDetailItem('📧 Email:', user.email);
        addDetailItem('📍 Address:', `${user.address.address}, ${user.address.city}, ${user.address.state} ${user.address.postalCode}`);
        addDetailItem('📞 Phone:', user.phone);
        addDetailItem('🎂 Age:', `${user.age} years old`);
        addDetailItem('👁️ Eye Color:', user.eyeColor);
        addDetailItem('📏 Height:', `${user.height} cm`);
        addDetailItem('⚖️ Weight:', `${user.weight} kg`);
        addDetailItem('🩸 Blood Type:', user.bloodGroup);

        modalContent.appendChild(profileDetails);

    } catch(error){
        console.error('Error loading user profile:', error);
        clearContainer(modalContent);
        const errorState = createDiv('error-state', 'Failed to load profile. Please check your internet connection and try again.');
        modalContent.appendChild(errorState);
    }
}

// View user profile with their posts
async function viewUserProfile(userId) {

    showView('profile');

    const profileContent = document.getElementById('profile-content');
    const userPostsContainer = document.getElementById('user-posts-container');

    // Clear containers
    clearContainer(profileContent);
    clearContainer(userPostsContainer);
    
    // Show loading state
    profileContent.appendChild(createParagraph('Loading profile...'));

    try {
        // Fetch user details
        const user = await fetchUser(userId);

        if(!user){
            clearContainer(profileContent);
            const errorState = createDiv('error-state', 'User not found.');
            profileContent.appendChild(errorState);
            return;
        }

        // Store current user 
        appData.currentUser = user;

        // Clear loading and create profile card
        clearContainer(profileContent);
        
        const profileCard = createDiv('profile-card');
        const profileHeader = createDiv('profile-header');
        
        // Profile image
        const profileImage = createImage(user.image, `${user.firstName} ${user.lastName}`, 'profile-image');
        profileHeader.appendChild(profileImage);
        
        // Profile info
        const profileInfo = createDiv('profile-info');
        
        const name = createHeading(2, `${user.firstName} ${user.lastName}`);
        profileInfo.appendChild(name);
        
        const username = createParagraph(`@${user.username}`);
        username.className = 'profile-username';
        profileInfo.appendChild(username);
        
        const email = createParagraph(`📧 ${user.email}`);
        email.className = 'profile-email';
        profileInfo.appendChild(email);
        
        const details = createParagraph();
        details.className = 'profile-details';
        
        // Create address line
        const addressLine = createSpan('', `📍 ${user.address.city}, ${user.address.state}`);
        details.appendChild(addressLine);
        
        // Add line break
        details.appendChild(document.createElement('br'));
        
        // Create age and eye color line
        const detailsLine = createSpan('', `🎂 Age: ${user.age} | 👁️ ${user.eyeColor} eyes | ${user.height}cm`);
        details.appendChild(detailsLine);
        
        profileInfo.appendChild(details);
        
        profileHeader.appendChild(profileInfo);
        profileCard.appendChild(profileHeader);
        profileContent.appendChild(profileCard);

        // Load user's posts
        await loadUserPosts(userId);

    } catch (error) {
        console.error('Error loading profile', error);
        clearContainer(profileContent);
        const errorState = createDiv('error-state', 'Failed to load profile. Please check your connection and try again.');
        profileContent.appendChild(errorState);
    }
}

// Load all posts by a specific user
async function loadUserPosts(userId) {
    const userPostsContainer = document.getElementById('user-posts-container');
    clearContainer(userPostsContainer);
    
    // Show loading state
    userPostsContainer.appendChild(createParagraph('Loading user posts...'));
    
    try {
        const response = await fetch(`https://dummyjson.com/posts/user/${userId}`);
        
        if (!response.ok) {
            throw new Error(`Failed to fetch user posts: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.posts.length === 0) {
            clearContainer(userPostsContainer);
            const emptyState = createDiv('empty-state', 'No posts available from this user.');
            userPostsContainer.appendChild(emptyState);
            return;
        }
        
        clearContainer(userPostsContainer);
        
        for (const post of data.posts) {
            const postElement = createArticle('post-card');
            
            // Title
            const title = createHeading(3, post.title, 'post-title');
            title.dataset.postId = post.id;
            title.addEventListener('click', () => viewPostDetail(post.id));
            postElement.appendChild(title);
            
            // Meta
            const postMeta = createDiv('post-meta');
            const reactions = createSpan('reactions', `❤️ ${post.reactions.likes} likes`);
            const views = createSpan('views', `👁️ ${post.views} views`);
            postMeta.appendChild(reactions);
            postMeta.appendChild(views);
            postElement.appendChild(postMeta);
            
            // Body
            const body = createParagraph(post.body);
            body.className = 'post-body';
            postElement.appendChild(body);
            
            // Tags
            const tagsContainer = createDiv('post-tags');
            post.tags.forEach(tag => {
                const tagSpan = createSpan('tag', tag);
                tagsContainer.appendChild(tagSpan);
            });
            postElement.appendChild(tagsContainer);
            
            userPostsContainer.appendChild(postElement);
        }
        
    } catch (error) {
        console.error('Error loading user posts:', error);
        clearContainer(userPostsContainer);
        const errorState = createDiv('error-state', 'Failed to load user posts. Please check your connection and try again.');
        userPostsContainer.appendChild(errorState);
    }
}

// Contact Form
function setupContactForm(){
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

        // Success message 
        const successMessage = document.getElementById('success-message');
        successMessage.classList.remove('hidden');

        // Reset form
        form.reset();

        // Hide success message after 5 sec and store timeout ID
        successTimeoutId = setTimeout(() => {
            successMessage.classList.add('hidden');
            successTimeoutId = null;
        }, 5000);
    });
}





