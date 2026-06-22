import { useParams, useNavigate } from "react-router-dom";
import { useSystemSettings } from "@/hooks/useAdminData";

const Referral: React.FC = () => {
  const { refId } = useParams<{ refId: string }>();
  const navigate = useNavigate();
  const { data: settings = [] } = useSystemSettings();
  const platformName = (Array.isArray(settings) && settings.find(s => s.setting_key === "platform_name")?.setting_value) || "BlueVult";

  const handleSignup = () => {
    // Optional: store referrer so signup can use it
    if (refId) {
      localStorage.setItem("referral_id", refId);
    }
    navigate("/signup");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f111b] px-4">
      <div className="bg-white dark:bg-[#0a1120] max-w-md w-full rounded-2xl shadow-lg p-8 text-center space-y-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Welcome to {platformName} 🚀
        </h1>

        <p className="text-gray-600 dark:text-gray-300">
          You were referred by{" "}
          <span className="font-semibold text-[#00C4B4]">
            {refId || "a friend"}
          </span>
        </p>

        <button
          onClick={handleSignup}
          className="w-full bg-[#00C4B4] hover:bg-[#00b3a0] text-white py-3 rounded-xl font-semibold transition"
        >
          Create Account
        </button>
      </div>
    </div>
  );
};

export default Referral;