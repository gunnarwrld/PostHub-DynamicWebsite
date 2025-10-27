/**
 * API Communication Functions
 */
import { API_BASE_URL, appData } from './config.js';

/**
 * Fetch user data by ID with caching
 */
export async function fetchUser(userId) {
    // Check if we already have this user cached
    if (appData.users[userId]) {
        return appData.users[userId];
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/users/${userId}`);
        
        if (!response.ok) {
            throw new Error(`Failed to fetch user: ${response.status}`);
        }
        
        const user = await response.json();
        
        // Cache the user for future use
        appData.users[userId] = user;
        
        return user;
    } catch (error) {
        console.error(`Error fetching user ${userId}:`, error);
        throw error;
    }
}

/**
 * Fetch posts with pagination
 */
export async function fetchPosts(limit, skip) {
    const response = await fetch(`${API_BASE_URL}/posts?limit=${limit}&skip=${skip}`);
    
    if (!response.ok) {
        throw new Error(`Failed to fetch posts: ${response.status}`);
    }
    
    return await response.json();
}

/**
 * Fetch a single post by ID
 */
export async function fetchPostById(postId) {
    const response = await fetch(`${API_BASE_URL}/posts/${postId}`);
    
    if (!response.ok) {
        throw new Error(`Failed to fetch post: ${response.status}`);
    }
    
    return await response.json();
}

/**
 * Fetch comments for a specific post
 */
export async function fetchCommentsByPostId(postId) {
    const response = await fetch(`${API_BASE_URL}/comments/post/${postId}`);
    
    if (!response.ok) {
        throw new Error(`Failed to fetch comments: ${response.status}`);
    }
    
    return await response.json();
}

/**
 * Fetch all posts by a specific user
 */
export async function fetchPostsByUserId(userId) {
    const response = await fetch(`${API_BASE_URL}/posts/user/${userId}`);
    
    if (!response.ok) {
        throw new Error(`Failed to fetch user posts: ${response.status}`);
    }
    
    return await response.json();
}
