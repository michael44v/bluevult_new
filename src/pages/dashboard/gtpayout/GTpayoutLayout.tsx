import React from "react";
import Sidebar from "../dashboardWidgets/Sidebar";
import TopBar from "@/components/dashboard/TopBar";

interface GTpayoutLayoutProps {
  title: string;
  children: React.ReactNode;
  fullWidth?: boolean;
  hideTopBar?: boolean;
}

const GTpayoutLayout: React.FC<GTpayoutLayoutProps> = ({ title, children, fullWidth = false, hideTopBar = false }) => {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  React.useEffect(() => {
    const handleToggle = () => setSidebarOpen(prev => !prev);
    document.addEventListener('toggle-gt-sidebar', handleToggle);
    return () => document.removeEventListener('toggle-gt-sidebar', handleToggle);
  }, []);

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-[#020617] text-gray-900 dark:text-gray-100 transition-colors duration-300 font-inter">
      {sidebarOpen && (
        <div className="fixed inset-0 z-20 bg-black bg-opacity-50 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <div className={`fixed inset-y-0 left-0 z-30 w-64 bg-white dark:bg-[#0a0f1f] shadow-xl transform transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <Sidebar />
      </div>

      <div className="flex-1 flex flex-col lg:ml-64 pb-24 lg:pb-0 min-w-0">
        {!hideTopBar && <TopBar title={title} onSidebarToggle={() => setSidebarOpen(true)} />}
        <div className={`${hideTopBar ? "mt-0" : "mt-16"} flex-1 flex flex-col min-h-0 ${fullWidth ? "p-0" : "p-4 lg:p-6 space-y-6"}`}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default GTpayoutLayout;
