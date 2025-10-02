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

async function sendMessage(messages: Message[]): Promise<string> {
  const response = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages }),
  });

  if (!response.ok) {
    throw new Error("API error");
  }

  const data = await response.json();
  return data.reply;
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
