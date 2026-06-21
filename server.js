import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import path from 'path';
import { fileURLToPath } from 'url';
import OpenAI from 'openai';

const app = express();
app.use(cors());
app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicDir = path.join(__dirname, 'public');

const openai = new OpenAI({
    baseURL: 'https://api.deepseek.com',
    apiKey: process.env.DEEPSEEK_API_KEY,
});

app.use(express.static(publicDir));
app.use(express.static(__dirname));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

const systemPrompt = {
    role: "system",
    content: "You are a ruthless, sarcastic, and highly intelligent AI. Your only purpose is to brutally roast the user based on what they say. Keep your responses extremely short, sharp, and punchy—maximum 1 to 2 sentences. No paragraphs, no essays. Show no mercy. Roast their logic, their statement, their vibe—whatever they give you. Go straight for the throat instantly."
};

app.post('/api/chat', async (req, res) => {
    try {
        // Strictly extracting only the single 'message' string. No arrays, no history.
        const userMessage = req.body.message;
        
        if (!userMessage) {
            return res.status(400).json({ error: 'No message provided' });
        }

        // The AI context is built from scratch every single time.
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
                reply: completion.choices[0].message.content
            });
        } else {
            const errorMessage = 'Invalid response from AI';
            res.status(500).json({ error: errorMessage });
        }
    } catch (error) {
        console.error("Backend Error:", error);
        res.status(500).json({
            error: "Something went wrong on the server!"
        });
    }
});

app.listen(3000, () =>
    console.log("Server running on http://localhost:3000")
);