import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import Fuse from 'fuse.js'
import type { Request, Response } from 'express'

dotenv.config()

const app = express()
app.use(cors())
app.use(express.json())

const PORT = process.env.PORT || 5000
const API_KEY = process.env.GEMINI_API_KEY
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent?key=${API_KEY}`

// Types
export interface ChatMessage {
  role: 'user' | 'bot'
  content: string
}

const faqAnswers: Record<string, string> = {
    "what is justdoeet": `
This is dedicated to helping you plan and categorise yout daily tasks. Click on the plus sign to begin :D
`,

      "how do i add a new category": `
To add a new category:

1. Go to the "Categories" page in the sidebar.

2. Click the "Add Category" plus button.

3. Enter a category name and save.
`,

      "how do i add a todo": `
To add a new to-do:

1. Go to the home or tasks page.

2. Click the "+" button at the top of the to-dos.

3. Enter the title, description, and due date.

4. Click "Save".
`,

      "how do i delete a todo": `
To delete a to-do:

1. Find the task you want to delete.

2. Click the trash icon or "Delete" button.

3. Confirm deletion when prompted.
`,

      "how do i edit a todo": `
To edit a to-do:

1. Click on the task you want to edit.

2. Modify the title, description, due date, or category.

3. Click "Save" to apply changes.
`,

      "how do i logout": `
To log out:

Use the 'Logout' link in the sidebar menu.
`,


      "thank you": `
You're welcome! :)
`,
}

const getBestMatchFromFAQs = (msg: string) => {
  const normalized = msg.toLowerCase().replace(/[^\w\s]/g, '').trim()

  for (const [key, answer] of Object.entries(faqAnswers)) {
    if (normalized.includes(key)) return answer
  }

  const fuse = new Fuse(Object.keys(faqAnswers), { threshold: 0.4 })
  const result = fuse.search(normalized)

  if (result.length > 0 && result[0].score! <= 0.4) {
    return faqAnswers[result[0].item]
  }

  return null
}


async function askGemini(messages: ChatMessage[]): Promise<string> {
  if (!API_KEY) throw new Error('Missing Gemini API key')

  const latestMessage = messages[messages.length - 1]?.content || ''
  const faqMatch = getBestMatchFromFAQs(latestMessage)
  if (faqMatch) return faqMatch

  const systemInstruction = {
    role: 'user',
    parts: [
      {
        text:  `
You are justaskeet!, a friendly assistant within a to-do application, justdoeet!.

Your role is to help users understand how to use the app by guiding them through steps like adding, editing, or deleting tasks — but you cannot perform these actions directly.

Here are step-by-step instructions you can refer to:

---

What is justdoeet! ?
This app helps users plan and categorize their daily tasks. To get started, click the plus sign atop the dashboard to create a new task.

How to add a new category:
1. Go to the "Categories" page in the sidebar.
2. Add a new category name and save.
3. Browse through various to-dos and add. Voila
4. You can also edit, delete categories with the pencil and trash icon.

How to filter To-Dos:
1. On the Dashboard Page, click on the filter in the navigation bar.
2. Filter accordingly. Voila!

 How to add a to-do:
1. Go to the Dashboard in the sidebar.
2. Click the "+" button at the top of the to-dos.
3. Enter the title, description, priority and due date.
4. Click "Create To-Do".

How to Search for To-Do:
1. On the Dashboard Page, click on the search icon.
2. Search through the todos. If you cannot find one, it's possiblle you deleted or edited the name of the to-do

How to delete a to-do:
1. Find the task(s) you want to delete.
2. Click the trash icon or drag and drop into the trash icon.
3. Confirm the deletion.

How to edit a to-do:
1. Click on the task you want to edit.
2. On the Details page and select the pencil icon at the top, update your to-do.
3. Click "Save".

How to logout:
Use the "Logout" link in the sidebar menu.

---

If a user asks how to perform one of these actions, tell them the steps above. If they ask you to do the task, politely explain that you can’t — but you can show them how.
You can also offer motivation, productivity tips, general knowledge or jokes in various languages and personas if asked.
      `.trim(),
      },
    ],
  }

  const contents = [
    systemInstruction,
    ...messages.map((m) => ({
      role: m.role === 'bot' ? 'model' : 'user',
      parts: [{ text: m.content }],
    })),
  ]

  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contents }),
  })

  if (!res.ok) {
    const errText = await res.text()
    console.error('Gemini API error:', errText)
    throw new Error('Failed to get response from Gemini')
  }

  const data = await res.json()
  const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text

  return reply ?? 'Sorry, I could not understand that.'
}

// POST route
app.post('/api/chat', async (req: Request, res: Response) => {
  try {
    const { messages } = req.body as { messages: ChatMessage[] }

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Invalid request body' })
    }

    const reply = await askGemini(messages)
    return res.json({ reply })
  } catch (error) {
    console.error('Server error:', error)
    return res.status(500).json({ error: 'Something went wrong' })
  }
})

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`)
})
