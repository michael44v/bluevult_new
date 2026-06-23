import { Link } from "react-router-dom";
import { useState } from "react";
import ReCAPTCHA from "react-google-recaptcha";
import { useSystemSettings } from "@/hooks/useAdminData";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [captchaStatus, setCaptchaStatus] = useState(false);
  const [loading, setLoading] = useState(false);

  const { data: settings = [] } = useSystemSettings();
  const emailNotifications = settings.find(s => s.setting_key === "email_notifications")?.setting_value !== "false";

  const onCaptchaSuccess = (token: string | null) => {
    if (token) {
      setCaptchaStatus(true);
      setError("");
    } else {
      setCaptchaStatus(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");

    

    setLoading(true);

    if (!emailNotifications) {
      setMessage("Reset link sent! Check your inbox.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/mail.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
         body: JSON.stringify({
            
            subject: "Password Reset Email",
            name: "BlueVulter",
            email: email,
            message: "Click on the link below to reset your password. If you didn't request this, please contact support immediately.",
            link: `https://bluevult.com/reset?email=${encodeURIComponent(email)}`,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        setError(data.message || "Could not send reset email. Please try again.");
        return;
      }

      setMessage("Reset link sent! Check your inbox.");
    } catch (err) {
      console.error(err);
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="min-h-screen bg-slate-900 flex items-center justify-center px-6">
      <div className="w-full max-w-5xl grid md:grid-cols-2 gap-12 items-center">

        {/* LEFT */}
        <div className="hidden md:block">
          <h1 className="text-4xl font-extrabold text-white leading-tight">
            Forgot your <br />
            <span className="text-emerald-400">password?</span>
          </h1>
          <p className="mt-6 text-slate-300 max-w-md">
            No worries — enter your registered email and we'll send
            you a secure link to reset your password and get back to
            managing your portfolio.
          </p>

          {/* Decorative steps */}
          <div className="mt-10 space-y-4">
            {[
              { step: "01", text: "Enter your email address below" },
              { step: "02", text: "Check your inbox for the reset link" },
              { step: "03", text: "Create a new secure password" },
            ].map(({ step, text }) => (
              <div key={step} className="flex items-center gap-4">
                <span className="text-emerald-400 font-bold text-sm">{step}</span>
                <span className="text-slate-400 text-sm">{text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT */}
        <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-8 md:p-10 shadow-xl">
          <h2 className="text-2xl font-bold text-white mb-2">Reset Password</h2>

          {/* ERROR */}
          {error && (
            <p className="mb-4 bg-red-900 text-red-200 px-4 py-2 rounded-md text-sm">
              {error}
            </p>
          )}

          {/* SUCCESS */}
          {message && (
            <div className="mb-4 bg-emerald-900/50 border border-emerald-700 text-emerald-300 px-4 py-3 rounded-md text-sm flex items-start gap-3">
              <svg className="w-5 h-5 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{message}</span>
            </div>
          )}

          <p className="text-slate-400 mb-8">
            Enter the email linked to your account and we'll send you a reset link.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* EMAIL */}
            <div>
              <label className="block text-sm text-slate-300 mb-2">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={!!message}
                className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700
                           text-white placeholder-slate-500 focus:outline-none
                           focus:ring-2 focus:ring-emerald-500/40
                           disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="you@example.com"
              />
            </div>

          

            {/* SUBMIT */}
            {!message && (
              <button
                type="submit"
                disabled={ loading}
                className={`w-full font-semibold py-3 rounded-xl transition flex items-center justify-center gap-2
                  ${
                    !loading
                      ? "bg-emerald-500 hover:bg-emerald-600 text-slate-900"
                      : "bg-gray-500 cursor-not-allowed text-gray-300"
                  }
                `}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    Sending...
                  </>
                ) : (
                  "Send Reset Link"
                )}
              </button>
            )}
          </form>

          <p className="mt-8 text-center text-slate-400 text-sm">
            Remembered it?{" "}
            <Link to="/signin" className="text-emerald-400 font-semibold hover:underline">
              Back to Sign In
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
};

export default ForgotPassword;