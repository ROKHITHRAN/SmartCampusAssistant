// src/lib/chatService.ts

import { ChatConversation, ChatMessage } from "../lib/types";

// Simple in-memory mock store for now.
// You can later replace these with real API calls to your backend.
let conversations: ChatConversation[] = [];
let messages: ChatMessage[] = [];

// Helper to generate IDs
const genId = () => crypto.randomUUID?.() ?? Date.now().toString();

export async function getConversations(): Promise<ChatConversation[]> {
  // In a real app, call your backend here.
  // For now, return in-memory list sorted by updatedAt desc.
  return conversations
    .slice()
    .sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
}

export async function getConversationMessages(
  conversationId: string
): Promise<ChatMessage[]> {
  return messages
    .filter((m) => m.conversationId === conversationId)
    .sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
}

export async function createConversation(
  initialTitle?: string
): Promise<ChatConversation> {
  const now = new Date().toISOString();
  const conversation: ChatConversation = {
    id: genId(),
    title: initialTitle || "New Chat",
    createdAt: now,
    updatedAt: now,
  };
  conversations.push(conversation);
  return conversation;
}

export async function renameConversation(
  conversationId: string,
  title: string
): Promise<void> {
  const convo = conversations.find((c) => c.id === conversationId);
  if (convo) {
    convo.title = title || convo.title;
    convo.updatedAt = new Date().toISOString();
  }
}

export async function deleteConversation(
  conversationId: string
): Promise<void> {
  conversations = conversations.filter((c) => c.id !== conversationId);
  messages = messages.filter((m) => m.conversationId !== conversationId);
}

// This simulates doing RAG + LLM and returns both stored message objects.
export async function sendMessage(
  conversationId: string,
  content: string
): Promise<{ userMessage: ChatMessage; assistantMessage: ChatMessage }> {
  const now = new Date().toISOString();

  const userMessage: ChatMessage = {
    id: genId(),
    conversationId,
    sender: "user",
    content,
    createdAt: now,
  };

  messages.push(userMessage);

  // Update conversation updatedAt
  const convo = conversations.find((c) => c.id === conversationId);
  if (convo) {
    convo.updatedAt = now;
    // Optionally set title from first user message
    if (!convo.title || convo.title === "New Chat") {
      convo.title =
        content.length > 40 ? content.slice(0, 37) + "..." : content;
    }
  }

  // Fake assistant response – replace this with real backend call
  const assistantMessage: ChatMessage = {
    id: genId(),
    conversationId,
    sender: "assistant",
    content: `This is a placeholder answer. In the real app, I will answer using your uploaded notes.\n\nYou asked: "${content}"`,
    createdAt: new Date().toISOString(),
    sources: ["Example Note.pdf (page 2)"],
  };

  messages.push(assistantMessage);

  return { userMessage, assistantMessage };
}
