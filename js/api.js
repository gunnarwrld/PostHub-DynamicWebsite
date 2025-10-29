/**
 *DummyJSON API Communication Layer
 * 
 * Centralize all API calls, implement caching, handle errors
 * All fetch operations go through here
 */

import { API_BASE_URL, appData } from './config.js';

// ========== User Data ==========

// Fetch user with caching - avoids duplicate requests
export async function fetchUser(userId) {
    // Return cached user if already fetched (performance optimization)
    if (appData.users[userId]) {
        return appData.users[userId];
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/users/${userId}`);
        
        // Check HTTP status (200-299 = success)
        if (!response.ok) {
            throw new Error(`Failed to fetch user: ${response.status}`);
        }
        
        const user = await response.json();
        
        // Store in cache for future use (reduces API calls)
        appData.users[userId] = user;
        
        return user;
    } catch (error) {
        console.error(`Error fetching user ${userId}:`, error);
        throw error;  // Re-throw so caller can handle
    }
}

// ========== Posts Data ==========

// Fetch posts with pagination (limit = how many, skip = offset)
export async function fetchPosts(limit, skip) {
    const response = await fetch(`${API_BASE_URL}/posts?limit=${limit}&skip=${skip}`);
    
    if (!response.ok) {
        throw new Error(`Failed to fetch posts: ${response.status}`);
    }
    
    return await response.json();  // Returns { posts: [], total: N, skip: M, limit: L }
}

// Fetch single post for detail view
export async function fetchPostById(postId) {
    const response = await fetch(`${API_BASE_URL}/posts/${postId}`);
    
    if (!response.ok) {
        throw new Error(`Failed to fetch post: ${response.status}`);
    }
    
    return await response.json();
}

// Fetch all posts by specific user (for profile view)
export async function fetchPostsByUserId(userId) {
    const response = await fetch(`${API_BASE_URL}/posts/user/${userId}`);
    
    if (!response.ok) {
        throw new Error(`Failed to fetch user posts: ${response.status}`);
    }
    
    return await response.json();
}

// ========== Comments Data ==========

// Fetch comments for a post (used in post detail view)
export async function fetchCommentsByPostId(postId) {
    const response = await fetch(`${API_BASE_URL}/comments/post/${postId}`);
    
    if (!response.ok) {
        throw new Error(`Failed to fetch comments: ${response.status}`);
    }
    
    return await response.json();  // Returns { comments: [], total: N }
}
