// AI Chatbot JavaScript
const typingForm = document.querySelector(".typing-form");
const chatContainer = document.querySelector(".chat-list");
const suggestions = document.querySelectorAll(".suggestion");
const toggleThemeButton = document.querySelector("#theme-toggle-button");
const deleteChatButton = document.querySelector("#delete-chat-button");
let userMessage = null;
let isResponseGenerating = false;

// Use a more reliable API endpoint
const API_KEY = "AIzaSyCQaXBse3xnn21y0P0uXYJ5XSpYVfblx6Q";
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

// Add loading animation
const showLoadingAnimation = () => {
    const html = `
        <div class="message-content loading">
            <span class="avatar material-symbols-rounded">help</span>
            <div class="typing-indicator">
                <div class="dot"></div>
                <div class="dot"></div>
                <div class="dot"></div>
            </div>
        </div>
    `;
    const incomingMessageDiv = createMessageElement(html, "incoming");
    chatContainer.appendChild(incomingMessageDiv);
    chatContainer.scrollTo(0, chatContainer.scrollHeight);
    return incomingMessageDiv;
};

const generateAPIResponse = async (incomingMessageDiv) => {
    const textElement = incomingMessageDiv.querySelector(".typing-indicator");
    try {
        // Add API key to the request headers
        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-Goog-Api-Key": API_KEY
            },
            body: JSON.stringify({
                contents: [{
                    role: "user",
                    parts: [{ text: userMessage }]
                }]
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`API Error: ${errorData.error?.message || 'Unknown error'}`);
        }

        const data = await response.json();
        const apiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Sorry, I encountered an error. Please try again.';

        // Create the actual message content
        const messageContent = `
            <div class="message-content">
                <span class="avatar material-symbols-rounded">help</span>
                <p class="text">${apiResponse}</p>
                <span onClick="copyMessage(this)" class="icon material-symbols-rounded">content_copy</span>
            </div>
        `;
        
        incomingMessageDiv.innerHTML = messageContent;
        incomingMessageDiv.classList.remove("loading");
        
        // Add fade-in animation
        incomingMessageDiv.style.opacity = "0";
        incomingMessageDiv.style.transform = "translateY(20px)";
        incomingMessageDiv.style.transition = "opacity 0.3s ease, transform 0.3s ease";
        
        setTimeout(() => {
            incomingMessageDiv.style.opacity = "1";
            incomingMessageDiv.style.transform = "translateY(0)";
        }, 100);

        isResponseGenerating = false;
        localStorage.setItem("saved-chats", chatContainer.innerHTML);
    } catch (error) {
        isResponseGenerating = false;
        const errorMessage = `
            <div class="message-content error">
                <span class="avatar material-symbols-rounded">error</span>
                <p class="text">${error.message}</p>
            </div>
        `;
        incomingMessageDiv.innerHTML = errorMessage;
        incomingMessageDiv.classList.remove("loading");
        console.error('Error:', error);
    }
};

const createMessageElement = (content, ...classes) => {
    const div = document.createElement("div");
    div.classList.add("message", ...classes);
    div.innerHTML = content;
    return div;
};

const copyMessage = (copyButton) => {
    const messageText = copyButton.parentElement.querySelector(".text").innerText;
    navigator.clipboard.writeText(messageText);
    copyButton.innerText = "done";
    setTimeout(() => (copyButton.innerText = "content_copy"), 1000); 
};

const handleOutgoingChat = () => {
    userMessage = typingForm.querySelector(".typing-input").value.trim() || userMessage;
    if (!userMessage || isResponseGenerating) return;

    // Create user message element
    const userMessageElement = `
        <div class="message-content">
            <p class="text">${userMessage}</p>
            <span class="icon material-symbols-rounded">send</span>
        </div>
    `;
    const outgoingMessageDiv = createMessageElement(userMessageElement, "outgoing");
    
    // Add fade-in animation
    outgoingMessageDiv.style.opacity = "0";
    outgoingMessageDiv.style.transform = "translateY(-20px)";
    outgoingMessageDiv.style.transition = "opacity 0.3s ease, transform 0.3s ease";
    
    setTimeout(() => {
        outgoingMessageDiv.style.opacity = "1";
        outgoingMessageDiv.style.transform = "translateY(0)";
    }, 100);

    chatContainer.appendChild(outgoingMessageDiv);
    typingForm.querySelector(".typing-input").value = "";
    isResponseGenerating = true;
    
    // Generate AI response
    const incomingMessageDiv = showLoadingAnimation();
    generateAPIResponse(incomingMessageDiv);
};

const loadDataFromLocalstorage = () => {
    const savedChats = localStorage.getItem("saved-chats");
    const isLightMode = localStorage.getItem("themeColor") === "light_mode";
    document.body.classList.toggle("light_mode", isLightMode);
    toggleThemeButton.innerText = isLightMode ? "dark_mode" : "light_mode";
    chatContainer.innerHTML = savedChats || "";
    document.body.classList.toggle("hide-header", savedChats);
    chatContainer.scrollTo(0, chatContainer.scrollHeight); 
};

// Event listeners
typingForm.addEventListener("submit", (e) => {
    e.preventDefault();
    handleOutgoingChat();
});

toggleThemeButton.addEventListener("click", () => {
    const isLightMode = document.body.classList.toggle("light_mode");
    localStorage.setItem("themeColor", isLightMode ? "light_mode" : "dark_mode");
    toggleThemeButton.innerText = isLightMode ? "dark_mode" : "light_mode";
});

deleteChatButton.addEventListener("click", () => {
    if (confirm("Are you sure you want to delete all the chats?")) {
        localStorage.removeItem("saved-chats");
        loadDataFromLocalstorage();
    }
});

suggestions.forEach((suggestion) => {
    suggestion.addEventListener("click", () => {
        userMessage = suggestion.querySelector(".text").innerText;
        handleOutgoingChat();
    });
});

document.addEventListener("DOMContentLoaded", loadDataFromLocalstorage);
