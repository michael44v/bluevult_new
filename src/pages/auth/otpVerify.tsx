import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const OtpVerify = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const userId = location.state?.userId;

  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  if (!userId) {
    navigate("/signin");
    return null;
  }

  const handleVerify = async () => {
    if (otp.length !== 6) {
      toast.error("Please enter a valid 6-digit OTP");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("https://bluevult.com/api/index.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ q: "verify_otp", uid: userId, otp }),
      });

      const data = await response.json();
      if (data.success) {
        toast.success("OTP verified successfully");
        localStorage.setItem("user_id", userId);
        navigate("/dashboard");
      } else {
        toast.error(data.message || "Invalid OTP code");
      }
    } catch (error) {
      toast.error("Failed to verify OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-slate-800 border border-slate-700 p-8 rounded-2xl shadow-xl text-center">
        <h2 className="text-3xl font-bold text-white mb-4">OTP Verification</h2>
        <p className="text-slate-400 mb-8">
          Enter the 6-digit code sent to your email to verify your login.
        </p>

        <div className="flex justify-center mb-8">
          <InputOTP
            maxLength={6}
            value={otp}
            onChange={(value) => setOtp(value)}
          >
            <InputOTPGroup>
              <InputOTPSlot index={0} className="w-12 h-14 text-white border-slate-600" />
              <InputOTPSlot index={1} className="w-12 h-14 text-white border-slate-600" />
              <InputOTPSlot index={2} className="w-12 h-14 text-white border-slate-600" />
              <InputOTPSlot index={3} className="w-12 h-14 text-white border-slate-600" />
              <InputOTPSlot index={4} className="w-12 h-14 text-white border-slate-600" />
              <InputOTPSlot index={5} className="w-12 h-14 text-white border-slate-600" />
            </InputOTPGroup>
          </InputOTP>
        </div>

        <Button
          onClick={handleVerify}
          disabled={loading || otp.length !== 6}
          className="w-full bg-emerald-500 hover:bg-emerald-600 text-slate-900 font-bold py-6 rounded-xl"
        >
          {loading ? "Verifying..." : "Verify OTP"}
        </Button>

        <button
          onClick={() => navigate("/signin")}
          className="mt-6 text-emerald-400 hover:underline text-sm"
        >
          Back to Login
        </button>
      </div>
    </div>
  );
};

export default OtpVerify;
