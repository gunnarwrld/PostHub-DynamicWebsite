/**
 * Posts Management Functions
 */
import { appData } from './config.js';
import { fetchPosts, fetchUser, fetchPostById } from './api.js';
import { 
    createArticle, createDiv, createHeading, createParagraph, 
    createSpan, clearContainer, createButton, changeBtnColor
} from './helpers.js';
import { openUserProfileModal } from './users.js';
import { loadComments } from './comments.js';
import { showView } from './navigation.js';

/**
 * Load posts from API with pagination
 */
export async function loadPosts() {
    // Prevent loading if already loading
    if (appData.isLoading) return;
    
    const postsContainer = document.getElementById('posts-container');
    
    try {
        // Set loading state
        appData.isLoading = true;
        showSpinner();
        
        // Fetch batch of posts from DummyJSON API
        const data = await fetchPosts(appData.postsPerPage, appData.currentSkip);
        
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
        
        // Display each post concurrently
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

/**
 * Display a single post card
 */
export async function displayPost(post) {
    const postsContainer = document.getElementById('posts-container');
    
    try {
        const user = await fetchUser(post.userId);
        const authorName = user ? `${user.firstName} ${user.lastName}` : `User ${post.userId}`;
        
        // Create post card
        const postElement = createArticle('post-card');
        
        // Create title
        const title = createHeading(3, post.title, 'post-title');
        title.dataset.postId = post.id;
        title.style.cursor = 'pointer';
        title.addEventListener('click', () => viewPostDetail(post.id));
        
        // Create post meta
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

        // Bookmark button
        const bookmark = createButton('🔖', 'bookmarkBtn', `btn${post.id}`, () => {bookmark.addEventListener('click', changeBtnColor);});
        postMeta.appendChild(bookmark);
        
        // Create body
        const body = createParagraph(post.body);
        body.className = 'post-body';
        
        // Create tags
        const tagsContainer = createDiv('post-tags');
        post.tags.forEach(tag => {
            const tagSpan = createSpan('tag', tag);
            tagsContainer.appendChild(tagSpan);
        });
        
        // Append all to post element
        postElement.appendChild(title);
        postElement.appendChild(postMeta);
        postElement.appendChild(body);
        postElement.appendChild(tagsContainer);
        
        // Add the post to the page
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

/**
 * View post detail with full content and comments
 */
export async function viewPostDetail(postId) {
    showView('post-detail');

    const postContent = document.getElementById('post-content');
    const commentsContainer = document.getElementById('comments-container');

    // Clear containers
    clearContainer(postContent);
    clearContainer(commentsContainer);
    
    // Show loading state
    postContent.appendChild(createParagraph('Loading post...'));

    try {
        const post = await fetchPostById(postId);

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

        const bookmark = createButton('🔖', 'bookmarkBtn', `btn${post.id}`, () => {bookmark.addEventListener('click', changeBtnColor);});
        postMeta.appendChild(bookmark);
        
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

    } catch (error) {
        console.error('Error loading post detail:', error);
        clearContainer(postContent);
        const errorState = createDiv('error-state', 'Failed to load post. Please check your connection and try again.');
        postContent.appendChild(errorState);
    }
}

/**
 * Load more posts when button is clicked
 */
export async function loadMorePosts() {
    const loadMoreBtn = document.getElementById('load-more-btn');
    
    // Disable button while loading
    loadMoreBtn.disabled = true;
    loadMoreBtn.textContent = 'Loading...';
    
    await loadPosts();
    
    // Re-enable button
    loadMoreBtn.disabled = false;
    loadMoreBtn.textContent = 'Load More Posts';
}

/**
 * Setup the "Load More" button event listener
 */
export function setupLoadMoreButton() {
    const loadMoreBtn = document.getElementById('load-more-btn');
    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', loadMorePosts);
    }
}

/**
 * Setup the "Back to top" button event listener
 */
export function setupBackToTopButton() {
    const container = document.getElementById('scrollToTop');
    const scrollToTopBtn = createButton('↑', 'hidden', 'scroll-btn', () =>{window.scrollTo({top: 0, behavior: 'smooth'})});
    container.appendChild(scrollToTopBtn);
    window.addEventListener('scroll', () => {
        if (window.scrollY > 200) {
            scrollToTopBtn.classList.remove('hidden');
        } else {
            scrollToTopBtn.classList.add('hidden');
        }   
    })
}

/**
 * Show/hide Load More button based on available posts
 */
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

/**
 * Show loading spinner
 */
function showSpinner() {
    const spinner = document.getElementById('loading-spinner');
    if (spinner) {
        spinner.classList.remove('hidden');
    }
}

/**
 * Hide loading spinner
 */
function hideSpinner() {
    const spinner = document.getElementById('loading-spinner');
    if (spinner) {
        spinner.classList.add('hidden');
    }
}