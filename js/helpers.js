/**
 * DOM Helper Functions for Safe Element Creation
 */

/**
 * Creates an article with specified class
 */
export function createArticle(className = '') {
    const article = document.createElement('article');
    if (className) article.className = className;
    return article;
}

/**
 * Creates a div with specified class and optional text content
 */
export function createDiv(className = '', textContent = '') {
    const div = document.createElement('div');
    if (className) div.className = className;
    if (textContent) div.textContent = textContent;
    return div;
}

/**
 * Creates a paragraph element with optional text content
 */
export function createParagraph(textContent = '') {
    const p = document.createElement('p');
    if (textContent) p.textContent = textContent;
    return p;
}

/**
 * Creates a span element with optional class and text content
 */
export function createSpan(className = '', textContent = '') {
    const span = document.createElement('span');
    if (className) span.className = className;
    if (textContent) span.textContent = textContent;
    return span;
}

/**
 * Safely creates an image element with src, alt, and optional class
 */
export function createImage(src, alt, className = '') {
    const img = document.createElement('img');
    img.src = src;
    img.alt = alt;
    if (className) img.className = className;
    return img;
}

/**
 * Safely creates a heading element
 */
export function createHeading(level, textContent, className = '') {
    const heading = document.createElement(`h${level}`);
    heading.textContent = textContent;
    if (className) heading.className = className;
    return heading;
}

/**
 * Creates a button element with text, optional class, and optional click handler
 */
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

/**
 * Creates an anchor (link) element with href, text, and optional class
 */
export function createLink(href, textContent, className = '') {
    const link = document.createElement('a');
    link.href = href;
    link.textContent = textContent;
    if (className) link.className = className;
    return link;
}

/**
 * Creates an input element with type, id, and optional attributes
 */
export function createInput(type, id, attributes = {}) {
    const input = document.createElement('input');
    input.type = type;
    if (id) input.id = id;
    
    // Apply additional attributes
    Object.keys(attributes).forEach(key => {
        if (key === 'className') {
            input.className = attributes[key];
        } else if (key === 'value') {
            input.value = attributes[key];
        } else {
            input.setAttribute(key, attributes[key]);
        }
    });
    
    return input;
}

/**
 * Creates a label element for form inputs
 */
export function createLabel(forId, textContent, className = '') {
    const label = document.createElement('label');
    if (forId) label.htmlFor = forId;
    label.textContent = textContent;
    if (className) label.className = className;
    return label;
}

/**
 * Creates a textarea element with optional attributes
 */
export function createTextarea(id, attributes = {}) {
    const textarea = document.createElement('textarea');
    if (id) textarea.id = id;
    
    // Apply additional attributes
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

/**
 * Creates a list item (li) element
 */
export function createListItem(textContent = '', className = '') {
    const li = document.createElement('li');
    if (textContent) li.textContent = textContent;
    if (className) li.className = className;
    return li;
}

/**
 * Creates an unordered list (ul) element
 */
export function createUnorderedList(className = '') {
    const ul = document.createElement('ul');
    if (className) ul.className = className;
    return ul;
}

/**
 * Creates an ordered list (ol) element
 */
export function createOrderedList(className = '') {
    const ol = document.createElement('ol');
    if (className) ol.className = className;
    return ol;
}

/**
 * Clears all children from a container
 */
export function clearContainer(container) {
    while (container.firstChild) {
        container.removeChild(container.firstChild);
    }
}

// USAGE EXAMPLES OF HELPERS JS

// // Button with click handler
// const submitBtn = createButton('Submit', 'btn-primary', () => {
//     console.log('Clicked!');
// });

// // Input with attributes
// const emailInput = createInput('email', 'user-email', {
//     placeholder: 'Enter email',
//     required: true,
//     className: 'form-input'
// });

// // List with items
// const list = createUnorderedList('menu-list');
// list.appendChild(createListItem('Home', 'menu-item'));
// list.appendChild(createListItem('About', 'menu-item'));

// // Link
// const link = createLink('#posts', 'View Posts', 'nav-link');
