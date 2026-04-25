import { useState, useEffect } from "react";
import AdminLayout from "./components/AdminLayout";
<<<<<<< HEAD
import { FaSearch, FaCheckCircle, FaTimesCircle } from "react-icons/fa";

interface KycSubmission {
  user_id: number;
  uname: string;
  user_email: string; // <- match the API response
=======
import { FaSearch, FaCheckCircle, FaTimesCircle, FaEye, FaIdCard, FaUser } from "react-icons/fa";
import { useKYCSubmissions, useUpdateKYCStatus, useUsers } from "@/hooks/useAdminData";
import { Skeleton } from "@/components/ui/skeleton";

interface KYCWithUser {
  user_id: number;
>>>>>>> 41c2da549fdfe9a56159b71ebd6adf0d9558cda5
  img_one: string;
  img_two: string;
  img_three: string;
  upload_time: string;
<<<<<<< HEAD
  kyc_stats: "Pending" | "Approved" | "Rejected";
=======
  user_name?: string;
  user_email?: string;
  user_region?: string;
  kyc_status?: string;
>>>>>>> 41c2da549fdfe9a56159b71ebd6adf0d9558cda5
}

const KycReview: React.FC = () => {
  const [kycSubmissions, setKycSubmissions] = useState<KycSubmission[]>([]);
  const [search, setSearch] = useState("");
<<<<<<< HEAD
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
=======
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedKyc, setSelectedKyc] = useState<KYCWithUser | null>(null);

  const { data: kycData, isLoading: kycLoading, error: kycError } = useKYCSubmissions();
  const { data: users, isLoading: usersLoading } = useUsers();
  const updateKYC = useUpdateKYCStatus();

  const isLoading = kycLoading || usersLoading;

  // Merge KYC data with user data
  const kycWithUsers: KYCWithUser[] = (kycData || []).map((kyc) => {
    const user = users?.find(u => u.user_id === kyc.user_id);
    return {
      ...kyc,
      user_name: user?.user_name,
      user_email: user?.user_email,
      user_region: user?.user_region,
      kyc_status: user?.kyc,
    };
  });

