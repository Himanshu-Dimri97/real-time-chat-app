
const socket = io();

let username = "";

const popup = document.getElementById("usernamePopup");
const joinBtn = document.getElementById("joinBtn");
const usernameInput = document.getElementById("usernameInput");

const chat = document.getElementById("chat");
const messageInput = document.getElementById("messageInput");
const sendBtn = document.getElementById("sendBtn");
const messagesDiv = document.getElementById("messages");

const savedUsername = localStorage.getItem("chat-username");
if (savedUsername) {
    username = savedUsername;
    popup.style.display = "none";
    chat.style.display = "block";
}

function joinChat() {
    const name = usernameInput.value.trim();
    if (name === "") return;

    username = name;
    localStorage.setItem("chat-username", username);

    popup.style.display = "none";
    chat.style.display = "block";
    messageInput.focus();
}

function sendMessage() {
    const message = messageInput.value.trim();
    if (message === "") return;

    const now = new Date();
    const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    socket.emit("chat-message", {
        user: username,
        text: message,
        time: time
    });

    messageInput.value = "";
}

joinBtn.addEventListener("click", joinChat);
sendBtn.addEventListener("click", sendMessage);

usernameInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") joinChat();
});

messageInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") sendMessage();
});


function addMessageToUI(data) {
    const msgDiv = document.createElement("div");
    msgDiv.classList.add("p-2", "rounded-lg", "max-w-[70%]", "break-words", "flex", "flex-col");

    const userSpan = document.createElement("span");
    userSpan.classList.add("font-semibold", "flex", "items-center", "gap-1");

    const icon = document.createElement("span");
    icon.innerHTML = data.user === username
        ? `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-green-500" viewBox="0 0 24 24" fill="currentColor">
           <path d="M12 0C5.372 0 0 5.372 0 12s5.372 12 12 12 12-5.372 12-12S18.628 0 12 0zm-1.2 17.4l-4.2-4.2 1.68-1.68 2.52 2.52 5.64-5.64 1.68 1.68-7.08 7.32z"/>
       </svg>`
        : `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-500" fill="currentColor" viewBox="0 0 24 24">
           <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
       </svg>`;

    userSpan.appendChild(icon);
    userSpan.appendChild(document.createTextNode(data.user === username ? "You" : data.user));

    const textSpan = document.createElement("span");
    textSpan.textContent = data.text;

    const timeSpan = document.createElement("span");
    timeSpan.classList.add("text-xs", "text-gray-500", "mt-1", "self-end");
    timeSpan.textContent = data.time;

    msgDiv.appendChild(userSpan);
    msgDiv.appendChild(textSpan);
    msgDiv.appendChild(timeSpan);

    if (data.user === username) {
        msgDiv.classList.add("self-end", "bg-green-100", "text-right");
    } else {
        msgDiv.classList.add("self-start", "bg-white", "border", "border-gray-300", "text-left");
    }

    messagesDiv.appendChild(msgDiv);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

socket.on("chat-history", (history) => {
    messagesDiv.innerHTML = "";

    history.forEach((msg) => {
        addMessageToUI(msg);
    });
});

socket.on("chat-message", (data) => {
    addMessageToUI(data);
});
