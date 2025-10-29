/**
 * Welcome Message Feature
 * 
 * Add dynamic welcome message to home page
 * Randomly selects greeting from array for variety
 */

// Display random welcome message on home page
export function randomWelcomeMessages() {
    const welcomeMessages = ["Welcome User!", "Hello Person!", "Greetings Viewer!", "Hi There!"];
    // Math.random() * array.length gives 0 to 3.999...
    // Math.floor() rounds down to 0, 1, 2, or 3 (valid indexes)
    document.getElementById("welcomeMessage").textContent = welcomeMessages[Math.floor(Math.random() * welcomeMessages.length)];
}