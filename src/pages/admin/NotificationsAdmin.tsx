import { useState } from "react";
import AdminLayout from "./components/AdminLayout";
import { FaPlus, FaEdit, FaTrash, FaEye, FaEnvelope, FaMobile, FaGlobe } from "react-icons/fa";
import { useNotifications, useSendNotification, useUsers } from "@/hooks/useAdminData";
import { Skeleton } from "@/components/ui/skeleton";

interface LocalNotification {
  id: string;
  title: string;
  message: string;
  type: "announcement" | "alert" | "update" | "promotion";
  channels: string[];
  targetAudience: "all" | "verified" | "unverified" | "premium";
  status: "draft" | "scheduled" | "sent";
  scheduledAt?: string;
  sentAt?: string;
  readCount?: number;
}

const sampleNotifications: LocalNotification[] = [
  { id: "NOT-001", title: "System Maintenance", message: "Scheduled maintenance on Jan 28, 2026 from 2-4 AM UTC", type: "announcement", channels: ["email", "push", "in-app"], targetAudience: "all", status: "scheduled", scheduledAt: "2026-01-27 18:00" },
  { id: "NOT-002", title: "New Feature: Staking", message: "Introducing crypto staking with up to 12% APY", type: "update", channels: ["email", "in-app"], targetAudience: "verified", status: "sent", sentAt: "2026-01-25", readCount: 4532 },
  { id: "NOT-003", title: "Security Alert", message: "Update your password for enhanced security", type: "alert", channels: ["email", "push"], targetAudience: "all", status: "sent", sentAt: "2026-01-24", readCount: 8921 },
  { id: "NOT-004", title: "Referral Bonus Increase", message: "Earn 25% more on referrals this month!", type: "promotion", channels: ["email", "in-app"], targetAudience: "premium", status: "draft" },
];

type NotificationType = "announcement" | "alert" | "update" | "promotion";
type TargetAudience = "all" | "verified" | "unverified" | "premium";

