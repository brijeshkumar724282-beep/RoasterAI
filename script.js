const messagesWindow = document.getElementById('messagesWindow');
const chatInput = document.getElementById('chatInput');
const sendBtn = document.getElementById('sendBtn');

let chatHistory = [];

async function sendMessage() {
    const text = chatInput.value.trim();
    if (text === '') return;

    // Show user message
    const userRow = document.createElement('div');
    userRow.className = 'message-row user-row';
    userRow.innerHTML = `<div class="bubble user-bubble">${text}</div>`;
    messagesWindow.appendChild(userRow);

    chatInput.value = '';
    messagesWindow.scrollTop = messagesWindow.scrollHeight;

    chatHistory.push({ role: "user", content: text });

    // Show loading animation
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
        // Fetch from the Vercel serverless function
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ messages: chatHistory }) 
        });

        const data = await response.json();

        // Remove loading indicator
        const indicator = document.getElementById('aiLoadingIndicator');
        if (indicator) indicator.remove();

        // Show AI response
        const aiRow = document.createElement('div');
        aiRow.className = 'message-row ai-row';
        
        if (data.reply) {
            aiRow.innerHTML = `<div class="bubble ai-bubble">${data.reply}</div>`;
            
            chatHistory.push({
                role: "assistant",
                content: data.reply,
                reasoning_details: data.reasoning_details
            });
        } else {
            aiRow.innerHTML = `<div class="bubble ai-bubble">Error: ${data.error}</div>`;
            chatHistory.pop(); 
        }
        
        messagesWindow.appendChild(aiRow);
        messagesWindow.scrollTop = messagesWindow.scrollHeight;

    } catch (error) {
        console.error("Fetch error:", error);
        const indicator = document.getElementById('aiLoadingIndicator');
        if (indicator) indicator.remove();
        chatHistory.pop(); 
    }
}

sendBtn.addEventListener('click', sendMessage);
chatInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') sendMessage();
});