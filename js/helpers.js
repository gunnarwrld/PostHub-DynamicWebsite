/**
 * HELPERS.JS - DOM Element Creation Utilities
 * 
 * WHY? Avoid repetitive document.createElement() code
 * - DRY principle (Don't Repeat Yourself)
 * - Consistent element creation
 * - Safer (handles optional params)
 * - Easier to maintain/modify
 */

// ========== Semantic Elements ==========

// Creates <article> - for post cards, comments (semantic HTML)
export function createArticle(className = '') {
    const article = document.createElement('article');
    if (className) article.className = className;
    return article;
}

// Creates <div> - generic container
export function createDiv(className = '', textContent = '') {
    const div = document.createElement('div');
    if (className) div.className = className;
    if (textContent) div.textContent = textContent;  // textContent is safer than innerHTML (no XSS)
    return div;
}

// Creates <p> - for text blocks
export function createParagraph(textContent = '') {
    const p = document.createElement('p');
    if (textContent) p.textContent = textContent;
    return p;
}

// Creates <span> - inline text (doesn't break line like <div>)
export function createSpan(className = '', textContent = '') {
    const span = document.createElement('span');
    if (className) span.className = className;
    if (textContent) span.textContent = textContent;
    return span;
}

// ========== Media Elements ==========

// Creates <img> - alt text required for accessibility
export function createImage(src, alt, className = '') {
    const img = document.createElement('img');
    img.src = src;
    img.alt = alt;      // Required for screen readers
    if (className) img.className = className;
    return img;
}

// ========== Heading Elements ==========

// Creates <h1> to <h6> dynamically
// Usage: createHeading(2, 'Title', 'class') → <h2>Title</h2>
export function createHeading(level, textContent, className = '') {
    const heading = document.createElement(`h${level}`);  // Template literal for dynamic tag
    heading.textContent = textContent;
    if (className) heading.className = className;
    return heading;
}

// ========== Interactive Elements ==========

// Creates <button> with optional click handler
// typeof check ensures onClick is actually a function
export function createButton(textContent, className = '', id ='', onClick = null) {
    const button = document.createElement('button');
    button.textContent = textContent;
    if (className) button.className = className;
    if (id) button.id = id;
    if (onClick && typeof onClick === 'function') {
        button.addEventListener('click', onClick);
    }
    return button;
}

// Creates <a> - for links/navigation
export function createLink(href, textContent, className = '') {
    const link = document.createElement('a');
    link.href = href;
    link.textContent = textContent;
    if (className) link.className = className;
    return link;
}

// ========== Form Elements ==========

// Creates <input> with flexible attributes
// Object.keys() loops through all provided attributes
export function createInput(type, id, attributes = {}) {
    const input = document.createElement('input');
    input.type = type;
    if (id) input.id = id;
    
    // Apply attributes dynamically
    Object.keys(attributes).forEach(key => {
        if (key === 'className') {
            input.className = attributes[key];  // className is JS property
        } else if (key === 'value') {
            input.value = attributes[key];
        } else {
            input.setAttribute(key, attributes[key]);  // Everything else is HTML attribute
        }
    });
    
    return input;
}

// Creates <label> - htmlFor associates with input (for is reserved word in JS)
export function createLabel(forId, textContent, className = '') {
    const label = document.createElement('label');
    if (forId) label.htmlFor = forId;
    label.textContent = textContent;
    if (className) label.className = className;
    return label;
}

// Creates <textarea> - multi-line text input
export function createTextarea(id, attributes = {}) {
    const textarea = document.createElement('textarea');
    if (id) textarea.id = id;
    
    Object.keys(attributes).forEach(key => {
        if (key === 'className') {
            textarea.className = attributes[key];
        } else if (key === 'value') {
            textarea.value = attributes[key];
        } else {
            textarea.setAttribute(key, attributes[key]);
        }
    });
    
    return textarea;
}

// ========== List Elements ==========

export function createListItem(textContent = '', className = '') {
    const li = document.createElement('li');
    if (textContent) li.textContent = textContent;
    if (className) li.className = className;
    return li;
}

export function createUnorderedList(className = '') {
    const ul = document.createElement('ul');
    if (className) ul.className = className;
    return ul;
}

