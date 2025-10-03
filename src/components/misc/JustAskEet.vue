<script setup lang="ts">
import { ref, onMounted, watch, nextTick } from "vue";
import { useMutation } from "@tanstack/vue-query";


type Message = {
  role: "user" | "bot";
  content: string;
};

const STORAGE_KEY = "chatbot_messages";
const messages = ref<Message[]>([]);
const input = ref("");
const minimized = ref(true);
const messagesEndRef = ref<HTMLElement | null>(null);


onMounted(() => {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    messages.value = JSON.parse(saved);
  }
});

watch(messages, (val) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(val));
  nextTick(() => {
    messagesEndRef.value?.scrollIntoView({ behavior: "smooth" });
  });
});

function clearChat() {
  messages.value = [];
  localStorage.removeItem(STORAGE_KEY);
}

import Fuse from 'fuse.js'; // Add this if it's not already imported

const faqAnswers: Record<string, string> = {
  'what is justdoeet': `
This is dedicated to helping you plan and categorise your daily tasks. Click on the plus sign to begin :D
`,
  'how do i add a new category': `
To add a new category:
1. Go to the "Categories" page in the sidebar.
2. Click the "Add Category" plus button.
3. Enter a category name and save.
`,
  'how do i add a todo': `
To add a new to-do:
1. Go to the home or tasks page.
2. Click the "+" button at the top of the to-dos.
3. Enter the title, description, and due date.
4. Click "Save".
`,
  'how do i delete a todo': `
To delete a to-do:
1. Find the task you want to delete.
2. Click the trash icon or "Delete" button.
3. Confirm deletion when prompted.
`,
  'how do i edit a todo': `
To edit a to-do:
1. Click on the task you want to edit.
2. Modify the title, description, due date, or category.
3. Click "Save" to apply changes.
`,
  'how do i logout': `
To log out:
Use the 'Logout' link in the sidebar menu.
`,
  'thank you': `You're welcome! :)`,
};

function getBestMatchFromFAQs(msg: string): string | null {
  const normalized = msg.toLowerCase().replace(/[^\w\s]/g, '').trim();

  for (const [key, answer] of Object.entries(faqAnswers)) {
    if (normalized.includes(key)) return answer;
  }

  const fuse = new Fuse(Object.keys(faqAnswers), { threshold: 0.4 });
  const result = fuse.search(normalized);

  if (result.length > 0 && result[0].score! <= 0.4) {
    return faqAnswers[result[0].item];
  }

  return null;
}

async function sendMessage(messages: Message[]): Promise<string> {
  const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
  const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent?key=${API_KEY}`;

  const latestMsg = messages[messages.length - 1]?.content ?? '';
  const faqReply = getBestMatchFromFAQs(latestMsg);
  if (faqReply) return faqReply;

  const systemInstruction = {
    role: "user",
    parts: [
      {
        text: `
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
2. Search through the todos. If you cannot find one, it's possible you deleted or edited the name of the to-do.

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
  };

  const contents = [
    systemInstruction,
    ...messages.map((msg) => ({
      role: msg.role === "bot" ? "model" : "user",
      parts: [{ text: msg.content }],
    })),
  ];

  const response = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ contents }),
  });

  if (!response.ok) {
    const errText = await response.text();
    console.error("Gemini error:", errText);
    throw new Error("API error");
  }

  const data = await response.json();
  const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text;

  return reply ?? "Sorry, I couldn't understand that.";
}

const mutation = useMutation<string, Error, Message[]>({
  mutationFn: sendMessage,
  onSuccess: (reply) => {
    const botMsg: Message = { role: "bot", content: reply };
    messages.value = [...messages.value, botMsg];
  },
  onError: () => {
    const errMsg: Message = {
      role: "bot",
      content: "Sorry, something went wrong. Please try again later.",
    };
    messages.value = [...messages.value, errMsg];
  },
});

function handleSend() {
  if (!input.value.trim()) return;

  const userMsg: Message = { role: "user", content: input.value.trim() };
  messages.value = [...messages.value, userMsg];
  input.value = "";
  mutation.mutate(messages.value);
}

function handleKeyDown(event: KeyboardEvent) {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    handleSend();
  }
}
const { isPending } = mutation;
</script>

<template>
  <div>
    <button
      v-if="minimized"
      @click="minimized = false"
      aria-label="Open chat"
      class="fixed bottom-4 right-4 w-12 h-12 rounded-full bg-white border border-orange-300 shadow-lg flex items-center justify-center cursor-pointer"
    >
      <span class="text-orange-800 font-bold text-lg">j</span>
    </button>

    <div
      v-else
      class="fixed bottom-4 right-4 w-80 max-w-full bg-white border border-orange-300 rounded-lg shadow-lg flex flex-col transition-all duration-300 max-h-[480px]"
    >
      <header
        class="bg-orange-800 text-white px-4 py-2 rounded-t-lg font-semibold flex justify-between items-center"
      >
        justaskeet!
        <div class="flex gap-2">
          <button
            @click="clearChat"
            aria-label="Clear chat"
            class="text-xs bg-white text-orange-800 px-2 py-1 rounded hover:bg-orange-100"
          >
            Clear Chat
          </button>
          <button
            @click="minimized = true"
            aria-label="Minimize chat"
            class="ml-2 text-white font-bold text-lg leading-none"
          >
            ×
          </button>
        </div>
      </header>

      <main class="flex-1 p-3 overflow-y-auto space-y-2">
        <div
          v-for="(msg, index) in messages"
          :key="index"
          :class="[
            'rounded px-3 py-2 max-w-[80%]',
            msg.role === 'user'
              ? 'bg-orange-200 text-orange-900 self-end'
              : 'bg-orange-50 text-orange-800 self-start',
          ]"
        >
          <ReactMarkdown>{{ msg.content }}</ReactMarkdown>
        </div>

        <div v-if="mutation.isPending" class="text-orange-600 italic text-sm">
          ...
        </div>

        <div ref="messagesEndRef"></div>
      </main>

      <footer class="p-3 border-t border-orange-300 flex gap-2">
        <textarea
          v-model="input"
          @keydown="handleKeyDown"
          rows="2"
          placeholder="Type your message..."
         :disabled="isPending"
          class="flex-1 resize-none border border-orange-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-orange-400"
        />
        <button
          @click="handleSend"
          :disabled="isPending || !input.trim()"
          class="bg-orange-800 text-white px-4 rounded disabled:opacity-50"
        >
          Send
        </button>
      </footer>
    </div>
  </div>
</template>
