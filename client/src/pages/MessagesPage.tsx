import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Send, Search } from "lucide-react";
import type { Conversation, Message } from "@shared/schema";

function timeAgo(iso: string): string {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return "now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function formatMsgTime(iso: string): string {
  const d = new Date(iso);
  const h = d.getHours();
  const m = String(d.getMinutes()).padStart(2, "0");
  return `${h % 12 || 12}:${m} ${h >= 12 ? "PM" : "AM"}`;
}

export const MessagesPage = (): JSX.Element => {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [search, setSearch] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  const { data: conversations = [] } = useQuery<Conversation[]>({
    queryKey: ["/api/conversations"],
  });

  const { data: messages = [] } = useQuery<Message[]>({
    queryKey: ["/api/conversations", activeId, "messages"],
    queryFn: async () => {
      if (!activeId) return [];
      const res = await fetch(`/api/conversations/${activeId}/messages`);
      return res.json();
    },
    enabled: !!activeId,
  });

  const sendMutation = useMutation({
    mutationFn: (content: string) =>
      apiRequest("POST", `/api/conversations/${activeId}/messages`, {
        senderName: "You",
        content,
        sentAt: new Date().toISOString(),
        isOwn: 1,
        conversationId: activeId,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/conversations", activeId, "messages"] });
      queryClient.invalidateQueries({ queryKey: ["/api/conversations"] });
    },
  });

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Auto-select first conversation
  useEffect(() => {
    if (conversations.length > 0 && !activeId) {
      setActiveId(conversations[0].id);
    }
  }, [conversations, activeId]);

  const sendMessage = async () => {
    if (!draft.trim() || !activeId) return;
    const text = draft.trim();
    setDraft("");
    await sendMutation.mutateAsync(text);
  };

  const filtered = conversations.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  const activeConv = conversations.find(c => c.id === activeId);

  return (
    <div className="flex h-full overflow-hidden">
      {/* Sidebar */}
      <div
        className="w-80 flex-shrink-0 flex flex-col border-r border-white/10"
        style={{ background: "rgba(255,255,255,0.03)" }}
      >
        <div className="px-4 py-5">
          <h1 className="text-white text-xl font-semibold [font-family:'Inter',Helvetica] mb-4">Messages</h1>
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/10">
            <Search size={14} color="rgba(255,255,255,0.4)" />
            <input
              data-testid="search-conversations"
              placeholder="Search..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="flex-1 bg-transparent text-white text-sm placeholder:text-white/30 outline-none [font-family:'Inter',Helvetica]"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-2 pb-4">
          {filtered.map(conv => (
            <button
              key={conv.id}
              data-testid={`conversation-${conv.id}`}
              onClick={() => setActiveId(conv.id)}
              className="w-full flex items-start gap-3 px-3 py-3 rounded-xl transition-all mb-1 text-left"
              style={{
                background: activeId === conv.id ? "rgba(233,115,52,0.15)" : "transparent",
                border: activeId === conv.id ? "1px solid rgba(233,115,52,0.3)" : "1px solid transparent",
              }}
            >
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-white text-sm font-semibold [font-family:'Inter',Helvetica]"
                style={{ background: conv.avatarColor }}
              >
                {conv.avatarInitials}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-white text-sm font-medium [font-family:'Inter',Helvetica]">{conv.name}</span>
                  <span className="text-white/30 text-xs [font-family:'Inter',Helvetica]">{timeAgo(conv.lastMessageAt)}</span>
                </div>
                <div className="flex items-center justify-between mt-0.5">
                  <span className="text-white/40 text-xs [font-family:'Inter',Helvetica] truncate">{conv.lastMessage}</span>
                  {conv.unreadCount > 0 && (
                    <span
                      className="text-white text-xs rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0 ml-1"
                      style={{ background: "linear-gradient(180deg,#E97334,#CC4130)" }}
                    >
                      {conv.unreadCount}
                    </span>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 flex flex-col">
        {activeConv ? (
          <>
            {/* Chat header */}
            <div
              className="flex items-center gap-3 px-6 py-4 border-b border-white/10"
              style={{ background: "rgba(255,255,255,0.03)" }}
            >
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-semibold [font-family:'Inter',Helvetica]"
                style={{ background: activeConv.avatarColor }}
              >
                {activeConv.avatarInitials}
              </div>
              <div>
                <div className="text-white font-medium [font-family:'Inter',Helvetica]">{activeConv.name}</div>
                <div className="text-white/40 text-xs [font-family:'Inter',Helvetica]">Active now</div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-6 py-4 flex flex-col gap-3">
              {messages.map(msg => (
                <div
                  key={msg.id}
                  data-testid={`message-${msg.id}`}
                  className={`flex ${msg.isOwn ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className="max-w-[65%] px-4 py-2.5 rounded-2xl"
                    style={msg.isOwn
                      ? { background: "linear-gradient(135deg,#E97334,#CC4130)", borderBottomRightRadius: "4px" }
                      : { background: "rgba(255,255,255,0.1)", borderBottomLeftRadius: "4px" }
                    }
                  >
                    <p className="text-white text-sm [font-family:'Inter',Helvetica] leading-relaxed">{msg.content}</p>
                    <p className="text-white/40 text-xs [font-family:'Inter',Helvetica] mt-1 text-right">{formatMsgTime(msg.sentAt)}</p>
                  </div>
                </div>
              ))}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="px-6 py-4 border-t border-white/10">
              <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-white/10">
                <input
                  data-testid="message-input"
                  placeholder="Write a message..."
                  value={draft}
                  onChange={e => setDraft(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                  className="flex-1 bg-transparent text-white text-sm placeholder:text-white/30 outline-none [font-family:'Inter',Helvetica]"
                />
                <button
                  data-testid="send-message-btn"
                  onClick={sendMessage}
                  disabled={!draft.trim() || sendMutation.isPending}
                  className="w-8 h-8 rounded-full flex items-center justify-center transition-all disabled:opacity-30"
                  style={{ background: "linear-gradient(180deg,#E97334,#CC4130)" }}
                >
                  <Send size={14} color="white" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <span className="text-white/30 [font-family:'Inter',Helvetica]">Select a conversation</span>
          </div>
        )}
      </div>
    </div>
  );
};
