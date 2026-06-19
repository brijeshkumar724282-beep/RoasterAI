const messagesWindow = document.getElementById('messagesWindow');
const chatInput = document.getElementById('chatInput');
const sendBtn = document.getElementById('sendBtn');

// This array acts as the AI's memory
let chatHistory = [];

async function sendMessage() {
    const text = chatInput.value.trim();
    if (text === '') return;

    // 1. Show user message
    const userRow = document.createElement('div');
    userRow.className = 'message-row user-row';
    userRow.innerHTML = `<div class="bubble user-bubble">${text}</div>`;
    messagesWindow.appendChild(userRow);

    chatInput.value = '';
    messagesWindow.scrollTop = messagesWindow.scrollHeight;

    // 2. Add user message to history
    chatHistory.push({ role: "user", content: text });

    // 3. Create and show the loading animation bubble
    const loadingRow = document.createElement('div');
    loadingRow.className = 'message-row ai-row';
    loadingRow.id = 'aiLoadingIndicator';
    loadingRow.innerHTML = `
        <div class="bubble ai-bubble loading-bubble">
            <span class="dot"></span>
            <span class="dot"></span>
            <span class="dot"></span>
        </div>
    `;
    messagesWindow.appendChild(loadingRow);
    messagesWindow.scrollTop = messagesWindow.scrollHeight;

    try {
        // 4. Send the entire history array to your backend
        const response = await fetch('http://localhost:3000/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ messages: chatHistory }) 
        });

        const data = await response.json();

        // 5. Remove the loading animation before printing the reply
        const indicator = document.getElementById('aiLoadingIndicator');
        if (indicator) indicator.remove();

        // 6. Show AI response
        const aiRow = document.createElement('div');
        aiRow.className = 'message-row ai-row';
        
        if (data.reply) {
            aiRow.innerHTML = `<div class="bubble ai-bubble">${data.reply}</div>`;
            
            // 7. Save the AI's reply back into the memory
            chatHistory.push({
                role: "assistant",
                content: data.reply,
                reasoning_details: data.reasoning_details
            });
        } else {
            aiRow.innerHTML = `<div class="bubble ai-bubble">Error: ${data.error}</div>`;
            chatHistory.pop(); // Remove user message from memory if it failed
        }
        
        messagesWindow.appendChild(aiRow);
        messagesWindow.scrollTop = messagesWindow.scrollHeight;

    } catch (error) {
        console.error("Fetch error:", error);
        // Remove loading animation if the server crashes completely
        const indicator = document.getElementById('aiLoadingIndicator');
        if (indicator) indicator.remove();
        
        chatHistory.pop(); 
    }
}

sendBtn.addEventListener('click', sendMessage);

chatInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        sendMessage();
    }
});