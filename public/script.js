const messagesWindow = document.getElementById('messagesWindow');
const chatInput = document.getElementById('chatInput');
const sendBtn = document.getElementById('sendBtn');

// no persistent chat history in public client

function setSendingState(isSending) {
    chatInput.disabled = isSending;
    sendBtn.disabled = isSending;
    sendBtn.textContent = isSending ? 'Thinking...' : 'Send';
}

function createLoadingRow() {
    const loadingRow = document.createElement('div');
    loadingRow.className = 'message-row ai-row';
    loadingRow.id = 'aiLoadingIndicator';
    loadingRow.innerHTML = `
        <div class="bubble ai-bubble loading-bubble" aria-live="polite" aria-label="AI is responding">
            <span class="loading-text">AI is thinking</span>
            <span class="loading-dots" aria-hidden="true">
                <span></span>
                <span></span>
                <span></span>
            </span>
        </div>
    `;

    return loadingRow;
}

async function sendMessage() {
    const text = chatInput.value.trim();
    if (text === '') return;

    const userRow = document.createElement('div');
    userRow.className = 'message-row user-row';
    userRow.innerHTML = `<div class="bubble user-bubble">${text}</div>`;
    messagesWindow.appendChild(userRow);

    chatInput.value = '';
    messagesWindow.scrollTop = messagesWindow.scrollHeight;

    // no history stored; send only the current message
    setSendingState(true);
    messagesWindow.appendChild(createLoadingRow());
    messagesWindow.scrollTop = messagesWindow.scrollHeight;

    try {
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: text }) 
        });

        const data = await response.json();

        const indicator = document.getElementById('aiLoadingIndicator');
        if (indicator) indicator.remove();

        const aiRow = document.createElement('div');
        aiRow.className = 'message-row ai-row';
        
        if (data.reply) {
            aiRow.innerHTML = `<div class="bubble ai-bubble">${data.reply}</div>`;
        } else {
            aiRow.innerHTML = `<div class="bubble ai-bubble">Error: ${data.error}</div>`;
        }
        
        messagesWindow.appendChild(aiRow);
        messagesWindow.scrollTop = messagesWindow.scrollHeight;

    } catch (error) {
        console.error("Fetch error:", error);
        const indicator = document.getElementById('aiLoadingIndicator');
        if (indicator) indicator.remove();
        // no history to remove
    } finally {
        setSendingState(false);
    }
}

sendBtn.addEventListener('click', sendMessage);
chatInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') sendMessage();
});

Shery.mouseFollower({
  skew: true,
  ease: "cubic-bezier(0.23, 1, 0.320, 1)",
  duration: 1,
});


Shery.makeMagnet(".send-btn", {
  ease: "cubic-bezier(0.23, 1, 0.320, 1)",
  duration: 1,
});

Shery.makeMagnet(".input-area", {
  ease: "cubic-bezier(0.23, 1, 0.320, 1)",
  duration: 1,
});