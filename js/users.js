/**
 * User Profile Management Functions
 */
import { appData } from './config.js';
import { fetchUser, fetchPostsByUserId } from './api.js';
import { 
    createDiv, createHeading, createParagraph, createImage, 
    createSpan, createArticle, clearContainer 
} from './helpers.js';
import { showView } from './navigation.js';
import { viewPostDetail } from './posts.js';

/**
 * Setup modal close functionality
 */
export function setupModal() {
    const modal = document.getElementById('profile-modal');
    const closeBtn = document.querySelector('.close-modal');

    // Close modal when clicking x
    closeBtn.addEventListener('click', () => {
        modal.classList.add('hidden');
    });

    // Close modal when clicking outside the modal
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.add('hidden');
        }
    });

    // Close modal with Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
            modal.classList.add('hidden');
        }
    });
}

/**
 * Open user profile in modal
 */
export async function openUserProfileModal(userId) {
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

        if (!user) {
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
        addDetailItem('🦱 Hair:',`${user.hair.color} (${user.hair.type})`);

        modalContent.appendChild(profileDetails);

    } catch (error) {
        console.error('Error loading user profile:', error);
        clearContainer(modalContent);
        const errorState = createDiv('error-state', 'Failed to load profile. Please check your internet connection and try again.');
        modalContent.appendChild(errorState);
    }
}

/**
 * View user profile with their posts (full page view)
 */
export async function viewUserProfile(userId) {
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

        if (!user) {
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

/**
 * Load all posts by a specific user
 */
async function loadUserPosts(userId) {
    const userPostsContainer = document.getElementById('user-posts-container');
    clearContainer(userPostsContainer);
    
    // Show loading state
    userPostsContainer.appendChild(createParagraph('Loading user posts...'));
    
    try {
        const data = await fetchPostsByUserId(userId);
        
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
