import { useState, useEffect } from "react";
import AdminLayout from "./components/AdminLayout";

import { FaSearch, FaCheckCircle, FaTimesCircle } from "react-icons/fa";

interface KycSubmission {
  user_id: number;
  uname: string;
  user_email: string; // <- match the API response

  img_one: string;
  img_two: string;
  img_three: string;
  upload_time: string;

  kyc_stats: "Pending" | "Approved" | "Rejected";

}

const KycReview: React.FC = () => {
  const [kycSubmissions, setKycSubmissions] = useState<KycSubmission[]>([]);
  const [search, setSearch] = useState("");

  const [statusFilter, setStatusFilter] = useState<"Pending" | "Approved" | "Rejected" | "all">("all");
  const [selectedKyc, setSelectedKyc] = useState<KycSubmission | null>(null);
  const [loading, setLoading] = useState(false);

  // Fetch submissions from API
  const fetchKycSubmissions = async () => {
    setLoading(true);
    try {
      const res = await fetch("https://bluevult.com/api/admin-api.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ q: "fetch_kyc_submissions" }),
      });
      const data = await res.json();
      if (data.success) {
        setKycSubmissions(data.data);
      } else {
        console.error("Failed to fetch KYC:", data.message);
      }
    } catch (err) {
      console.error("Error fetching KYC submissions:", err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchKycSubmissions();
  }, []);

  // Approve / Reject API calls
  const updateKycStatus = async (submission: KycSubmission, status: "Approved" | "Rejected") => {
    try {
      const res = await fetch("https://bluevult.com/api/admin-api.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          q: "update_kyc_status",
          user_id: submission.user_id,
          status,
        }),
      });

      const data = await res.json();

      if (data.success) {
        // Refresh submissions after update
        fetchKycSubmissions();
        setSelectedKyc(null);

        // Send email to user
        const emailSubject =
          status === "Approved" ? "KYC Verification Approved" : "KYC Verification Rejected";

        const emailMessage =
          status === "Approved"
            ? `Hello ${submission.uname},<br><br>Your KYC verification has been approved. You now have full access to your BlueVult account.`
            : `Hello ${submission.uname},<br><br>Unfortunately, your KYC verification was rejected. Please review your submitted documents and try again.`;

        fetch("https://bluevult.com/api/mail.php", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            subject: emailSubject,
            name: submission.uname,
            email: submission.user_email, // <-- fixed
            message: emailMessage,
          }),
        })
          .then((res) => res.json())
          .then(console.log)
          .catch(console.error);
      } else {
        alert("Failed to update KYC status");
      }
    } catch (err) {
      console.error("Error updating KYC:", err);
      alert("Failed to update KYC status");
    }
  };

  const filteredKyc = kycSubmissions.filter((kyc) => {
    const matchesSearch = kyc.user_id.toString().includes(search);
    const matchesStatus = statusFilter === "all" || kyc.kyc_stats === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      Pending: "bg-yellow-500/20 text-yellow-400",
      Approved: "bg-green-500/20 text-green-400",
      Rejected: "bg-red-500/20 text-red-400",
    };
    return styles[status] || "bg-gray-500/20 text-gray-400";

  };

  if (kycError) {
    return (
      <AdminLayout title="KYC Review">
        <div className="text-center py-12">
          <p className="text-red-400">Failed to load KYC submissions. Please check your API connection.</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="KYC Review">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-white">KYC Submissions</h2>
            <p className="text-gray-400">Review and approve user identity verification</p>
          </div>
          <div className="flex gap-3">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by user ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 pr-4 py-2 bg-[#1a1d2a] border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-4 py-2 bg-[#1a1d2a] border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="all">All Status</option>

              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>

            </select>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-[#1a1d2a] rounded-xl p-4 border border-gray-800">
            <p className="text-gray-400 text-sm">Total Submissions</p>

            <p className="text-2xl font-bold text-white">{kycSubmissions.length}</p>
          </div>
          <div className="bg-[#1a1d2a] rounded-xl p-4 border border-gray-800">
            <p className="text-gray-400 text-sm">Pending</p>
            <p className="text-2xl font-bold text-yellow-400">{kycSubmissions.filter(k => k.kyc_stats === "Pending").length}</p>
          </div>
          <div className="bg-[#1a1d2a] rounded-xl p-4 border border-gray-800">
            <p className="text-gray-400 text-sm">Approved</p>
            <p className="text-2xl font-bold text-green-400">{kycSubmissions.filter(k => k.kyc_stats === "Approved").length}</p>
          </div>
          <div className="bg-[#1a1d2a] rounded-xl p-4 border border-gray-800">
            <p className="text-gray-400 text-sm">Rejected</p>
            <p className="text-2xl font-bold text-red-400">{kycSubmissions.filter(k => k.kyc_stats === "Rejected").length}</p>

          </div>
        </div>

        {/* KYC Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

          {filteredKyc.map((kyc) => (
            <div key={kyc.user_id} className="bg-[#1a1d2a] rounded-2xl p-5 border border-gray-800">
              <div className="flex items-start justify-between mb-4">
                <p className="text-white font-medium">User ID: {kyc.user_id}</p>
                <p className="text-white font-medium">Name: {kyc.uname}</p>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(kyc.kyc_stats)}`}>
                  {kyc.kyc_stats}
                </span>
              </div>
              <div className="grid grid-cols-1 gap-2">
                <img src={kyc.img_one} alt="Front" className="w-full h-40 object-cover rounded-lg bg-gray-800" />
                <img src={kyc.img_two} alt="Back" className="w-full h-40 object-cover rounded-lg bg-gray-800" />
                <img src={kyc.img_three} alt="Selfie" className="w-full h-40 object-cover rounded-lg bg-gray-800" />
              </div>
              {kyc.kyc_stats === "Pending" && (
                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => updateKycStatus(kyc, "Approved")}
                    className="flex-1 py-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition flex items-center justify-center gap-2"

                  >
                    <FaCheckCircle /> Approve
                  </button>
                  <button

                    onClick={() => updateKycStatus(kyc, "Rejected")}
                    className="flex-1 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition flex items-center justify-center gap-2"

                  >
                    <FaTimesCircle /> Reject
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
};

export default KycReview;
