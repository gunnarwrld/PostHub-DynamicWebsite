/**
 * User Profile Display (Modal & Full Page)
 * 
 * Show user details in two contexts:
 * - Modal: Quick view when clicking author name
 * - Full page: Complete profile with user's posts
 */

import { appData } from './config.js';
import { fetchUser, fetchPostsByUserId } from './api.js';
import { 
    createDiv, createHeading, createParagraph, createImage, 
    createSpan, createArticle, clearContainer 
} from './helpers.js';
import { showView } from './navigation.js';
import { viewPostDetail } from './posts.js';

// ========== Modal Setup ==========

// Initialize modal close interactions
export function setupModal() {
    const modal = document.getElementById('profile-modal');
    const closeBtn = document.querySelector('.close-modal');

    // Close with X button
    closeBtn.addEventListener('click', () => {
        modal.classList.add('hidden');
    });

    // Close when clicking backdrop (outside modal content)
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {  // Only if clicked modal, not child
            modal.classList.add('hidden');
        }
    });

    // Close with Escape key (accessibility)
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
            modal.classList.add('hidden');
        }
    });
}

// ========== Profile Modal (Quick View) ==========

// Show user profile in modal popup
export async function openUserProfileModal(userId) {
    const modal = document.getElementById('profile-modal');
    const modalContent = document.getElementById('modal-profile-content');

    modal.classList.remove('hidden');
    clearContainer(modalContent);
    
    modalContent.appendChild(createParagraph('Loading profile...'));

    try {
        // Fetch from cache if available
        const user = await fetchUser(userId);

        if (!user) {
            clearContainer(modalContent);
            const errorState = createDiv('error-state', 'User not found');
            modalContent.appendChild(errorState);
            return;
        }

        clearContainer(modalContent);

        // Profile header (image, name, username)
        const profileHeader = createDiv('modal-profile-header');
        
        const profileImage = createImage(user.image, `${user.firstName} ${user.lastName}`, 'modal-profile-image');
        profileHeader.appendChild(profileImage);
        
        const profileName = createHeading(2, `${user.firstName} ${user.lastName}`, 'modal-profile-name');
        profileHeader.appendChild(profileName);
        
        const profileUsername = createParagraph(`@${user.username}`);
        profileUsername.className = 'modal-profile-username';
        profileHeader.appendChild(profileUsername);
        
        modalContent.appendChild(profileHeader);

        // Profile details list
        const profileDetails = createDiv('modal-profile-details');

        // Helper to reduce repetitive code for detail items
        const addDetailItem = (label, value) => {
            const item = createDiv('profile-detail-item');
            const labelEl = document.createElement('strong');
            labelEl.textContent = label;
            item.appendChild(labelEl);
            const valueEl = createSpan('', value);
            item.appendChild(valueEl);
            profileDetails.appendChild(item);
        };

        // Add all user details
        addDetailItem('📧 Email:', user.email);
        addDetailItem('📍 Address:', `${user.address.address}, ${user.address.city}, ${user.address.state} ${user.address.postalCode}`);
        addDetailItem('📞 Phone:', user.phone);
        addDetailItem('🎂 Age:', `${user.age} years old`);
        addDetailItem('👁️ Eye Color:', user.eyeColor);
        addDetailItem('📏 Height:', `${user.height} cm`);
        addDetailItem('⚖️ Weight:', `${user.weight} kg`);
        addDetailItem('🩸 Blood Type:', user.bloodGroup);
        addDetailItem('🦱 Hair:',`${user.hair.color} (${user.hair.type})`);

        modalContent.appendChild(profileDetails);

        // Add "View Full Profile" button to see user's posts
        const viewFullProfileBtn = document.createElement('button');
        viewFullProfileBtn.textContent = 'View Full Profile & Posts';
        viewFullProfileBtn.className = 'view-profile-btn';
        viewFullProfileBtn.addEventListener('click', () => {
            modal.classList.add('hidden');  // Close modal
            viewUserProfile(userId);  // Navigate to full profile page
        });
        modalContent.appendChild(viewFullProfileBtn);

    } catch (error) {
        console.error('Error loading user profile:', error);
        clearContainer(modalContent);
        const errorState = createDiv('error-state', 'Failed to load profile. Please check your internet connection and try again.');
        modalContent.appendChild(errorState);
    }
}

