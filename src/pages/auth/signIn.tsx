import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import ReCAPTCHA from "react-google-recaptcha";
import { useSystemSettings } from "@/hooks/useAdminData";

const SignIn = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [captchaStatus, setCaptchaStatus] = useState(false);

  const { data: settings = [] } = useSystemSettings();
  const require2FA = settings.find(s => s.setting_key === "require_2fa")?.setting_value === "true";
  const force2FA = settings.find(s => s.setting_key === "force_2fa")?.setting_value === "true";

  const [showSecurityQuestion, setShowSecurityQuestion] = useState(false);
  const [securityQuestion, setSecurityQuestion] = useState("");
  const [securityAnswer, setSecurityAnswer] = useState("");

  const [showOTP, setShowOTP] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [isSendingOTP, setIsSendingOTP] = useState(false);
  const [tempUserId, setTempUserId] = useState<string | null>(null);

  // Handle input change
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Captcha success
  const onCaptchaSuccess = (token: string | null) => {
    if (token) {
      setCaptchaStatus(true);
      setError("");
    } else {
      setCaptchaStatus(false);
    }
  };

  // Submit handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setError("");
    setMessage("");

    if (!captchaStatus) {
      setError("Please complete the captcha");
      return;
    }

    try {
      const response = await fetch("/api/index.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          q: "signin",
          email: form.email,
          password: form.password,
          security_answer: securityAnswer,
        }),
      });

      const data = await response.json();

      // ❌ LOGIN FAILED
      if (!data.success) {
        setError(data.message || "Invalid email or password");
        return;
      }

      // ✅ OTP REQUIRED
      if (data.otp_required) {
        navigate("/otp-verify", { state: { userId: data.user_id } });
        return;
      }

      // ✅ LOGIN SUCCESS
      if (require2FA && !showSecurityQuestion) {
        if (data.security_question) {
          setSecurityQuestion(data.security_question);
          setShowSecurityQuestion(true);
          setCaptchaStatus(false); // Reset captcha for security answer step
          return;
        } else {
            setError("Two-Factor Authentication (Security Question) is mandatory. Please contact support to set up your security question.");
            return;
        }
      }

      if (force2FA) {
        navigate("/otp-verify", { state: { userId: data.user_id } });
        return;
      }

      setMessage("Login successful");
      localStorage.setItem("user_id", data.user_id);

      document.body.style.transition = "opacity 0.5s";
      document.body.style.opacity = "0.8";

      setTimeout(() => {
        navigate("/dashboard");
      }, 800);

    } catch (err) {
      console.error(err);
      setError("Network error. Please try again.");
    }
  };

  return (
    <section className="min-h-screen bg-slate-900 flex items-center justify-center px-6">
      <div className="w-full max-w-5xl grid md:grid-cols-2 gap-12 items-center">

        {/* LEFT */}
        <div className="hidden md:block">
          <h1 className="text-4xl font-extrabold text-white leading-tight">
            Welcome back to <br />
            <span className="text-emerald-400">{settings.find(s => s.setting_key === "platform_name")?.setting_value || "BlueVult"}</span>
          </h1>

          <p className="mt-6 text-slate-300 max-w-md">
            Sign in to manage your investments, track performance,
            and grow your crypto portfolio securely.
          </p>
        </div>

        {/* RIGHT */}
        <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-8 md:p-10 shadow-xl">
          <h2 className="text-2xl font-bold text-white mb-2">
            Sign In
          </h2>

          {/* ERROR */}
          {error && (
            <p className="mb-4 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 px-4 py-2 rounded-md text-sm">
              {error}
            </p>
          )}

          {/* SUCCESS */}
          {message && (
            <p className="mb-4 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-4 py-2 rounded-md text-sm">
              {message}
            </p>
          )}

          <p className="text-slate-400 mb-8">
            {showOTP
              ? "Enter the 6-digit code sent to your email"
              : showSecurityQuestion
                ? "Answer your security question to continue"
                : "Enter your credentials to continue"}
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {showOTP ? (
              <div>
                <label className="block text-sm text-slate-300 mb-2 font-bold">
                  Security Code
                </label>
                <input
                  type="text"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  required
                  maxLength={6}
                  className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700
                             text-white placeholder-slate-500 focus:outline-none
                             focus:ring-2 focus:ring-emerald-500/40 text-center tracking-[1em] text-2xl"
                  placeholder="000000"
                />
                <button
                  type="button"
                  onClick={() => setShowOTP(false)}
                  className="text-xs text-emerald-400 mt-2 hover:underline"
                >
                  Back to login
                </button>
              </div>
            ) : !showSecurityQuestion ? (
              <>
                {/* EMAIL */}
                <div>
                  <label className="block text-sm text-slate-300 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700
                               text-white placeholder-slate-500 focus:outline-none
                               focus:ring-2 focus:ring-emerald-500/40"
                    placeholder="you@example.com"
                  />
                </div>

                {/* PASSWORD */}
                <div>
                  <label className="block text-sm text-slate-300 mb-2">
                    Password
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700
                               text-white placeholder-slate-500 focus:outline-none
                               focus:ring-2 focus:ring-emerald-500/40"
                    placeholder="••••••••"
                  />
                </div>
              </>
            ) : (
              <div>
                <label className="block text-sm text-slate-300 mb-2 font-bold">
                  {securityQuestion}
                </label>
                <input
                  type="text"
                  value={securityAnswer}
                  onChange={(e) => setSecurityAnswer(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700
                             text-white placeholder-slate-500 focus:outline-none
                             focus:ring-2 focus:ring-emerald-500/40"
                  placeholder="Your answer"
                />
                <button
                  type="button"
                  onClick={() => setShowSecurityQuestion(false)}
                  className="text-xs text-emerald-400 mt-2 hover:underline"
                >
                  Back to login
                </button>
              </div>
            )}

            <div className="flex items-center justify-between text-sm">
              <Link
                to="/forgot-password"
                className="text-emerald-400 hover:underline"
              >
                Forgot password?
              </Link>
            </div>

            {/* CAPTCHA */}
            <ReCAPTCHA
              sitekey="6LcHm1csAAAAALk6axVVopXVrm5AWwK2vJuAKCng"
              onChange={onCaptchaSuccess}
            />

            {/* SUBMIT */}
            <button
              type="submit"
              disabled={!captchaStatus}
              className={`w-full font-semibold py-3 rounded-xl transition
                ${
                  captchaStatus
                    ? "bg-emerald-500 hover:bg-emerald-600 text-slate-900"
                    : "bg-gray-500 cursor-not-allowed text-gray-300"
                }
              `}
            >
              Sign In
            </button>
          </form>

          <p className="mt-8 text-center text-slate-400 text-sm">
            Don’t have an account?{" "}
            <Link
              to="/signUp"
              className="text-emerald-400 font-semibold hover:underline"
            >
              Create one
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
};

export default SignIn;