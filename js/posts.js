/**
 * POSTS.JS - Posts Display & Pagination Logic
 * 
 * WHY? Handle posts list, detail view, pagination, loading states
 * Core feature of the app - displays blog posts from API
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

// ========== Posts List ==========

// Load batch of posts from API
export async function loadPosts() {
    // Guard clause: prevent duplicate requests
    if (appData.isLoading) return;
    
    const postsContainer = document.getElementById('posts-container');
    
    try {
        // Set loading flag (prevents multiple simultaneous requests)
        appData.isLoading = true;
        showSpinner();
        
        // Fetch posts (limit = how many, skip = offset for pagination)
        const data = await fetchPosts(appData.postsPerPage, appData.currentSkip);
        
        // Store total (used to hide "Load More" when all loaded)
        appData.totalPosts = data.total;
        
        // Empty state check
        if (data.posts.length === 0 && appData.posts.length === 0) {
            const emptyState = createDiv('empty-state', 'No posts available at the moment.');
            postsContainer.appendChild(emptyState);
            hideSpinner();
            return;
        }
        
        // Add new posts to state (spread operator maintains existing posts)
        appData.posts.push(...data.posts);
        
        // Update skip counter for next batch
        appData.currentSkip += data.posts.length;
        
        // Display all fetched posts (Promise.all = parallel execution)
        await Promise.all(data.posts.map(post => displayPost(post)));
        
        hideSpinner();
        
        // Show/hide "Load More" button based on remaining posts
        updateLoadMoreButton();
        
    } catch (error) {
        console.error('Error loading posts:', error);
        hideSpinner();
        const errorState = createDiv('error-state', 'Failed to load posts. Please check your internet connection and try again.');
        postsContainer.appendChild(errorState);
    } finally {
        // Always reset loading state (even if error occurs)
        appData.isLoading = false;
    }
}

// Display single post card
export async function displayPost(post) {
    const postsContainer = document.getElementById('posts-container');
    
    try {
        // Fetch author info (cached by api.js)
        const user = await fetchUser(post.userId);
        const authorName = user ? `${user.firstName} ${user.lastName}` : `User ${post.userId}`;
        
        // Create post card structure
        const postElement = createArticle('post-card');
        
        // Clickable title → post detail view
        const title = createHeading(3, post.title, 'post-title');
        title.dataset.postId = post.id;  // Store ID for event handler
        title.style.cursor = 'pointer';
        title.addEventListener('click', () => viewPostDetail(post.id));
        
        // Post metadata (author, likes, views, bookmark)
        const postMeta = createDiv('post-meta');
        
        // Clickable author → profile modal
        const author = createSpan('author', `👤 ${authorName}`);
        author.dataset.userId = post.userId;
        author.style.cursor = 'pointer';
        author.addEventListener('click', () => openUserProfileModal(post.userId));
        postMeta.appendChild(author);
        
        const reactions = createSpan('reactions', `❤️ ${post.reactions.likes} likes`);
        postMeta.appendChild(reactions);
        
        const views = createSpan('views', `👁️ ${post.views} views`);
        postMeta.appendChild(views);

        // Bookmark button with color toggle
        const bookmark = createButton('🔖', 'bookmarkBtn', `btn${post.id}`);
        bookmark.addEventListener('click', changeBtnColor)
        postMeta.appendChild(bookmark);
        
        // Post body preview
        const body = createParagraph(post.body);
        body.className = 'post-body';
        
        // Tags
        const tagsContainer = createDiv('post-tags');
        post.tags.forEach(tag => {
            const tagSpan = createSpan('tag', tag);
            tagsContainer.appendChild(tagSpan);
        });
        
        // Assemble card
        postElement.appendChild(title);
        postElement.appendChild(postMeta);
        postElement.appendChild(body);
        postElement.appendChild(tagsContainer);
        
        postsContainer.appendChild(postElement);
    } catch (error) {
        console.error('Error displaying post:', error);
        // Fallback: show post even if user fetch fails
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

// ========== Post Detail View ==========

// Show full post with comments
export async function viewPostDetail(postId) {
    showView('post-detail');

    const postContent = document.getElementById('post-content');
    const commentsContainer = document.getElementById('comments-container');

    // Clear previous content
    clearContainer(postContent);
    clearContainer(commentsContainer);
    
    // Loading state
    postContent.appendChild(createParagraph('Loading post...'));

    try {
        const post = await fetchPostById(postId);

        // Store for other functions to access
        appData.currentPost = post;

        // Fetch author
        const user = await fetchUser(post.userId);
        const authorName = user ? `${user.firstName} ${user.lastName}` : `User ${post.userId}`;

        // Clear loading message
        clearContainer(postContent);

        // Build detail card
        const article = createArticle('post-detail-card');

        const title = createHeading(2, post.title);
        article.appendChild(title);

        // Metadata
        const postMeta = createDiv('post-meta');
        
        const author = createSpan('author', `👤 ${authorName}`);
        author.dataset.userId = post.userId;
        author.addEventListener('click', () => openUserProfileModal(post.userId));
        postMeta.appendChild(author);
        
        // Show both likes and dislikes in detail view
        const reactions = createSpan('reactions', `❤️ ${post.reactions.likes} likes | 👎 ${post.reactions.dislikes} dislikes`);
        postMeta.appendChild(reactions);
        
        const views = createSpan('views', `👁️ ${post.views} views`);
        postMeta.appendChild(views);

        const bookmark = createButton('🔖', 'bookmarkBtn', `btn${post.id}`);
        bookmark.addEventListener('click', changeBtnColor)
        postMeta.appendChild(bookmark);
        
        article.appendChild(postMeta);

        // Tags
        const tagsContainer = createDiv('post-tags');
        post.tags.forEach(tag => {
            const tagSpan = createSpan('tag', tag);
            tagsContainer.appendChild(tagSpan);
        });
        article.appendChild(tagsContainer);

        // Full body text
        const body = createParagraph(post.body);
        body.className = 'post-full-body';
        article.appendChild(body);

        postContent.appendChild(article);

        // Load comments below post
        await loadComments(postId);

    } catch (error) {
        console.error('Error loading post detail:', error);
        clearContainer(postContent);
        const errorState = createDiv('error-state', 'Failed to load post. Please check your connection and try again.');
        postContent.appendChild(errorState);
    }
}

// ========== Pagination ==========

// Load next batch when user clicks "Load More"
export async function loadMorePosts() {
    const loadMoreBtn = document.getElementById('load-more-btn');
    
    // Disable to prevent double-click
    loadMoreBtn.disabled = true;
    loadMoreBtn.textContent = 'Loading...';
    
    await loadPosts();
    
    // Re-enable
    loadMoreBtn.disabled = false;
    loadMoreBtn.textContent = 'Load More Posts';
}

// Initialize "Load More" button
export function setupLoadMoreButton() {
    const loadMoreBtn = document.getElementById('load-more-btn');
    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', loadMorePosts);
    }
}

// Initialize "Scroll to Top" button
export function setupBackToTopButton() {
    const container = document.getElementById('scrollToTop');
    const scrollToTopBtn = createButton('↑', 'hidden', 'scroll-btn', () =>{window.scrollTo({top: 0, behavior: 'smooth'})});
    container.appendChild(scrollToTopBtn);
    
    // Show button when user scrolls down 200px
    window.addEventListener('scroll', () => {
        if (window.scrollY > 200) {
            scrollToTopBtn.classList.remove('hidden');
        } else {
            scrollToTopBtn.classList.add('hidden');
        }   
    })
}

// Show/hide "Load More" based on remaining posts
function updateLoadMoreButton() {
    const loadMoreBtn = document.getElementById('load-more-btn');
    
    // Hide when all posts loaded
    if (appData.currentSkip >= appData.totalPosts) {
        loadMoreBtn.classList.add('hidden');
    } else {
        loadMoreBtn.classList.remove('hidden');
    }
}

// ========== UI Helpers ==========

function showSpinner() {
    const spinner = document.getElementById('loading-spinner');
    if (spinner) {
        spinner.classList.remove('hidden');
    }
}

function hideSpinner() {
    const spinner = document.getElementById('loading-spinner');
    if (spinner) {
        spinner.classList.add('hidden');
    }
}