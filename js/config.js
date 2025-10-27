/**
 * Application configuration and global state
 */
export const appData = {
    posts: [],
    users: {}, // Object for easier lookup by ID
    currentSkip: 0, // How many posts we've already loaded
    postsPerPage: 10, // Posts Limit
    totalPosts: 0, // Total posts available from API
    isLoading: false, // Track if we're currently loading
    currentPost: null, // Store currently viewed post
    currentUser: null // Store currently viewed user
};

export const API_BASE_URL = 'https://dummyjson.com';
