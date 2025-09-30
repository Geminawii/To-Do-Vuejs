// // src/server/api/chat.ts
// import type { RequestHandler } from 'vite'
// import { askGemini, ChatMessage } from '../../api/gemini'

// export const POST: RequestHandler = async ({ request }) => {
//   try {
//     const body = await request.json()
//     const messages: ChatMessage[] = body.messages

//     if (!messages) return new Response('Missing messages', { status: 400 })

//     const reply = await askGemini(messages)

//     return new Response(JSON.stringify({ reply }), {
//       headers: { 'Content-Type': 'application/json' },
//     })
//   } catch (err: any) {
//     console.error(err)
//     return new Response(JSON.stringify({ error: err.message || 'Something went wrong' }), {
//       status: 500,
//       headers: { 'Content-Type': 'application/json' },
//     })
//   }
// }
