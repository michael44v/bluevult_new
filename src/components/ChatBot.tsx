import { useState, useRef, useEffect } from "react";
import { FaRobot, FaTimes, FaPaperPlane } from "react-icons/fa";
import { useSystemSettings } from "@/hooks/useAdminData";

interface Message {
  id: number;
  sender: "user" | "ai";
  text: string;
  time: string;
}

const ChatBot = () => {
  const { data: settings = [] } = useSystemSettings();
  const platformName = (Array.isArray(settings) && settings.find(s => s.setting_key === "platform_name")?.setting_value) || "BlueVult";

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement | null>(null);

  const getTime = () =>
    new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const newMessage: Message = {
      id: Date.now(),
      sender: "user",
      text: input,
      time: getTime(),
    };

    setMessages((prev) => [...prev, newMessage]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("https://bluevult.com/api/ai_chat.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: newMessage.text }),
      });
      const data = await res.json();

      const aiMessage: Message = {
        id: Date.now() + 1,
        sender: "ai",
        text: data.reply || "Sorry, I'm having trouble connecting.",
        time: getTime(),
      };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error("Chat error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[999]">
      {/* Chat Icon */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-blue-600 rounded-full shadow-2xl flex items-center justify-center text-white hover:bg-blue-700 transition-all duration-300 transform hover:scale-110 active:scale-95"
      >
        {isOpen ? <FaTimes className="text-xl" /> : <FaRobot className="text-2xl" />}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="absolute bottom-20 right-0 w-[350px] max-w-[90vw] h-[500px] bg-white dark:bg-[#0f111b] rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 flex flex-col overflow-hidden animate-in slide-in-from-bottom-5">
          {/* Header */}
          <div className="bg-blue-600 p-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-white">
              <FaRobot />
            </div>
            <div>
              <h3 className="text-white font-bold text-sm">BlueVult AI Assistant</h3>
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                <span className="text-white/80 text-[10px]">Online</span>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div
            ref={chatContainerRef}
            className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-[#020617]"
          >
            {messages.length === 0 && (
              <div className="text-center py-10 space-y-2">
                <p className="text-gray-500 dark:text-gray-400 text-sm">Hello! How can I help you today?</p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {['Deposit', 'Withdraw', 'KYC'].map(tag => (
                    <button
                      key={tag}
                      onClick={() => setInput(`How do I ${tag.toLowerCase()}?`)}
                      className="text-[10px] px-2 py-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full hover:bg-blue-50 dark:hover:bg-blue-900/20 transition"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl p-3 text-sm shadow-sm ${
                    msg.sender === "user"
                      ? "bg-blue-600 text-white rounded-br-none"
                      : "bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-100 dark:border-gray-700 rounded-bl-none"
                  }`}
                >
                  {msg.text}
                  <span className={`block text-[10px] mt-1 opacity-60 ${msg.sender === "user" ? "text-right" : "text-left"}`}>
                    {msg.time}
                  </span>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-3 text-sm shadow-sm border border-gray-100 dark:border-gray-700 rounded-bl-none">
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></span>
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="p-4 bg-white dark:bg-[#0f111b] border-t border-gray-200 dark:border-gray-800 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Ask anything..."
              className="flex-1 bg-gray-100 dark:bg-gray-800 border-none rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-blue-600 dark:text-white"
            />
            <button
              onClick={handleSend}
              disabled={loading}
              className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center hover:bg-blue-700 transition active:scale-95 disabled:opacity-50"
            >
              <FaPaperPlane className="text-sm" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatBot;
