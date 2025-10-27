/**
 * Comments Management Functions
 */
import { fetchCommentsByPostId } from './api.js';
import { createDiv, createParagraph, createSpan, clearContainer } from './helpers.js';

/**
 * Load and display comments for a specific post
 */
export async function loadComments(postId) {
    const commentsContainer = document.getElementById('comments-container');
    clearContainer(commentsContainer);
    
    // Show loading state
    commentsContainer.appendChild(createParagraph('Loading comments...'));

    try {
        const data = await fetchCommentsByPostId(postId);

        if (data.comments.length === 0) {
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

    } catch (error) {
        console.error('Error loading comments:', error);
        clearContainer(commentsContainer);
        const errorState = createDiv('error-state', 'Failed to load comments. Please check your connection and try again.');
        commentsContainer.appendChild(errorState);
    }
}
