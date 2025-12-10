// src/services/chat-service.ts
import {
  collection,
  doc,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import { auth } from "../firebase/config";
import { db } from "../firebase/config";
import { ChatConversation, ChatMessage } from "../lib/types";

const getUid = () => {
  const uid = auth.currentUser?.uid;
  if (!uid) {
    throw new Error("User not authenticated");
  }
  return uid;
};

const chatsCollectionRef = (uid: string) =>
  collection(db, "users", uid, "chats");
const chatDocRef = (uid: string, chatId: string) =>
  doc(db, "users", uid, "chats", chatId);
const messagesCollectionRef = (uid: string, chatId: string) =>
  collection(db, "users", uid, "chats", chatId, "messages");

// Helper: convert Firestore timestamp -> ISO string safely
const tsToIso = (value: any): string => {
  // value may be a Timestamp, Date, string, or undefined
  if (!value) return new Date().toISOString();
  if (typeof value === "string") return value;
  if (value.toDate) return value.toDate().toISOString();
  if (value instanceof Date) return value.toISOString();
  return new Date().toISOString();
};

export async function getConversations(): Promise<ChatConversation[]> {
  const uid = getUid();

  const q = query(chatsCollectionRef(uid), orderBy("updatedAt", "desc"));
  const snap = await getDocs(q);

  const conversations: ChatConversation[] = snap.docs.map((d) => {
    const data = d.data() as any;
    return {
      id: d.id,
      title: data.title ?? "New Chat",
      createdAt: tsToIso(data.createdAt),
      updatedAt: tsToIso(data.updatedAt),
    };
  });

  return conversations;
}

export async function getConversationMessages(
  conversationId: string
): Promise<ChatMessage[]> {
  const uid = getUid();

  const q = query(
    messagesCollectionRef(uid, conversationId),
    orderBy("createdAt", "asc")
  );
  const snap = await getDocs(q);

  const msgs: ChatMessage[] = snap.docs.map((d) => {
    const data = d.data() as any;
    return {
      id: d.id,
      conversationId,
      sender: data.sender,
      content: data.content,
      createdAt: tsToIso(data.createdAt),
      sources: data.sources ?? [],
    };
  });

  return msgs;
}

export async function createConversation(
  initialTitle?: string
): Promise<ChatConversation> {
  const uid = getUid();

  const now = new Date().toISOString();
  const docRef = await addDoc(chatsCollectionRef(uid), {
    title: initialTitle || "New Chat",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  const conversation: ChatConversation = {
    id: docRef.id,
    title: initialTitle || "New Chat",
    createdAt: now,
    updatedAt: now,
  };

  return conversation;
}

export async function renameConversation(
  conversationId: string,
  title: string
): Promise<void> {
  const uid = getUid();
  const ref = chatDocRef(uid, conversationId);

  await updateDoc(ref, {
    title: title || "New Chat",
    updatedAt: serverTimestamp(),
  });
}

export async function deleteConversation(
  conversationId: string
): Promise<void> {
  const uid = getUid();

  // Delete messages subcollection
  const msgsSnap = await getDocs(messagesCollectionRef(uid, conversationId));
  const batchDeletes: Promise<void>[] = [];
  msgsSnap.forEach((m) => {
    batchDeletes.push(deleteDoc(m.ref));
  });
  await Promise.all(batchDeletes);

  // Delete chat document
  await deleteDoc(chatDocRef(uid, conversationId));
}

// This still simulates RAG + LLM, but now persists to Firestore.
export async function sendMessage(
  conversationId: string,
  content: string
): Promise<{ userMessage: ChatMessage; assistantMessage: ChatMessage }> {
  const uid = getUid();

  const nowIso = new Date().toISOString();

  // 1. Add user message
  const userDocRef = await addDoc(messagesCollectionRef(uid, conversationId), {
    sender: "user",
    content,
    createdAt: serverTimestamp(),
  });

  const userMessage: ChatMessage = {
    id: userDocRef.id,
    conversationId,
    sender: "user",
    content,
    createdAt: nowIso,
  };

  // 2. Fake assistant answer (replace with real backend later)
  const assistantContent = `This is a placeholder answer. In the real app, I will answer using your uploaded notes.\n\nYou asked: "${content}"`;

  const assistantDocRef = await addDoc(
    messagesCollectionRef(uid, conversationId),
    {
      sender: "assistant",
      content: assistantContent,
      createdAt: serverTimestamp(),
      sources: ["Example Note.pdf (page 2)"],
    }
  );

  const assistantMessage: ChatMessage = {
    id: assistantDocRef.id,
    conversationId,
    sender: "assistant",
    content: assistantContent,
    createdAt: nowIso,
    sources: ["Example Note.pdf (page 2)"],
  };

  // 3. Update chat updatedAt and (optionally) title
  const chatRef = chatDocRef(uid, conversationId);
  await updateDoc(chatRef, {
    updatedAt: serverTimestamp(),
    // If you want: first non-empty user message becomes title
    // But only if title is "New Chat" or empty
    // We'll just always leave title as is for now; you can enhance later.
  });

  return { userMessage, assistantMessage };
}
