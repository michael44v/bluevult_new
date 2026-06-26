import React from "react";
import Sidebar from "../dashboardWidgets/Sidebar";
import TopBar from "@/components/dashboard/TopBar";

const GTpayoutLayout: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-[#020617] text-gray-900 dark:text-gray-100 transition-colors duration-300 font-inter">
      {sidebarOpen && (
        <div className="fixed inset-0 z-20 bg-black bg-opacity-50 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <div className={`fixed inset-y-0 left-0 z-30 w-64 bg-white dark:bg-[#0a0f1f] shadow-xl transform transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <Sidebar />
      </div>

      <div className="flex-1 flex flex-col lg:ml-64 pb-24 lg:pb-0">
        <TopBar title={title} onSidebarToggle={() => setSidebarOpen(true)} />
        <div className="p-6 space-y-6 mt-16 flex-1">
          {children}
        </div>
      </div>
    </div>
  );
};

export default GTpayoutLayout;
