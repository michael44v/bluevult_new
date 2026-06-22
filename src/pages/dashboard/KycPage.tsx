import TopBar from '@/components/dashboard/TopBar';
import { useEffect, useState } from "react";
import Sidebar from "./dashboardWidgets/Sidebar";
import Footer from "@/components/landing/Footer";
import { useNavigate } from "react-router-dom";
import { useSystemSettings } from "@/hooks/useAdminData";

import {
  FaBars,
  FaMoon,
  FaSun,
  FaBell,
  FaUserCircle,
  FaCheckCircle,
  FaSpinner,
} from "react-icons/fa";

export default function KycPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dark, setDark] = useState(false);

  // KYC form state
  const [idType, setIdType] = useState("");
  const [country, setCountry] = useState("");

  // Previews
  const [frontPreview, setFrontPreview] = useState<string | null>(null);
  const [backPreview, setBackPreview] = useState<string | null>(null);
  const [selfiePreview, setSelfiePreview] = useState<string | null>(null);

  // Actual files
  const [frontFile, setFrontFile] = useState<File | null>(null);
  const [backFile, setBackFile] = useState<File | null>(null);
  const [selfieFile, setSelfieFile] = useState<File | null>(null);

  // KYC status
  const [kycStatus, setKycStatus] = useState<"loading" | "verified" | "unverified" | "pending">("loading");
  
  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const navigate = useNavigate();
  const { data: settings = [] } = useSystemSettings();
  const emailNotifications = settings.find(s => s.setting_key === "email_notifications")?.setting_value !== "false";


  const CLOUD_NAME = "dguvkirdr";
  const UPLOAD_PRESET = "kyc_upload";

  const uid = localStorage.getItem("user_id");

  // File change handler with validation
  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setPreview: React.Dispatch<React.SetStateAction<string | null>>,
    setFile: React.Dispatch<React.SetStateAction<File | null>>
  ) => {
    const file = e.target.files?.[0] || null;
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      alert('Please upload a valid image file (JPG, PNG, GIF, or WebP)');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    setFile(file);
    setPreview(URL.createObjectURL(file));
  };

  // Fetch KYC status on page load
  useEffect(() => {
    if (!uid) {
      setKycStatus("unverified");
      return;
    }

    const fetchStatus = async () => {
      try {
        const res = await fetch("https://bluevult.com/api/index.php", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ q: "get_kyc_status", uid: Number(uid) }),
        });
        
        if (!res.ok) throw new Error('Failed to fetch status');
        
        const data = await res.json();
        
        if (data.kyc === "verified") {
          setKycStatus("verified");
        } else if (data.kyc === "pending") {
          setKycStatus("pending");
        } else {
          setKycStatus("unverified");
        }
      } catch (error) {
        console.error("Error fetching KYC status:", error);
        setKycStatus("unverified");
      }
    };

    fetchStatus();
  }, [uid]);

  // Cleanup preview URLs on unmount
  useEffect(() => {
    return () => {
      if (frontPreview) URL.revokeObjectURL(frontPreview);
      if (backPreview) URL.revokeObjectURL(backPreview);
      if (selfiePreview) URL.revokeObjectURL(selfiePreview);
    };
  }, [frontPreview, backPreview, selfiePreview]);

  // Submit KYC files
 // Replace your submitKyc function with this debug version
            const uploadToCloudinary = async (file: File): Promise<string> => {
          const formData = new FormData();
          formData.append("file", file);
          formData.append("upload_preset", CLOUD_NAME ? UPLOAD_PRESET : "");

          const res = await fetch(
            `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
            {
              method: "POST",
              body: formData,
            }
          );

          const data = await res.json();

          if (!data.secure_url) {
            throw new Error("Cloudinary upload failed");
          }

          return data.secure_url;
        };
/* ================= SUBMIT KYC (REWRITTEN) ================= */
const submitKyc = async () => {
  console.log("=== KYC SUBMISSION DEBUG ===");
  console.log("UID:", uid);
  console.log("ID Type:", idType);
  console.log("Country:", country);
  console.log("Front File:", frontFile);
  console.log("Back File:", backFile);
  console.log("Selfie File:", selfieFile);

  if (!uid) {
    alert("User ID not found. Please log in again.");
    return;
  }

  if (!frontFile || !backFile) {
    alert("Please upload both front and back ID images");
    return;
  }

  if (!idType || !country) {
    alert("Please select ID type and country");
    return;
  }

  setIsSubmitting(true);

  try {
    // 1️⃣ Upload images to Cloudinary
    const img_one = await uploadToCloudinary(frontFile);
    const img_two = await uploadToCloudinary(backFile);
    const img_three = selfieFile ? await uploadToCloudinary(selfieFile) : null;
    const uname = localStorage.getItem("user_name");



    console.log("Uploaded URLs:", { img_one, img_two, img_three });

    // 2️⃣ Send only URLs + metadata to PHP
    const res = await fetch("https://bluevult.com/api/index.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        q: "submit_kyc_urls",
        uid,
        idType,
        country,
        img_one,
        img_two,
        img_three,uname
      }),
    });

    const text = await res.text();
    console.log("Raw response:", text);

    if (!text) throw new Error("Empty server response");

    const data = JSON.parse(text);

    if (data.status !== "success") {
      throw new Error(data.message || "KYC submission failed");
    }

    console.log(" KYC submitted successfully!");
    setModalVisible(true);
    setKycStatus("pending");

    // Reset form
    setFrontPreview(null);
    setBackPreview(null);
    setSelfiePreview(null);
    setFrontFile(null);
    setBackFile(null);
    setSelfieFile(null);
    setIdType("");
    setCountry("");

    if (emailNotifications) {
      fetch('https://bluevult.com/api/mail.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: 'KYC Verification Request',
          name :uname,
          email: localStorage.getItem("user_email"),

          message: 'Your documents have been recieved and is under review. please check back in 10 - 15 minutes time'
        })
      })
      .then(res => res.json())
      .then(console.log)   // will show success or error from PHP
      .catch(console.error);
    }



  } catch (err: any) {
    console.error("❌ KYC submission error:", err);
    alert(err.message || "Upload failed");
  } finally {
    setIsSubmitting(false);
  }
};
  return (
    <div className="min-h-screen bg-gray-100 text-gray-900">
      {/* Top Bar */}
      <TopBar title="KYC Verification" onSidebarToggle={() => setSidebarOpen(true)} />

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 w-64 bg-white shadow-lg z-50 transform transition-transform ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0`}
      >
        <Sidebar onClose={() => setSidebarOpen(false)} />
      </div>

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main */}
      <main className="pt-24 lg:pl-64 px-6 pb-20">
        <div className="max-w-3xl mx-auto space-y-6">

          {/* Loading state */}
          {kycStatus === "loading" && (
            <div className="bg-white rounded-xl shadow p-12 text-center">
              <FaSpinner className="animate-spin text-4xl text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Loading KYC status...</p>
            </div>
          )}

          {/* Verified view */}
          {kycStatus === "verified" && (
            <div className="bg-white rounded-2xl shadow p-12 text-center space-y-6">
              <FaCheckCircle className="text-green-500 text-8xl mx-auto" />
              <h2 className="text-2xl font-bold text-gray-900">Your profile has been verified</h2>
              <ul className="text-gray-600 text-sm space-y-2 text-left max-w-md mx-auto">
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">✔</span>
                  <span>You can now do inter-account transfers</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">✔</span>
                  <span>You can hold and withdraw up to <b>$5,000,000</b> in crypto, stocks & investments</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">✔</span>
                  <span>Chat one-on-one with customer support</span>
                </li>
              </ul>
            </div>
          )}

          {/* Pending view */}
          {kycStatus === "pending" && (
            <div className="bg-white rounded-xl shadow p-12 text-center space-y-4">
              <FaSpinner className="animate-spin text-blue-500 text-6xl mx-auto" />
              <h2 className="text-2xl font-bold">Verification In Progress</h2>
              <p className="text-gray-600">
                Your documents are being reviewed. This usually takes 5-10 minutes.
              </p>
              <p className="text-sm text-gray-500">
                You'll be notified once the verification is complete.
              </p>
            </div>
          )}

          {/* Unverified view */}
          {kycStatus === "unverified" && (
            <div className="bg-white rounded-xl shadow p-6 space-y-6">
              <div className="border-b pb-4">
                <h2 className="text-xl font-bold">Complete Your KYC Verification</h2>
                <p className="text-sm text-gray-600 mt-1">
                  Upload your ID documents to unlock all platform features
                </p>
              </div>

              {/* ID Type */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Select ID Type <span className="text-red-500">*</span>
                </label>
                <select
                  value={idType}
                  onChange={(e) => setIdType(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Choose document type</option>
                  <option value="passport">International Passport</option>
                  <option value="national_id">National ID Card</option>
                  <option value="drivers_license">Driver's License</option>
                </select>
              </div>

              {/* Country */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Issuing Country <span className="text-red-500">*</span>
                </label>
                <select
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select country</option>
                  <option value="US">United States</option>
                  <option value="GB">United Kingdom</option>
                  <option value="CA">Canada</option>
                  <option value="DE">Germany</option>
                 
                  <option value="other">Other</option>
                </select>
              </div>

              {/* Front ID */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Upload ID (Front) <span className="text-red-500">*</span>
                </label>
                <input
                  id="front"
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                  className="hidden"
                  onChange={(e) => handleFileChange(e, setFrontPreview, setFrontFile)}
                />
                <label
                  htmlFor="front"
                  className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex justify-center items-center cursor-pointer hover:border-blue-400 transition-colors min-h-[150px]"
                >
                  {frontPreview ? (
                    <img 
                      src={frontPreview} 
                      alt="Front ID preview"
                      className="max-h-40 object-contain rounded" 
                    />
                  ) : (
                    <span className="text-gray-500">Click to upload front side</span>
                  )}
                </label>
                {frontFile && (
                  <p className="text-xs text-gray-500 mt-1">
                    {frontFile.name} ({(frontFile.size / 1024).toFixed(2)} KB)
                  </p>
                )}
              </div>

              {/* Back ID */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Upload ID (Back) <span className="text-red-500">*</span>
                </label>
                <input
                  id="back"
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                  className="hidden"
                  onChange={(e) => handleFileChange(e, setBackPreview, setBackFile)}
                />
                <label
                  htmlFor="back"
                  className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex justify-center items-center cursor-pointer hover:border-blue-400 transition-colors min-h-[150px]"
                >
                  {backPreview ? (
                    <img 
                      src={backPreview} 
                      alt="Back ID preview"
                      className="max-h-40 object-contain rounded" 
                    />
                  ) : (
                    <span className="text-gray-500">Click to upload back side</span>
                  )}
                </label>
                {backFile && (
                  <p className="text-xs text-gray-500 mt-1">
                    {backFile.name} ({(backFile.size / 1024).toFixed(2)} KB)
                  </p>
                )}
              </div>

              {/* Selfie */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Selfie (Optional)
                </label>
                <input
                  id="selfie"
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                  className="hidden"
                  onChange={(e) => handleFileChange(e, setSelfiePreview, setSelfieFile)}
                />
                <label
                  htmlFor="selfie"
                  className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex justify-center items-center cursor-pointer hover:border-blue-400 transition-colors min-h-[150px]"
                >
                  {selfiePreview ? (
                    <img 
                      src={selfiePreview} 
                      alt="Selfie preview"
                      className="max-h-40 object-contain rounded" 
                    />
                  ) : (
                    <span className="text-gray-500">Click to upload selfie</span>
                  )}
                </label>
                {selfieFile && (
                  <p className="text-xs text-gray-500 mt-1">
                    {selfieFile.name} ({(selfieFile.size / 1024).toFixed(2)} KB)
                  </p>
                )}
              </div>

              {/* Submit */}
              <button
                disabled={!idType || !country || !frontFile || !backFile || isSubmitting}
                onClick={submitKyc}
                className="w-full bg-gray-900 text-white py-4 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <FaSpinner className="animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit for Verification"
                )}
              </button>

              <p className="text-xs text-gray-500 text-center">
                Your documents are encrypted and stored securely
              </p>
            </div>
          )}
        </div>
      </main>

      <Footer />

      {/* Success Modal */}
      {modalVisible && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-8 rounded-xl max-w-sm w-full text-center space-y-4 animate-fadeIn">
            <FaCheckCircle className="text-green-500 text-6xl mx-auto" />
            <h2 className="font-bold text-xl">Submission Successful!</h2>
            <p className="text-gray-600">
              Your documents have been uploaded successfully. The system will automatically verify them within 5-10 minutes.
            </p>
            <button
              className="mt-4 bg-gray-900 text-white px-6 py-3 rounded-xl hover:bg-gray-800 transition-colors w-full"
              onClick={() => setModalVisible(false)}
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
}