// ========== Full Profile Page ==========

// Show complete user profile with their posts
export async function viewUserProfile(userId) {
    showView('profile');

    const profileContent = document.getElementById('profile-content');
    const userPostsContainer = document.getElementById('user-posts-container');

    clearContainer(profileContent);
    clearContainer(userPostsContainer);
    
    profileContent.appendChild(createParagraph('Loading profile...'));

    try {
        const user = await fetchUser(userId);

        if (!user) {
            clearContainer(profileContent);
            const errorState = createDiv('error-state', 'User not found.');
            profileContent.appendChild(errorState);
            return;
        }

        // Store for other functions to access
        appData.currentUser = user;

        clearContainer(profileContent);
        
        // Build profile card
        const profileCard = createDiv('profile-card');
        const profileHeader = createDiv('profile-header');
        
        const profileImage = createImage(user.image, `${user.firstName} ${user.lastName}`, 'profile-image');
        profileHeader.appendChild(profileImage);
        
        // Profile info section
        const profileInfo = createDiv('profile-info');
        
        const name = createHeading(2, `${user.firstName} ${user.lastName}`);
        profileInfo.appendChild(name);
        
        const username = createParagraph(`@${user.username}`);
        username.className = 'profile-username';
        profileInfo.appendChild(username);
        
        const email = createParagraph(`📧 ${user.email}`);
        email.className = 'profile-email';
        profileInfo.appendChild(email);
        
        // Additional details
        const details = createParagraph();
        details.className = 'profile-details';
        
        const addressLine = createSpan('', `📍 ${user.address.city}, ${user.address.state}`);
        details.appendChild(addressLine);
        
        details.appendChild(document.createElement('br'));  // Line break
        
        const detailsLine = createSpan('', `🎂 Age: ${user.age} | 👁️ ${user.eyeColor} eyes | ${user.height}cm`);
        details.appendChild(detailsLine);
        
        profileInfo.appendChild(details);
        
        profileHeader.appendChild(profileInfo);
        profileCard.appendChild(profileHeader);
        profileContent.appendChild(profileCard);

        // Load user's posts below profile
        await loadUserPosts(userId);

    } catch (error) {
        console.error('Error loading profile', error);
        clearContainer(profileContent);
        const errorState = createDiv('error-state', 'Failed to load profile. Please check your connection and try again.');
        profileContent.appendChild(errorState);
    }
}

// Load all posts by specific user (for profile page)
async function loadUserPosts(userId) {
    const userPostsContainer = document.getElementById('user-posts-container');
    clearContainer(userPostsContainer);
    
    userPostsContainer.appendChild(createParagraph('Loading user posts...'));
    
    try {
        const data = await fetchPostsByUserId(userId);
        
        // Empty state
        if (data.posts.length === 0) {
            clearContainer(userPostsContainer);
            const emptyState = createDiv('empty-state', 'No posts available from this user.');
            userPostsContainer.appendChild(emptyState);
            return;
        }
        
        clearContainer(userPostsContainer);
        
        // Display each post (similar to posts.js but no author shown)
        for (const post of data.posts) {
            const postElement = createArticle('post-card');
            
            // Clickable title
            const title = createHeading(3, post.title, 'post-title');
            title.dataset.postId = post.id;
            title.addEventListener('click', () => viewPostDetail(post.id));
            postElement.appendChild(title);
            
            // Meta (no author since we're on user profile)
            const postMeta = createDiv('post-meta');
            const reactions = createSpan('reactions', `❤️ ${post.reactions.likes} likes`);
            const views = createSpan('views', `👁️ ${post.views} views`);
            postMeta.appendChild(reactions);
            postMeta.appendChild(views);
            postElement.appendChild(postMeta);
            
            // Body preview
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
