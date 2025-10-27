export function randomWelcomeMessages() {
    const welcomeMessages = ["Welcome User!", "Hello Person!", "Greetings Viewer!", "Hi There!"];
    document.getElementById("welcomeMessage").textContent = welcomeMessages[Math.floor(Math.random() * welcomeMessages.length)];
    }