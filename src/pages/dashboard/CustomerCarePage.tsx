import TopBar from '@/components/dashboard/TopBar';
import { useState, useRef, useEffect } from "react";
import Sidebar from "./dashboardWidgets/Sidebar";
import Footer from "@/components/landing/Footer";
import { FaWhatsapp, FaEnvelope, FaTelegramPlane } from "react-icons/fa";

import { FaBars, FaMoon, FaSun, FaBell, FaUserCircle } from "react-icons/fa";

interface Message {
  id: number;
  sender: "user" | "ai";
  text: string;
  time: string;
}

export default function CustomerCarePage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [dark, setDark] = useState(false);
  const [input, setInput] = useState("");
  const getTime = () =>
  new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });


  // 🔧 FIX: ref for chat container (not page)
  const chatContainerRef = useRef<HTMLDivElement | null>(null);

  // 🔧 FIX: scroll only the chat box
  useEffect(() => {
    const el = chatContainerRef.current;
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  }, [messages]);
const handleSend = () => {
  if (!input.trim()) return;

  const newMessage: Message = {
    id: Date.now(),
    sender: "user",
    text: input,
    time: getTime(),
  };

  setMessages((prev) => [...prev, newMessage]);
  setInput("");

  fetch("https://bluevult.com/api/ai_chat.php", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: newMessage.text }),
  })
    .then((res) => res.json())
    .then((data) => {
      const aiMessage: Message = {
        id: Date.now() + 1,
        sender: "ai",
        text: data.reply,
        time: getTime(),
      };
      setMessages((prev) => [...prev, aiMessage]);
    })
    .catch(console.error);
};


  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSend();
  };

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900">
      {/* Top bar */}
      <TopBar title="Support" onSidebarToggle={() => setSidebarOpen(true)} />

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 w-64 bg-white shadow-lg z-50 transform transition-transform duration-300
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}
      >
        <Sidebar onClose={() => setSidebarOpen(false)} />
      </div>

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main */}
      <main className="pt-24 lg:pl-64 px-6 pb-20 flex flex-col min-h-[calc(100vh-4rem)]">
        <div className="max-w-3xl mx-auto flex flex-col flex-1 space-y-6">
          <div className="flex-1 bg-white rounded-xl shadow-sm p-6 flex flex-col">
            {/* 🔧 FIXED CHAT SCROLL */}
            <div
              ref={chatContainerRef}
              className="flex-1 overflow-y-auto space-y-4 mb-4"
            >
              {messages.length === 0 && (
                <p className="text-gray-400 text-center mt-8">
                  Start a conversation with our AI support
                </p>
              )}

              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${
                    msg.sender === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`rounded-xl p-3 max-w-[70%] ${
                      msg.sender === "user"
                        ? "bg-gray-900 text-white"
                        : "bg-gray-200 text-gray-900"
                    }`}
                  >
                    {msg.text}
                     <span className="block text-[10px] opacity-60 mt-1 text-right">
    {msg.time}
  </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              

              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Type your message..."
                className="flex-1 border rounded-xl p-3 text-sm focus:ring-2 focus:ring-gray-300"
              />
              <button
                onClick={handleSend}
                className="bg-gray-900 text-white px-6 rounded-xl hover:bg-gray-800 transition"
              >
                Send
              </button>
            </div>
          </div>

          {/* Contact buttons */}
        <div className="bg-white rounded-xl shadow-sm p-6 flex flex-col sm:flex-row gap-4 justify-center items-center">
  <p className="text-gray-700 font-medium">Or reach us directly:</p>

  <a className="border px-6 py-3 rounded-xl flex items-center gap-2">
    <FaWhatsapp className="text-green-500" />
    WhatsApp
  </a>

  <a className="border px-6 py-3 rounded-xl flex items-center gap-2">
    <FaEnvelope className="text-red-500" />
    Gmail
  </a>

  <a className="border px-6 py-3 rounded-xl flex items-center gap-2">
    <FaTelegramPlane className="text-blue-500" />
    Telegram
  </a>
</div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
