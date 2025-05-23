const typingForm = document.querySelector(".typing-form");
const chatContainer = document.querySelector(".chat-list");
const suggestions = document.querySelectorAll(".suggestion");
const toggleThemeButton = document.querySelector("#theme-toggle-button");
const deleteChatButton = document.querySelector("#delete-chat-button");
let userMessage = null;
let isResponseGenerating = false;
const API_KEY = "AIzaSyAAkcbFV5ygCvOw9Sb3RajV4E3RGHK0RaM";
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${API_KEY}`;

// Add loading animation
const showLoadingAnimation = () => {
    const html = `
        <div class="message-content loading">
            <img class="avatar" src="gemini.svg" alt="Gemini avatar">
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
        const response = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{
                    role: "user",
                    parts: [{ text: userMessage }],
                }],
            }),
        });

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const data = await response.json();
        const apiResponse = data.candidates[0].content.parts[0].text;

        // Create the actual message content
        const messageContent = `
            <div class="message-content">
                <img class="avatar" src="gemini.svg" alt="Gemini avatar">
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
                <img class="avatar" src="gemini.svg" alt="Gemini avatar">
                <p class="text">Sorry, I encountered an error. Please try again.</p>
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
