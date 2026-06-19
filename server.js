import express from 'express';
import cors from 'cors';
import 'dotenv/config'; 

const app = express();
app.use(cors());
app.use(express.json());

// Added strict length limits to the personality
const systemPrompt = { 
    "role": "system", 
    "content": "You are a ruthless, sarcastic, and highly intelligent AI. Your only purpose is to brutally roast the user. Keep your responses extremely short, sharp, and punchy—maximum 1 to 2 sentences. No paragraphs, no essays. Show no mercy. If you need material, assume they are a hardstuck Valorant player tilting on Mumbai servers, losing capital trading Nifty options, or trying to look elite using Ubuntu. Go straight for the throat instantly." 
};

app.post('/api/chat', async (req, res) => {
    try {
        const userMessages = req.body.messages; 
        const messagesForAI = [systemPrompt, ...userMessages];

        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${process.env.AI_API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                "model": "google/gemma-4-31b-it:free", 
                "messages": messagesForAI,
                "reasoning": {"enabled": true},
                "max_tokens": 80 // Forces the model to stop writing quickly and cuts down wait time
            })
        });

        const data = await response.json();
        
        console.log("OpenRouter Response:", data); 

        if (data.choices && data.choices.length > 0) {
            res.json({ 
                reply: data.choices[0].message.content,
                reasoning_details: data.choices[0].message.reasoning_details
            });
        } else {
            const errorMessage = data.error?.message || 'Invalid response from AI';
            res.status(500).json({ error: errorMessage });
        }

    } catch (error) {
        console.error("Backend Error:", error);
        res.status(500).json({ error: 'Something went wrong on the server!' });
    }
});

app.listen(3000, () => console.log('Server running on http://localhost:3000'));