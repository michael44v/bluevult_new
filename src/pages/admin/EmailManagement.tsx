import React, { useState, useEffect } from "react";
import AdminLayout from "./components/AdminLayout";
import { FaEnvelope, FaUser, FaPaperPlane, FaSpinner } from "react-icons/fa";
import { toast } from "sonner";

interface User {
  id: string;
  name: string;
  email: string;
}

const EmailManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserEmail, setSelectedUserEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch("https://bluevult.com/api/admin-api.php", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ q: "fetch_users" }),
        });
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
            // Map the API data to our User interface
            const mappedUsers = json.data.map((u: any) => ({
                id: u.id,
                name: u.name,
                email: u.email
            }));
            setUsers(mappedUsers);
        }
      } catch (error) {
        console.error("Failed to fetch users:", error);
        toast.error("Failed to load users list");
      } finally {
        setIsFetching(false);
      }
    };
    fetchUsers();
  }, []);

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserEmail || !subject || !message) {
      toast.error("Please fill in all fields");
      return;
    }

    setIsLoading(true);

    const user = users.find(u => u.email === selectedUserEmail);
    const userName = user ? user.name : "User";

    // Design the HTML template
    const htmlMessage = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #0d1421; color: #ffffff; padding: 20px; border-radius: 10px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h1 style="color: #3861fb; margin: 0;">BlueVult</h1>
        </div>
        <div style="background-color: #17212d; padding: 20px; border-radius: 8px; border: 1px solid #1a2535;">
          <h2 style="color: #ffffff; margin-top: 0;">Hello ${userName},</h2>
          <p style="color: #8a919e; line-height: 1.6; font-size: 16px;">
            ${message.replace(/\n/g, '<br>')}
          </p>
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #1a2535; text-align: center;">
            <a href="https://bluevult.com/dashboard" style="background-color: #3861fb; color: #ffffff; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Go to Dashboard</a>
          </div>
        </div>
        <div style="text-align: center; margin-top: 20px; color: #4a5568; font-size: 12px;">
          <p>© ${new Date().getFullYear()} BlueVult. All rights reserved.</p>
          <p>Security and Reliability in Crypto Trading.</p>
        </div>
      </div>
    `;

    try {
      const res = await fetch("https://bluevult.com/api/mail.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: selectedUserEmail,
          name: userName,
          subject: subject,
          message: htmlMessage, // The API seems to take 'message' and send it
        }),
      });

      const json = await res.json();
      if (json.status === "success" || json.success) {
        toast.success("Email sent successfully!");
        setSubject("");
        setMessage("");
        setSelectedUserEmail("");
      } else {
        toast.error(json.message || "Failed to send email");
      }
    } catch (error) {
      console.error("Error sending email:", error);
      toast.error("An error occurred while sending the email");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AdminLayout title="Email Management">
      <div className="max-w-4xl mx-auto">
        <div className="bg-[#1a1d2a] rounded-2xl border border-gray-800 p-6 md:p-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-blue-500/20 rounded-xl">
              <FaEnvelope className="text-2xl text-blue-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Send Direct Email</h2>
              <p className="text-gray-400">Send custom emails to users using platform SMTP</p>
            </div>
          </div>

          <form onSubmit={handleSendEmail} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                  <FaUser className="text-gray-500" /> Select User
                </label>
                <select
                  value={selectedUserEmail}
                  onChange={(e) => setSelectedUserEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-[#0f111b] border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                  disabled={isFetching}
                >
                  <option value="">{isFetching ? "Loading users..." : "Choose a user"}</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.email}>
                      {user.name} ({user.email})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Email Subject</label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Enter email subject"
                  className="w-full px-4 py-3 bg-[#0f111b] border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Message Content</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message here..."
                rows={8}
                className="w-full px-4 py-3 bg-[#0f111b] border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition resize-none"
              ></textarea>
            </div>

            <div className="flex justify-end pt-4">
              <button
                type="submit"
                disabled={isLoading || isFetching}
                className="flex items-center gap-2 px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-600/20"
              >
                {isLoading ? (
                  <>
                    <FaSpinner className="animate-spin" /> Sending...
                  </>
                ) : (
                  <>
                    <FaPaperPlane /> Send Email
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Preview Section */}
        {message && (
            <div className="mt-10">
                <h3 className="text-lg font-bold text-white mb-4">Live Preview</h3>
                <div className="bg-white rounded-2xl p-6 overflow-hidden">
                    <div style={{ fontFamily: 'Arial, sans-serif', maxWidth: '600px', margin: '0 auto', backgroundColor: '#0d1421', color: '#ffffff', padding: '20px', borderRadius: '10px' }}>
                        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                            <h1 style={{ color: '#3861fb', margin: '0' }}>BlueVult</h1>
                        </div>
                        <div style={{ backgroundColor: '#17212d', padding: '20px', borderRadius: '8px', border: '1px solid #1a2535' }}>
                            <h2 style={{ color: '#ffffff', marginTop: '0' }}>Hello [User Name],</h2>
                            <p style={{ color: '#8a919e', lineHeight: '1.6', fontSize: '16px', whiteSpace: 'pre-wrap' }}>
                                {message}
                            </p>
                            <div style={{ marginTop: '30px', paddingTop: '20px', borderTop: '1px solid #1a2535', textAlign: 'center' }}>
                                <div style={{ backgroundColor: '#3861fb', color: '#ffffff', padding: '12px 25px', borderRadius: '5px', fontWeight: 'bold', display: 'inline-block' }}>Go to Dashboard</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default EmailManagement;
