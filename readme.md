# RoasterAI

A small chat UI backed by an Express API that forwards messages to DeepSeek and returns short roast-style replies.

## Features

- Simple chat interface in the browser
- Express API at `/api/chat`
- DeepSeek integration for AI responses
- Vercel-friendly static asset setup

## Requirements

- Node.js 18 or newer
- A DeepSeek API key

## Setup

1. Install dependencies:

	```bash
	npm install
	```

2. Create a `.env` file in the project root and add your API key:

	```bash
	DEEPSEEK_API_KEY=your_deepseek_api_key_here
	```

## Run locally

Start the Express server:

```bash
node server.js
```

Then open:

```text
http://localhost:3000
```

## Project structure

- `index.html` - main page
- `server.js` - Express app and `/api/chat` route
- `script.js` - browser logic
- `style.css` - browser styling
- `public/` - static assets used for deployment
- `api/chat.js` - Vercel serverless route version of the chat handler

## Deployment on Vercel

The app is set up so Vercel can serve the frontend files and the API separately.

1. Push the repo to GitHub.
2. Import the repository into Vercel.
3. Add `DEEPSEEK_API_KEY` in the Vercel project environment variables.
4. Deploy the project.

If Vercel shows missing CSS or JS files, make sure the browser assets are being served from the root path and that the `public/` folder is included in the deployment.

## Notes

- The frontend sends requests to `/api/chat`.
- The backend expects `req.body.messages` to contain the chat history.
- If replies stop working, the first things to check are the `DEEPSEEK_API_KEY` value and the browser console/network tab.