export function createOrderedList(className = '') {
    const ol = document.createElement('ol');
    if (className) ol.className = className;
    return ol;
}

// ========== Utility Functions ==========

// Removes all children from container
// Why while loop? firstChild changes each iteration until null
// Better than innerHTML = '' (properly removes event listeners)
export function clearContainer(container) {
    while (container.firstChild) {
        container.removeChild(container.firstChild);
    }
}

// Toggles bookmark button color
// currentTarget = element with listener (always the button)
// target = element clicked (could be child element)
export function changeBtnColor(event){
    event.currentTarget.classList.toggle('bookmark-color')
}

// ========== Usage Examples ==========

// Button with click handler
// const submitBtn = createButton('Submit', 'btn-primary', () => console.log('Clicked!'));

// Input with attributes
// const emailInput = createInput('email', 'user-email', {
//     placeholder: 'Enter email',
//     required: true,
//     className: 'form-input'
// });

// List with items
// const list = createUnorderedList('menu-list');
// list.appendChild(createListItem('Home', 'menu-item'));
// list.appendChild(createListItem('About', 'menu-item'));

// // Link
// const link = createLink('#posts', 'View Posts', 'nav-link');

// ### 5. Event Handling - Common Patterns

// #### ✅ **Event Listener Best Practices:**

// **DO:**
// ```javascript
// button.addEventListener('click', (e) => {
//     e.preventDefault();           // Stop default behavior
//     const id = e.currentTarget.dataset.id;  // Get data from element
//     handleClick(id);              // Call handler with closure data
// });
// ```

// **DON'T:**
// ```html
// <!-- Avoid inline handlers -->
// <button onclick="handleClick()">Click</button>
// ```

// #### ✅ **Target vs CurrentTarget:**
// - `e.target` = Element that triggered event (could be child)
// - `e.currentTarget` = Element with the listener (always the one you want)
// - For buttons/toggles: Use `currentTarget`

// #### ✅ **When to Remove Listeners:**
// - Probably never in this project (elements don't get recreated)
// - But know: `element.removeEventListener('click', handler)` (must be same function reference)

// ---

// ### 6. Array & Object Operations

// #### ✅ **Array Methods You Use:**

// ```javascript
// // Add items to array
// appData.posts.push(...newPosts);  // Spread adds all items

// // Transform array
// posts.map(post => displayPost(post));  // Apply function to each

// // Filter array
// posts.filter(post => post.tags.includes('javascript'));

// // Find one item
// posts.find(post => post.id === 5);

// // Iterate
// posts.forEach(post => console.log(post.title));

// // Check if any match
// posts.some(post => post.userId === 5);

// // Check if all match
// posts.every(post => post.reactions.likes > 0);
// ```

// #### ✅ **Object Operations:**

// ```javascript
// // Add/update property
// appData.users[userId] = user;

// // Check if property exists
// if (appData.users[userId]) { ... }

// // Get all keys
// Object.keys(appData.users);  // [1, 2, 3, ...]

// // Iterate over object
// Object.keys(attributes).forEach(key => {
//     element.setAttribute(key, attributes[key]);
// });
// ```

// ---

// ### 7. DOM Manipulation

// #### ✅ **Selection Methods:**

// ```javascript
// // By ID (fastest, most common)
// document.getElementById('posts-container');

// // By class/selector (flexible)
// document.querySelector('.post-card');       // First match
// document.querySelectorAll('.post-card');   // All matches (NodeList)
// ```

// #### ✅ **Adding to DOM:**

// ```javascript
// // Append child
// container.appendChild(element);

// // Insert before
// container.insertBefore(newEl, referenceEl);

// // Insert adjacent
// element.insertAdjacentElement('beforeend', newEl);
// ```

// #### ✅ **Removing from DOM:**

// ```javascript
// // Remove all children (our pattern)
// while (container.firstChild) {
//     container.removeChild(container.firstChild);
// }

// // Remove specific element
// element.remove();
// ```

// #### ✅ **Class Manipulation:**

// ```javascript
// element.classList.add('active');
// element.classList.remove('hidden');
// element.classList.toggle('expanded');
// element.classList.contains('active');  // true/false
// ```

// ---
