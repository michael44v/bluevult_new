import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useState, useEffect } from "react";

const ResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [form, setForm] = useState({
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [tokenValid, setTokenValid] = useState<boolean | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Read and decode the email from the URL
  // e.g. /reset?email=michaelnwankwoscloud%40gmail.com → michaelnwankwoscloud@gmail.com
  const rawEmail = searchParams.get("email");
  const email = rawEmail ? decodeURIComponent(rawEmail) : null;

  // Validate email on mount
  useEffect(() => {
    if (!email) {
      setTokenValid(false);
      setError("Invalid reset link. No email address found.");
      return;
    }
document.body.style.transition = "opacity 0.5s";
      document.body.style.opacity = "1";
    const verifyEmail = async () => {
      try {
        const response = await fetch("https://bluevult.com/api/index.php", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ q: "verify_reset_token", email }),
        });
        const data = await response.json();
        setTokenValid(data.success);
        if (!data.success) {
          setError(data.message || "This reset link is invalid or has expired.");
        }
      } catch {
        setTokenValid(false);
        setError("Could not validate reset link. Please try again.");
      }
    };

    verifyEmail();
  }, [email]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // Password strength checker
  const getStrength = (pw: string) => {
    let score = 0;
    if (pw.length >= 8) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    return score;
  };

  const strengthLabels = ["", "Weak", "Fair", "Good", "Strong"];
  const strengthColors = ["", "bg-red-500", "bg-amber-500", "bg-yellow-400", "bg-emerald-500"];
  const strength = getStrength(form.password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (form.password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("https://bluevult.com/api/index.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          q: "reset_password",
          email,
          password: form.password,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        setError(data.message || "Failed to reset password. Please try again.");
        return;
      }

      setMessage("Password reset successfully! Redirecting to sign in...");

      document.body.style.transition = "opacity 0.5s";
      document.body.style.opacity = "0.8";

      setTimeout(() => {
        navigate("/signin");
      }, 2000);
    } catch (err) {
      console.error(err);
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Eye icon toggle component
  const EyeIcon = ({ visible }: { visible: boolean }) =>
    visible ? (
      <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
      </svg>
    ) : (
      <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
      </svg>
    );

  return (
    <section className="min-h-screen bg-slate-900 flex items-center justify-center px-6">
      <div className="w-full max-w-5xl grid md:grid-cols-2 gap-12 items-center">

        {/* LEFT */}
        <div className="hidden md:block">
          <h1 className="text-4xl font-extrabold text-white leading-tight">
            Create a new <br />
            <span className="text-emerald-400">secure password</span>
          </h1>
          <p className="mt-6 text-slate-300 max-w-md">
            Your new password must be at least 8 characters and ideally
            include a mix of uppercase letters, numbers, and symbols.
          </p>

          {/* Password tips */}
          <div className="mt-10 space-y-3">
            {[
              "At least 8 characters long",
              "Include uppercase and lowercase letters",
              "Add a number or special character",
            ].map((tip) => (
              <div key={tip} className="flex items-center gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                <span className="text-slate-400 text-sm">{tip}</span>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT */}
        <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-8 md:p-10 shadow-xl">
          <h2 className="text-2xl font-bold text-white mb-2">New Password</h2>

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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{message}</span>
            </div>
          )}

          {/* Token invalid state */}
          {tokenValid === false && !message && (
            <div className="mb-4 bg-amber-900/40 border border-amber-700 text-amber-300 px-4 py-3 rounded-md text-sm">
              This reset link is invalid or has expired.{" "}
              <Link to="/forgot-password" className="underline font-semibold">
                Request a new one
              </Link>
              .
            </div>
          )}

          <p className="text-slate-400 mb-8">
            Choose a strong password for your BlueVult account.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* NEW PASSWORD */}
            <div>
              <label className="block text-sm text-slate-300 mb-2">New Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  required
                  disabled={!tokenValid || !!message}
                  className="w-full px-4 py-3 pr-12 rounded-xl bg-slate-900 border border-slate-700
                             text-white placeholder-slate-500 focus:outline-none
                             focus:ring-2 focus:ring-emerald-500/40
                             disabled:opacity-40 disabled:cursor-not-allowed"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-4 top-1/2 -translate-y-1/2"
                  tabIndex={-1}
                >
                  <EyeIcon visible={showPassword} />
                </button>
              </div>

              {/* Strength bar */}
              {form.password && (
                <div className="mt-2">
                  <div className="flex gap-1 h-1">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className={`flex-1 rounded-full transition-all ${
                          i <= strength ? strengthColors[strength] : "bg-slate-700"
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Strength: <span className="text-white">{strengthLabels[strength]}</span>
                  </p>
                </div>
              )}
            </div>

            {/* CONFIRM PASSWORD */}
            <div>
              <label className="block text-sm text-slate-300 mb-2">Confirm Password</label>
              <div className="relative">
                <input
                  type={showConfirm ? "text" : "password"}
                  name="confirmPassword"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  required
                  disabled={!tokenValid || !!message}
                  className={`w-full px-4 py-3 pr-12 rounded-xl bg-slate-900 border text-white placeholder-slate-500
                              focus:outline-none focus:ring-2 focus:ring-emerald-500/40
                              disabled:opacity-40 disabled:cursor-not-allowed transition
                              ${
                                form.confirmPassword && form.password !== form.confirmPassword
                                  ? "border-red-500"
                                  : form.confirmPassword && form.password === form.confirmPassword
                                  ? "border-emerald-500"
                                  : "border-slate-700"
                              }`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((v) => !v)}
                  className="absolute right-4 top-1/2 -translate-y-1/2"
                  tabIndex={-1}
                >
                  <EyeIcon visible={showConfirm} />
                </button>
              </div>
              {form.confirmPassword && form.password !== form.confirmPassword && (
                <p className="text-xs text-red-400 mt-1">Passwords do not match</p>
              )}
              {form.confirmPassword && form.password === form.confirmPassword && (
                <p className="text-xs text-emerald-400 mt-1">Passwords match</p>
              )}
            </div>

            {/* SUBMIT */}
            <button
              type="submit"
              disabled={!tokenValid || loading || !!message}
              className={`w-full font-semibold py-3 rounded-xl transition flex items-center justify-center gap-2
                ${
                  tokenValid && !loading && !message
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
                  Resetting...
                </>
              ) : (
                "Reset Password"
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-slate-400 text-sm">
            Back to{" "}
            <Link to="/signin" className="text-emerald-400 font-semibold hover:underline">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
};

export default ResetPassword;