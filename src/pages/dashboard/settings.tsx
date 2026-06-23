import TopBar from '@/components/dashboard/TopBar';
import { useState, ChangeEvent } from "react";
import { FaBars, FaMoon, FaSun, FaBell, FaUserCircle, FaCheckCircle } from "react-icons/fa";
import Sidebar from "./dashboardWidgets/Sidebar";
import Footer from "../../components/landing/Footer";

const UserProfile: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dark, setDark] = useState(false);

  // Profile fields
  const [name, setName] = useState(localStorage.getItem("user_name") || "");
  const [email] = useState(localStorage.getItem("user_email") || "");
  const [profilePic, setProfilePic] = useState<string>(
  () => localStorage.getItem("user_image_url") || ""
);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  // Security Question
  const [securityQuestion, setSecurityQuestion] = useState("");
  const [securityAnswer, setSecurityAnswer] = useState("");
  const [hasSecurityQuestion, setHasSecurityQuestion] = useState(false);
  const uid = localStorage.getItem("user_id"); // Example user_id

  // Password change
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [statusMessage, setStatusMessage] = useState("");
  const [statusType, setStatusType] = useState<"success" | "error" | "">(""); 


  const CLOUD_NAME = "dguvkirdr";
  const UPLOAD_PRESET = "kyc_upload";

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const res = await fetch("/api/index.php", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ q: "sidebar", uid }),
        });
        const data = await res.json();
        if (data.success) {
          setHasSecurityQuestion(data.has_security_question);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchUserData();
  }, [uid]);

  // Handle profile picture upload
  const handleProfilePicChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setProfilePic(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = async () => {
    if (newPassword && newPassword !== confirmPassword) {
      setStatusMessage("Passwords do not match!");
      setStatusType("error");
    }

    let uploadedImageUrl = profilePic;

    // Only upload if it's a new image (base64)
    if (profilePic && profilePic.startsWith("data:")) {
      const formData = new FormData();
      formData.append("file", profilePic);
       formData.append("upload_preset", CLOUD_NAME ? UPLOAD_PRESET : "");

      try {
        const cloudRes = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
          method: "POST",
          body: formData,
        });
        const cloudData = await cloudRes.json();
        uploadedImageUrl = cloudData.secure_url;
      } catch (err) {
        console.error("Cloudinary upload failed", err);
        //alert("Failed to upload profile picture");
        return;
      }
    }

    // Send data to PHP backend
    try {
      const res = await fetch("/api/index.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          q: "settings",
          user_id: uid,
          name,
          profile_pic: uploadedImageUrl || "",
          notificationsEnabled,
          current_password: currentPassword,
          new_password: newPassword,
          security_question: securityQuestion,
          security_answer: securityAnswer,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setStatusMessage(data.message || "Profile updated successfully!");
        setStatusType("success");
      } else {
        setStatusMessage(data.message || "Failed to update profile.");
        setStatusType("error");
      }

      // Reset password fields
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");

        setTimeout(() => {
        setStatusMessage("");
        setStatusType("");
        }, 4000);

    } catch (err) {
      console.error(err);
            setStatusMessage("Something went wrong. Try again.");
            setStatusType("error");
    }
  };

  return (
    <div className={`${dark ? "dark" : ""} flex min-h-screen bg-gray-100 dark:bg-[#0f111b]`}>
      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 w-64 bg-white dark:bg-[#020617] shadow-lg z-50 transform transition-transform duration-300
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}
      >
        <Sidebar onClose={() => setSidebarOpen(false)} />
      </div>

      {sidebarOpen && <div className="fixed inset-0 bg-black/30 z-40 md:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Main Content */}
      <div className="flex-1 flex flex-col md:ml-64 transition-all duration-300">
        {/* Top Bar */}
        <TopBar title="Settings" onSidebarToggle={() => setSidebarOpen(true)} />

        {/* Page Content */}
        <div className="p-6 space-y-6 mt-16">
            {/* Status message */}
                  {statusMessage && (
                  <div
                  className={`text-center p-3 rounded-lg font-medium ${
                  statusType === "success" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                  }`}
                  >
                  {statusMessage}
                  </div>
                  )}
          {/* Profile Card */}
          <div className="bg-white dark:bg-[#0a1120] p-6 rounded-2xl shadow-lg flex flex-col md:flex-row gap-6">
            {/* Profile Picture */}
            <div className="flex flex-col items-center gap-4">
              {profilePic ? (
                <img src={profilePic} alt="Profile" className="w-32 h-32 rounded-full object-cover border-4 border-[#00C4B4]" />
              ) : (
                <div className="w-32 h-32 rounded-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center text-5xl text-white">
                  <FaUserCircle />
                </div>
              )}
              <label className="cursor-pointer bg-[#00C4B4] text-white px-4 py-2 rounded-lg hover:bg-[#00b3a0] transition">
                Upload Picture
                <input type="file" accept="image/*" className="hidden" onChange={handleProfilePicChange} />
              </label>
            </div>

            {/* Profile Info Form */}
            <div className="flex-1 flex flex-col gap-4">
              <div>
                <label className="block text-gray-700 dark:text-gray-300 font-medium">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-[#0a1120] dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-400"
                />
              </div>

              {/* Security Question Setup */}
              <div className="space-y-3 mt-4 border-t border-gray-100 dark:border-gray-800 pt-4">
                <h2 className="font-semibold text-gray-800 dark:text-white">Security Question (2FA)</h2>
                {hasSecurityQuestion && (
                  <p className="text-xs text-green-500 flex items-center gap-1">
                    <FaCheckCircle /> Security question already set
                  </p>
                )}
                <select
                  value={securityQuestion}
                  onChange={(e) => setSecurityQuestion(e.target.value)}
                  className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-[#0a1120] dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-400"
                >
                  <option value="">Select a security question</option>
                  <option value="What is your mother's maiden name?">What is your mother's maiden name?</option>
                  <option value="What was the name of your first pet?">What was the name of your first pet?</option>
                  <option value="In what city were you born?">In what city were you born?</option>
                  <option value="What is your favorite book?">What is your favorite book?</option>
                </select>
                <input
                  type="text"
                  placeholder="Your Answer"
                  value={securityAnswer}
                  onChange={(e) => setSecurityAnswer(e.target.value)}
                  className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-[#0a1120] dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-400"
                />
                <p className="text-xs text-gray-500">
                  This will be used for verification if "Security Question 2FA" is enabled by admin.
                </p>
              </div>

              <div className="relative">
                <label className="block text-gray-700 dark:text-gray-300 font-medium">Email</label>
                <input
                  type="email"
                  value={email}
                  disabled
                  className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-[#0a1120] dark:text-gray-500 focus:outline-none"
                />
                <FaCheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-500 text-xl" />
              </div>

              <div className="flex items-center gap-3 mt-2">
                <input
                  type="checkbox"
                  checked={notificationsEnabled}
                  onChange={() => setNotificationsEnabled(!notificationsEnabled)}
                  id="emailNotifications"
                  className="w-5 h-5 text-[#00C4B4] focus:ring-[#00C4B4]"
                />
                <label htmlFor="emailNotifications" className="text-gray-700 dark:text-gray-300 font-medium">
                  Enable Email Notifications
                </label>
              </div>

              {/* Password Change */}
              <div className="space-y-3 mt-4">
                <h2 className="font-semibold text-gray-800 dark:text-white">Change Password</h2>
                <input
                  type="password"
                  placeholder="Current Password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-[#0a1120] dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-400"
                />
                <input
                  type="password"
                  placeholder="New Password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-[#0a1120] dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-400"
                />
                <input
                  type="password"
                  placeholder="Confirm New Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-[#0a1120] dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-400"
                />
              </div>
                
              {/* Save Button */}
              <button
                onClick={handleSaveProfile}
                className="mt-4 bg-[#00C4B4] hover:bg-[#00b3a0] text-white px-6 py-3 rounded-lg font-semibold transition"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <Footer />
        </div>
      </div>
    </div>
  );
};

export default UserProfile;