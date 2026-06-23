import React from "react";
import { X, Info } from "lucide-react";

interface UserModalProps {
  title: string;
  content: string;
  onClose: () => void;
}

const UserModal: React.FC<UserModalProps> = ({ title, content, onClose }) => {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="relative w-full max-w-lg bg-white dark:bg-[#0f111b] rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-white/10">
        {/* Header */}
        <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-white/5">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500">
              <Info className="w-5 h-5" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">{title || "Notification"}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-8">
          <div className="text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
            {content}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-white/5 flex justify-end">
          <button
            onClick={onClose}
            className="px-8 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition-all transform hover:scale-105 active:scale-95 shadow-lg shadow-blue-600/20"
          >
            Acknowledge
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserModal;
