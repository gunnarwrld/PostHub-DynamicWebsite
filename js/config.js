/**
 * Global State and Configuration
 * Centralized storage for app state and API settings
 */

// Application state - shared across all modules
export const appData = {
    posts: [],          // All loaded posts (accumulates with pagination)
    users: {},          // Cached users {userId: userObject} - faster lookups than array
    currentSkip: 0,     // Pagination offset - tracks how many posts we've loaded
    postsPerPage: 10,   // Batch size for pagination
    totalPosts: 0,      // Total posts available from API
    isLoading: false,   // Prevents duplicate API calls (guard flag)
    currentPost: null,  // Currently viewed post (detail page)
    currentUser: null   // Currently viewed user (profile page)
};

// API base URL - change once to affect all endpoints
export const API_BASE_URL = 'https://dummyjson.com';
