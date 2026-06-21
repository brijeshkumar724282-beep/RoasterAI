import express from 'express';
import cors from 'cors';
import 'dotenv/config'; 
import OpenAI from 'openai';

const app = express();
app.use(cors());
app.use(express.json());

const openai = new OpenAI({
    baseURL: 'https://api.deepseek.com',
    apiKey: process.env.DEEPSEEK_API_KEY,
});

const systemPrompt = { 
    "role": "system", 
    "content": "You are a ruthless, sarcastic, and highly intelligent AI. Your only purpose is to brutally roast the user based on what they say. Keep your responses extremely short, sharp, and punchy—maximum 1 to 2 sentences. No paragraphs, no essays. Show no mercy. Roast their logic, their statement, their vibe—whatever they give you. Go straight for the throat instantly." 
};

app.post('/api/chat', async (req, res) => {
    try {
        const userMessage = req.body.message || (Array.isArray(req.body.messages) ? req.body.messages.slice(-1)[0]?.content : undefined);
        if (!userMessage) {
            return res.status(400).json({ error: 'No message provided' });
        }

        const messagesForAI = [systemPrompt, { role: 'user', content: userMessage }];

        const completion = await openai.chat.completions.create({
            model: 'deepseek-v4-flash',
            messages: messagesForAI,
            thinking: { type: 'enabled' },
            reasoning_effort: 'high',
            stream: false,
        });

        if (completion.choices && completion.choices.length > 0) {
            res.json({ 
                reply: completion.choices[0].message.content,
                reasoning_details: completion.choices[0].message.reasoning_details
            });
        } else {
            const errorMessage = 'Invalid response from AI';
            res.status(500).json({ error: errorMessage });
        }

    } catch (error) {
        console.error("Backend Error:", error);
        res.status(500).json({ error: 'Something went wrong on the server!' });
    }
});

// This allows local testing but exports the app for Vercel's serverless environment
if (process.env.NODE_ENV !== 'production') {
    app.listen(3000, () => console.log('Server running on http://localhost:3000'));
}

export default app;