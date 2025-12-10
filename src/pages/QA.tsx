// src/pages/QA.tsx
import { useEffect, useRef, useState } from "react";
import {
  Plus,
  MoreVertical,
  Bot,
  User as UserIcon,
  Loader2,
  Send,
} from "lucide-react";
import MainLayout from "../components/MainLayout";
import {
  getConversations,
  getConversationMessages,
  createConversation,
  renameConversation,
  deleteConversation,
  sendMessage,
} from "../services/chat-service";
import { ChatConversation, ChatMessage } from "../lib/types";

const QA = () => {
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [selectedConversationId, setSelectedConversationId] = useState<
    string | null
  >(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loadingConversations, setLoadingConversations] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const [menuOpenFor, setMenuOpenFor] = useState<string | null>(null);

  // Load conversations on mount
  useEffect(() => {
    const loadConversations = async () => {
      setLoadingConversations(true);
      try {
        const data = await getConversations();
        setConversations(data);

        if (data.length > 0) {
          setSelectedConversationId(data[0].id);
        } else {
          // Create initial conversation if none exist
          const convo = await createConversation("New Chat");
          const updated = await getConversations();
          setConversations(updated);
          setSelectedConversationId(convo.id);
        }
      } catch (err) {
        console.error("Error loading conversations", err);
      } finally {
        setLoadingConversations(false);
      }
    };

    loadConversations();
  }, []);

  // Load messages when selected conversation changes
  useEffect(() => {
    const loadMessages = async () => {
      if (!selectedConversationId) return;
      setLoadingMessages(true);
      try {
        const data = await getConversationMessages(selectedConversationId);
        setMessages(data);
      } catch (err) {
        console.error("Error loading messages", err);
      } finally {
        setLoadingMessages(false);
      }
    };

    loadMessages();
  }, [selectedConversationId]);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, sending]);

  const currentConversation = conversations.find(
    (c) => c.id === selectedConversationId
  );

  const handleNewChat = async () => {
    try {
      const convo = await createConversation("New Chat");
      const updated = await getConversations();
      setConversations(updated);
      setSelectedConversationId(convo.id);
      setMessages([]);
      setInput("");
    } catch (err) {
      console.error("Error creating conversation", err);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !selectedConversationId || sending) return;

    const content = input.trim();
    setInput("");
    setSending(true);

    try {
      const { userMessage, assistantMessage } = await sendMessage(
        selectedConversationId,
        content
      );

      setMessages((prev) => [...prev, userMessage, assistantMessage]);

      // Refresh conversations to update updatedAt/title
      const updated = await getConversations();
      setConversations(updated);
    } catch (err) {
      console.error("Error sending message", err);
    } finally {
      setSending(false);
    }
  };

  const handleRenameConversation = async (conversationId: string) => {
    const convo = conversations.find((c) => c.id === conversationId);
    const currentTitle = convo?.title ?? "";
    const next = window.prompt("Rename chat", currentTitle);
    if (next == null) return;

    try {
      await renameConversation(conversationId, next.trim());
      const updated = await getConversations();
      setConversations(updated);
    } catch (err) {
      console.error("Error renaming conversation", err);
    }
  };

  const handleDeleteConversation = async (conversationId: string) => {
    if (!window.confirm("Delete this conversation? This cannot be undone.")) {
      return;
    }
    try {
      await deleteConversation(conversationId);
      const updated = await getConversations();
      setConversations(updated);

      if (selectedConversationId === conversationId) {
        if (updated.length > 0) {
          setSelectedConversationId(updated[0].id);
        } else {
          setSelectedConversationId(null);
          setMessages([]);
        }
      }
    } catch (err) {
      console.error("Error deleting conversation", err);
    }
  };

  return (
    <MainLayout title="Q&A">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-12rem)]">
        {/* Left: conversation list */}
        <div className="lg:col-span-1 bg-white rounded-xl shadow-md p-4 flex flex-col overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900">Chats</h3>
            <button
              onClick={handleNewChat}
              className="inline-flex items-center gap-1 px-2 py-1 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700"
            >
              <Plus className="w-4 h-4" />
              New Chat
            </button>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2">
            {loadingConversations ? (
              <p className="text-sm text-gray-500">Loading chats...</p>
            ) : conversations.length === 0 ? (
              <p className="text-sm text-gray-500">
                No chats yet. Click &quot;New Chat&quot; to start.
              </p>
            ) : (
              conversations.map((conversation) => {
                const isActive = conversation.id === selectedConversationId;
                const updatedAt = new Date(
                  conversation.updatedAt
                ).toLocaleString();
                return (
                  <div
                    key={conversation.id}
                    className={`flex items-center justify-between gap-2 px-3 py-2 rounded-lg cursor-pointer group ${
                      isActive
                        ? "bg-blue-50 border border-blue-200"
                        : "hover:bg-gray-50"
                    }`}
                    onClick={() => setSelectedConversationId(conversation.id)}
                  >
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-sm font-medium truncate ${
                          isActive ? "text-blue-700" : "text-gray-900"
                        }`}
                      >
                        {conversation.title || "Untitled chat"}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {updatedAt}
                      </p>
                    </div>
                    <div className="relative">
                      <button
                        type="button"
                        className="p-1 rounded hover:bg-gray-200"
                        onClick={(e) => {
                          e.stopPropagation();
                          setMenuOpenFor((prev) =>
                            prev === conversation.id ? null : conversation.id
                          );
                        }}
                      >
                        <MoreVertical className="w-4 h-4 text-gray-500" />
                      </button>
                      {menuOpenFor === conversation.id && (
                        <div
                          className="absolute right-0 mt-2 w-32 bg-white rounded-md shadow-lg border border-gray-100 z-10"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            className="w-full text-left px-3 py-1.5 text-xs hover:bg-gray-50"
                            onClick={() => {
                              setMenuOpenFor(null);
                              handleRenameConversation(conversation.id);
                            }}
                          >
                            Rename
                          </button>
                          <button
                            className="w-full text-left px-3 py-1.5 text-xs text-red-600 hover:bg-red-50"
                            onClick={() => {
                              setMenuOpenFor(null);
                              handleDeleteConversation(conversation.id);
                            }}
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="pt-4 mt-4 border-t border-gray-200">
            <div className="bg-blue-50 rounded-lg p-3">
              <p className="text-xs text-blue-800">
                Answers are generated based on your uploaded notes and optional
                general references.
              </p>
            </div>
          </div>
        </div>

        {/* Right: chat area */}
        <div className="lg:col-span-3 bg-white rounded-xl shadow-md flex flex-col">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                {currentConversation?.title || "New Chat"}
              </h2>
              <p className="text-xs text-gray-500">
                Ask any question related to your uploaded materials.
              </p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {loadingMessages && messages.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="w-6 h-6 text-gray-500 animate-spin" />
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <Bot className="w-10 h-10 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Ask me anything!
                </h3>
                <p className="text-gray-600 max-w-md">
                  I can help you understand your course materials, answer
                  questions, and clarify concepts. Start typing your question
                  below to begin a new conversation.
                </p>
              </div>
            ) : (
              <>
                {messages.map((message) => {
                  const isUser = message.sender === "user";
                  const time = new Date(message.createdAt).toLocaleTimeString();
                  return (
                    <div
                      key={message.id}
                      className={`flex gap-3 ${
                        isUser ? "justify-end" : "justify-start"
                      }`}
                    >
                      {!isUser && (
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <Bot className="w-5 h-5 text-blue-600" />
                        </div>
                      )}
                      <div
                        className={`max-w-[70%] rounded-lg px-4 py-3 ${
                          isUser
                            ? "bg-blue-600 text-white"
                            : "bg-gray-100 text-gray-900"
                        }`}
                      >
                        <p className="whitespace-pre-wrap">{message.content}</p>
                        {message.sources &&
                          message.sources.length > 0 &&
                          !isUser && (
                            <p
                              className={`text-xs mt-2 ${
                                isUser ? "text-blue-100" : "text-gray-600"
                              }`}
                            >
                              Sources: {message.sources.join(", ")}
                            </p>
                          )}
                        <p
                          className={`text-xs mt-1 ${
                            isUser ? "text-blue-200" : "text-gray-500"
                          }`}
                        >
                          {time}
                        </p>
                      </div>
                      {isUser && (
                        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                          <UserIcon className="w-5 h-5 text-white" />
                        </div>
                      )}
                    </div>
                  );
                })}
                {sending && (
                  <div className="flex gap-3 justify-start">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Bot className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="bg-gray-100 rounded-lg px-4 py-3">
                      <Loader2 className="w-5 h-5 text-gray-600 animate-spin" />
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {/* Input */}
          <div className="border-t border-gray-200 p-4">
            <form onSubmit={handleSend} className="flex gap-2">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your question here..."
                rows={2}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                disabled={sending || !selectedConversationId}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend(e);
                  }
                }}
              />
              <button
                type="submit"
                disabled={sending || !input.trim() || !selectedConversationId}
                className="px-6 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {sending ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default QA;
