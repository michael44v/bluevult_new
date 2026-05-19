import { FaTools } from "react-icons/fa";

const Maintenance: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#020617] p-6 text-center">
      <div className="max-w-md w-full space-y-6 animate-in fade-in zoom-in duration-500">
        <div className="relative mx-auto w-24 h-24 bg-blue-500/10 rounded-3xl flex items-center justify-center border border-blue-500/20">
          <FaTools className="text-4xl text-blue-500 animate-pulse" />
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-white">Under Maintenance</h1>
          <p className="text-gray-400">
            We're currently performing some scheduled maintenance to improve your experience.
            We'll be back online shortly.
          </p>
        </div>
        <div className="pt-4">
          <div className="h-1.5 w-full bg-gray-800 rounded-full overflow-hidden">
            <div className="h-full bg-blue-600 w-2/3 rounded-full animate-progress" />
          </div>
          <p className="text-xs text-gray-500 mt-2">Expected downtime: ~15 minutes</p>
        </div>
        <p className="text-sm text-gray-500">
          Thank you for your patience. For urgent inquiries, please contact support.
        </p>
      </div>
    </div>
  );
};

export default Maintenance;