const NotificationsAdmin: React.FC = () => {
  const [notifications, setNotifications] = useState(sampleNotifications);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<number | "all">("all");
  const [newNotification, setNewNotification] = useState<{
    title: string;
    message: string;
    type: NotificationType;
    channels: string[];
    targetAudience: TargetAudience;
  }>({
    title: "",
    message: "",
    type: "announcement",
    channels: ["in-app"],
    targetAudience: "all",
  });

  const { data: users, isLoading: usersLoading } = useUsers();
  const sendNotification = useSendNotification();

  const getTypeBadge = (type: string) => {
    const styles: Record<string, string> = {
      announcement: "bg-blue-500/20 text-blue-400",
      alert: "bg-red-500/20 text-red-400",
      update: "bg-green-500/20 text-green-400",
      promotion: "bg-yellow-500/20 text-yellow-400",
    };
    return styles[type] || "bg-gray-500/20 text-gray-400";
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      draft: "bg-gray-500/20 text-gray-400",
      scheduled: "bg-yellow-500/20 text-yellow-400",
      sent: "bg-green-500/20 text-green-400",
    };
    return styles[status] || "bg-gray-500/20 text-gray-400";
  };

  const handleCreate = () => {
    // Create local notification for UI
    const notification: LocalNotification = {
      id: `NOT-${(notifications.length + 1).toString().padStart(3, "0")}`,
      ...newNotification,
      status: "draft",
    };
    setNotifications([notification, ...notifications]);

    // Send to API
    sendNotification.mutate({
      userId: selectedUserId,
      title: newNotification.title,
      message: newNotification.message,
      channel: newNotification.channels.join(","),
    });

    setShowCreateModal(false);
    setNewNotification({
      title: "",
      message: "",
      type: "announcement",
      channels: ["in-app"],
      targetAudience: "all",
    });
    setSelectedUserId("all");
  };

  const toggleChannel = (channel: string) => {
    setNewNotification((prev) => ({
      ...prev,
      channels: prev.channels.includes(channel)
        ? prev.channels.filter((c) => c !== channel)
        : [...prev.channels, channel],
    }));
  };

  return (
    <AdminLayout title="Notifications">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-white">Notifications & Announcements</h2>
            <p className="text-gray-400">Create and manage platform-wide notifications</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center gap-2"
          >
            <FaPlus /> Create Notification
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-[#1a1d2a] rounded-xl p-4 border border-gray-800">
            <p className="text-gray-400 text-sm">Total Sent</p>
            <p className="text-2xl font-bold text-white">{notifications.filter(n => n.status === "sent").length}</p>
          </div>
          <div className="bg-[#1a1d2a] rounded-xl p-4 border border-gray-800">
            <p className="text-gray-400 text-sm">Scheduled</p>
            <p className="text-2xl font-bold text-yellow-400">{notifications.filter(n => n.status === "scheduled").length}</p>
          </div>
          <div className="bg-[#1a1d2a] rounded-xl p-4 border border-gray-800">
            <p className="text-gray-400 text-sm">Drafts</p>
            <p className="text-2xl font-bold text-gray-400">{notifications.filter(n => n.status === "draft").length}</p>
          </div>
          <div className="bg-[#1a1d2a] rounded-xl p-4 border border-gray-800">
            <p className="text-gray-400 text-sm">Total Read</p>
            <p className="text-2xl font-bold text-green-400">
              {notifications.reduce((acc, n) => acc + (n.readCount || 0), 0).toLocaleString()}
            </p>
          </div>
        </div>

        {/* Notifications List */}
        <div className="space-y-4">
          {notifications.map((notification) => (
            <div key={notification.id} className="bg-[#1a1d2a] rounded-2xl p-5 border border-gray-800">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getTypeBadge(notification.type)}`}>
                      {notification.type}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(notification.status)}`}>
                      {notification.status}
                    </span>
                  </div>
                  <h3 className="text-lg font-medium text-white">{notification.title}</h3>
                  <p className="text-gray-400 text-sm mt-1">{notification.message}</p>
                  <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                    <span>Target: {notification.targetAudience}</span>
                    <span className="flex items-center gap-1">
                      Channels: {notification.channels.join(", ")}
                    </span>
                    {notification.readCount && <span>Read: {notification.readCount.toLocaleString()}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="p-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition">
                    <FaEye />
                  </button>
                  <button className="p-2 bg-yellow-500/20 text-yellow-400 rounded-lg hover:bg-yellow-500/30 transition">
                    <FaEdit />
                  </button>
                  <button className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition">
                    <FaTrash />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Create Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-[#1a1d2a] rounded-2xl p-6 max-w-lg w-full border border-gray-800 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white">Create Notification</h3>
                <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-white">✕</button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Title</label>
                  <input
                    type="text"
                    value={newNotification.title}
                    onChange={(e) => setNewNotification({ ...newNotification, title: e.target.value })}
                    className="w-full px-4 py-3 bg-[#0f111b] border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="Notification title"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">Message</label>
                  <textarea
                    value={newNotification.message}
                    onChange={(e) => setNewNotification({ ...newNotification, message: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-3 bg-[#0f111b] border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="Notification message"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">Type</label>
                  <select
                    value={newNotification.type}
                    onChange={(e) => setNewNotification({ ...newNotification, type: e.target.value as LocalNotification["type"] })}
                    className="w-full px-4 py-3 bg-[#0f111b] border border-gray-700 rounded-lg text-white focus:outline-none"
                  >
                    <option value="announcement">Announcement</option>
                    <option value="alert">Alert</option>
                    <option value="update">Update</option>
                    <option value="promotion">Promotion</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">Send To</label>
                  <select
                    value={selectedUserId === "all" ? "all" : selectedUserId.toString()}
                    onChange={(e) => setSelectedUserId(e.target.value === "all" ? "all" : parseInt(e.target.value))}
                    className="w-full px-4 py-3 bg-[#0f111b] border border-gray-700 rounded-lg text-white focus:outline-none"
                  >
                    <option value="all">All Users</option>
                    {usersLoading ? (
                      <option disabled>Loading users...</option>
                    ) : (
                      users?.map((user) => (
                        <option key={user.user_id} value={user.user_id}>
                          {user.user_name} ({user.user_email})
                        </option>
                      ))
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">Channels</label>
                  <div className="flex gap-3">
                    {["email", "push", "in-app"].map((channel) => (
                      <button
                        key={channel}
                        onClick={() => toggleChannel(channel)}
                        className={`px-4 py-2 rounded-lg flex items-center gap-2 transition ${
                          newNotification.channels.includes(channel)
                            ? "bg-red-600 text-white"
                            : "bg-[#0f111b] text-gray-400 hover:bg-gray-800"
                        }`}
                      >
                        {channel === "email" && <FaEnvelope />}
                        {channel === "push" && <FaMobile />}
                        {channel === "in-app" && <FaGlobe />}
                        {channel}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">Target Audience</label>
                  <select
                    value={newNotification.targetAudience}
                    onChange={(e) => setNewNotification({ ...newNotification, targetAudience: e.target.value as LocalNotification["targetAudience"] })}
                    className="w-full px-4 py-3 bg-[#0f111b] border border-gray-700 rounded-lg text-white focus:outline-none"
                  >
                    <option value="all">All Users</option>
                    <option value="verified">Verified Users</option>
                    <option value="unverified">Unverified Users</option>
                    <option value="premium">Premium Users</option>
                  </select>
                </div>

                <div className="flex gap-4 mt-6">
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreate}
                    disabled={!newNotification.title || !newNotification.message || sendNotification.isPending}
                    className="flex-1 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50"
                  >
                    {sendNotification.isPending ? "Sending..." : "Create"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default NotificationsAdmin;