  const filteredKyc = kycWithUsers.filter((kyc) => {
    const matchesSearch = (kyc.user_name?.toLowerCase() || "").includes(search.toLowerCase()) ||
      (kyc.user_email?.toLowerCase() || "").includes(search.toLowerCase()) ||
      kyc.user_id.toString().includes(search);
    const matchesStatus = statusFilter === "all" || kyc.kyc_status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string | undefined) => {
    const styles: Record<string, string> = {
      verified: "bg-green-500/20 text-green-400",
      unverified: "bg-yellow-500/20 text-yellow-400",
      rejected: "bg-red-500/20 text-red-400",
    };
    return styles[status || "unverified"] || "bg-gray-500/20 text-gray-400";
  };

  const handleApprove = (userId: number) => {
    updateKYC.mutate({ userId, status: "verified" });
    setSelectedKyc(null);
  };

  const handleReject = (userId: number) => {
    updateKYC.mutate({ userId, status: "rejected" });
    setSelectedKyc(null);
>>>>>>> 41c2da549fdfe9a56159b71ebd6adf0d9558cda5
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
<<<<<<< HEAD
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
=======
              <option value="unverified">Pending</option>
              <option value="verified">Approved</option>
              <option value="rejected">Rejected</option>
>>>>>>> 41c2da549fdfe9a56159b71ebd6adf0d9558cda5
            </select>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-[#1a1d2a] rounded-xl p-4 border border-gray-800">
            <p className="text-gray-400 text-sm">Total Submissions</p>
<<<<<<< HEAD
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
=======
            {isLoading ? (
              <Skeleton className="h-8 w-16 mt-1" />
            ) : (
              <p className="text-2xl font-bold text-white">{kycData?.length || 0}</p>
            )}
          </div>
          <div className="bg-[#1a1d2a] rounded-xl p-4 border border-gray-800">
            <p className="text-gray-400 text-sm">Pending Review</p>
            {isLoading ? (
              <Skeleton className="h-8 w-16 mt-1" />
            ) : (
              <p className="text-2xl font-bold text-yellow-400">
                {kycWithUsers.filter(k => k.kyc_status === "unverified").length}
              </p>
            )}
          </div>
          <div className="bg-[#1a1d2a] rounded-xl p-4 border border-gray-800">
            <p className="text-gray-400 text-sm">Approved</p>
            {isLoading ? (
              <Skeleton className="h-8 w-16 mt-1" />
            ) : (
              <p className="text-2xl font-bold text-green-400">
                {kycWithUsers.filter(k => k.kyc_status === "verified").length}
              </p>
            )}
          </div>
          <div className="bg-[#1a1d2a] rounded-xl p-4 border border-gray-800">
            <p className="text-gray-400 text-sm">Rejected</p>
            {isLoading ? (
              <Skeleton className="h-8 w-16 mt-1" />
            ) : (
              <p className="text-2xl font-bold text-red-400">
                {kycWithUsers.filter(k => k.kyc_status === "rejected").length}
              </p>
            )}
>>>>>>> 41c2da549fdfe9a56159b71ebd6adf0d9558cda5
          </div>
        </div>

        {/* KYC Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
<<<<<<< HEAD
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
=======
          {isLoading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-[#1a1d2a] rounded-2xl p-5 border border-gray-800">
                <Skeleton className="h-12 w-full mb-4" />
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-6 w-1/2" />
              </div>
            ))
          ) : filteredKyc.length === 0 ? (
            <div className="col-span-full text-center py-12 text-gray-400">
              No KYC submissions found
            </div>
          ) : (
            filteredKyc.map((kyc) => (
              <div key={kyc.user_id} className="bg-[#1a1d2a] rounded-2xl p-5 border border-gray-800">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-blue-500/20 rounded-xl">
                      <FaUser className="text-blue-400" />
                    </div>
                    <div>
                      <p className="text-white font-medium">{kyc.user_name || `User #${kyc.user_id}`}</p>
                      <p className="text-gray-400 text-sm">{kyc.user_email || "N/A"}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(kyc.kyc_status)}`}>
                    {kyc.kyc_status || "pending"}
                  </span>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">User ID:</span>
                    <span className="text-white">{kyc.user_id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Region:</span>
                    <span className="text-white">{kyc.user_region || "N/A"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Submitted:</span>
                    <span className="text-white">{new Date(kyc.upload_time).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => setSelectedKyc(kyc)}
                    className="flex-1 py-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition flex items-center justify-center gap-2"
                  >
                    <FaEye /> Review
                  </button>
                  {kyc.kyc_status === "unverified" && (
                    <>
                      <button
                        onClick={() => handleApprove(kyc.user_id)}
                        className="p-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition"
                        disabled={updateKYC.isPending}
                      >
                        <FaCheckCircle />
                      </button>
                      <button
                        onClick={() => handleReject(kyc.user_id)}
                        className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition"
                        disabled={updateKYC.isPending}
                      >
                        <FaTimesCircle />
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Review Modal */}
        {selectedKyc && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-[#1a1d2a] rounded-2xl p-6 max-w-4xl w-full border border-gray-800 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white">
                  KYC Review - {selectedKyc.user_name || `User #${selectedKyc.user_id}`}
                </h3>
                <button
                  onClick={() => setSelectedKyc(null)}
                  className="text-gray-400 hover:text-white"
                >
                  ✕
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <p className="text-gray-400 text-sm mb-2">User Information</p>
                  <div className="space-y-2">
                    <p className="text-white"><span className="text-gray-400">Name:</span> {selectedKyc.user_name || "N/A"}</p>
                    <p className="text-white"><span className="text-gray-400">Email:</span> {selectedKyc.user_email || "N/A"}</p>
                    <p className="text-white"><span className="text-gray-400">User ID:</span> {selectedKyc.user_id}</p>
                    <p className="text-white"><span className="text-gray-400">Region:</span> {selectedKyc.user_region || "N/A"}</p>
                  </div>
                </div>
                <div>
                  <p className="text-gray-400 text-sm mb-2">Submission Details</p>
                  <div className="space-y-2">
                    <p className="text-white">
                      <span className="text-gray-400">Submitted:</span> {new Date(selectedKyc.upload_time).toLocaleString()}
                    </p>
                    <p className="text-white">
                      <span className="text-gray-400">Status:</span>{" "}
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(selectedKyc.kyc_status)}`}>
                        {selectedKyc.kyc_status || "pending"}
                      </span>
                    </p>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <p className="text-gray-400 text-sm mb-2">Document Images</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-gray-400 text-xs mb-1">Document 1</p>
                    <img 
                      src={selectedKyc.img_one || "/placeholder.svg"} 
                      alt="Document 1" 
                      className="w-full h-40 object-cover rounded-lg bg-gray-800" 
                    />
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs mb-1">Document 2</p>
                    <img 
                      src={selectedKyc.img_two || "/placeholder.svg"} 
                      alt="Document 2" 
                      className="w-full h-40 object-cover rounded-lg bg-gray-800" 
                    />
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs mb-1">Selfie</p>
                    <img 
                      src={selectedKyc.img_three || "/placeholder.svg"} 
                      alt="Selfie" 
                      className="w-full h-40 object-cover rounded-lg bg-gray-800" 
                    />
                  </div>
                </div>
              </div>

              {selectedKyc.kyc_status === "unverified" && (
                <div className="flex gap-4">
                  <button
                    onClick={() => handleApprove(selectedKyc.user_id)}
                    disabled={updateKYC.isPending}
                    className="flex-1 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center justify-center gap-2 disabled:opacity-50"
>>>>>>> 41c2da549fdfe9a56159b71ebd6adf0d9558cda5
                  >
                    <FaCheckCircle /> Approve
                  </button>
                  <button
<<<<<<< HEAD
                    onClick={() => updateKycStatus(kyc, "Rejected")}
                    className="flex-1 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition flex items-center justify-center gap-2"
=======
                    onClick={() => handleReject(selectedKyc.user_id)}
                    disabled={updateKYC.isPending}
                    className="flex-1 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center justify-center gap-2 disabled:opacity-50"
>>>>>>> 41c2da549fdfe9a56159b71ebd6adf0d9558cda5
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
