/**
 * DOM Element Creation Utilities
 * 
 * Avoid repetitive document.createElement() code
 * - DRY principle (Don't Repeat Yourself)
 * - Consistent element creation
 * - Safer (handles optional params)
 * - Easier to maintain/modify

Append child
container.appendChild(element);

Insert before
container.insertBefore(newEl, referenceEl);

Insert adjacent
element.insertAdjacentElement('beforeend', newEl);

**Class Manipulation:**

element.classList.add('active');
element.classList.remove('hidden');
element.classList.toggle('expanded');
element.classList.contains('active');  // true/false
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
export function changeBtnColor(e){
    e.currentTarget.classList.toggle('btn-clicked');
}
