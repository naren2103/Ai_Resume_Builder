# AI Resume Builder

AI-powered resume builder application that helps users create professional resumes using AI assistance.

## Features

- AI Resume Generation
- User-friendly Interface
- Resume Templates
- Export Functionality

## Tech Stack

- React
- Vite
- Node.js
- Express.js
- JavaScript

---

## Project Structure

```text
ai-resume-builder/
│── client/          # Frontend
│── server/         # Backend
│── README.md
```

---

## Installation

Clone the repository:

```bash
git clone https://github.com/YOUR_USERNAME/ai-resume-builder.git
```

Move into project folder:

```bash
cd ai-resume-builder
```

Install frontend dependencies:

```bash
cd client
npm install
```

Install backend dependencies:

```bash
cd ../server
npm install
```

---

## Running the Project

### Step 1: Start Frontend (Client)

Open terminal 1:

```bash
cd client
npm run dev
```

Frontend runs on:

```text
http://localhost:5173
```

Keep this terminal running.

---

### Step 2: Start Backend

Open terminal 2:

```bash
cd server
npm run dev
```

Backend server will start.

Keep this terminal running.

---

## Environment Variables

Create `.env` file inside backend folder:

```env
GEMINI_API_KEY=YOUR_API_KEY
```

Replace `YOUR_API_KEY` with your actual API key.

---

## Usage

1. Start frontend using `npm run dev` inside `client`
2. Start backend using `npm run dev` inside `server`
3. Open:

```text
http://localhost:5173
```

4. Generate resumes using AI assistance.

---
