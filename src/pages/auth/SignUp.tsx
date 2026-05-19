import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import ReCAPTCHA from 'react-google-recaptcha';
import { useSystemSettings } from "@/hooks/useAdminData";

type Region = "Europe" | "Asia" | "Africa" | "Americas" | "Oceania";

const SignUp = () => {
  const [form, setForm] = useState({
    
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    address: "",
    dob: "",
    region: "" as Region | "",
    isUSCitizen: false,
  });


  
  const [error, setError] = useState("");
  const [apiData, setApiData] = useState(null);
  const navigate = useNavigate();
  const { data: settings = [] } = useSystemSettings();
  const registrationEnabled = !Array.isArray(settings) || settings.find(s => s.setting_key === "registration_enabled")?.setting_value !== "false";

  const [message, setMessage] = useState("");
  const [captchaStatus, setcaptchaStatus] = useState(false);
  const [key, setKey] = useState('');


  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? (e.target as HTMLInputElement).checked
          : value,
    }));
  };


  const onSuccess = (key) => {
      //console.log(key);
      setKey(key);
      setcaptchaStatus(true);
      //console.log(captchaStatus);
  }


 const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault(); // prevent page reload

  // 1️⃣ Validate passwords
  if (form.password !== form.confirmPassword) {
    setMessage("Passwords do not match");
    return;
  }
  else if(captchaStatus != true) {
      setMessage("Please fill in the captcha");
    return;
  }
  else {

  setError(""); // clear any previous errors

  try {
    // 2️⃣ Send data to PHP backend
    const response = await fetch("https://bluevult.com/api/index.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...form,
        q: "signup", // explicitly ensure request type
      }),
    });
  
    const data = await response.json(); // expect JSON response

    // 3️⃣ Handle backend errors
    if (!response.ok || data?.status === "error") {
      setError(data?.message || "Signup failed");
      return;
    }

    // 4️⃣ Store API response and user ID
    setApiData(data);
    setMessage(data.message || "Signup successful");

    if (data.user_id) {
      localStorage.setItem("user_id", data.user_id);
          setApiData(data);
    }

  } catch (err) {
    console.error(err);
    setError("Network error. Please try again.");
  }
}
};

// ---------------------------
// Redirect effect after successful signup
useEffect(() => {
  if (apiData?.message?.toLowerCase().includes("success")) {
    document.body.style.transition = "opacity 0.5s";
    document.body.style.opacity = "0.8"; // fade effect


    const timer = setTimeout(() => {
      navigate("/otp_verify"); // React Router navigation
    }, 1500);

    return () => clearTimeout(timer); // cleanup if component unmounts
  }
}, [apiData, navigate]);


  return (
    <section className="min-h-screen bg-slate-900 flex items-center justify-center px-6 py-20">
      <div className="w-full max-w-6xl grid md:grid-cols-2 gap-12">

        {/* LEFT — INFO */}
        <div className="hidden md:flex flex-col justify-center">
          <h1 className="text-4xl font-extrabold text-white">
            Create your <br />
            <span className="text-emerald-400">BlueVult</span> account
          </h1>

          <p className="mt-6 text-slate-300 max-w-md">
            Join thousands of investors accessing secure, transparent,
            and high-performance crypto investment opportunities.
          </p>

          <ul className="mt-10 space-y-3 text-slate-400 text-sm">
            <li>✔ Global access</li>
            <li>✔ Secure verification</li>
            <li>✔ Regulated onboarding</li>
          </ul>
        </div>

        {/* RIGHT — FORM */}
        <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-8 md:p-10 shadow-xl">
          <h2 className="text-2xl font-bold text-white mb-6">
            Sign Up
          </h2>

          {!registrationEnabled && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-xl mb-6 text-center">
              User registration is currently disabled by the administrator.
            </div>
          )}


 {message && (
                <p
                  className={`transition-opacity duration-500 ${
                    message ? "opacity-100" : "opacity-0"
                  } bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 px-4 py-2 rounded-md text-sm`}
                >
                  {message}
                  
                </p>
              )}< br/>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-5">

            {/* USERNAME */}
            <input
              name="username"
              placeholder="Username"
              required
              onChange={handleChange}
              className="input"
            />

            {/* EMAIL */}
            <input
              name="email"
              type="email"
              placeholder="Email address"
              required
              onChange={handleChange}
              className="input"
            />

            {/* PASSWORD */}
            <input
              name="password"
              type="password"
              placeholder="Password"
              required
              onChange={handleChange}
              className="input"
            />

            {/* CONFIRM PASSWORD */}
            <input
              name="confirmPassword"
              type="password"
              placeholder="Confirm password"
              required
              onChange={handleChange}
              className="input"
            />

            {/* PHONE */}
            <input
              name="phone"
              type="tel"
              placeholder="Phone number"
              required
              onChange={handleChange}
              className="input"
            />

            {/* DATE OF BIRTH */}
            <input
              name="dob"
              type="date"
              required
              onChange={handleChange}
              className="input"
            />

            {/* REGION */}
            <select
              name="region"
              required
              onChange={handleChange}
              className="input"
            >
              <option value="">Select Region</option>
              <option>Europe</option>
              <option>Asia</option>
              <option>Africa</option>
              <option>Americas</option>
              <option>Oceania</option>
            </select>

            {/* ADDRESS */}
            <input
              name="address"
              placeholder="Residential address"
              required
              onChange={handleChange}
              className="input md:col-span-2"
            />

            {/* US CITIZEN */}
            <label className="flex items-center gap-3 text-slate-300 text-sm md:col-span-2">
              <input
                type="checkbox"
                name="isUSCitizen"
                onChange={handleChange}
                className="accent-emerald-500"
              />
              I am a US citizen
            </label>
             <ReCAPTCHA sitekey="6LcHm1csAAAAALk6axVVopXVrm5AWwK2vJuAKCng" onChange={onSuccess} />

            {/* SUBMIT */}
            <button
              type="submit"
              disabled={!registrationEnabled}
              className="md:col-span-2 bg-emerald-500 hover:bg-emerald-600
                         text-slate-900 font-semibold py-3 rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Create Account
            </button>
{/* SUBMIT 
            <button
  type="submit"
  disabled={!captchaStatus} // disabled if CAPTCHA not done
  className={`mt-4 px-4 py-2 rounded text-white ${
    captchaStatus ? "bg-blue-500 hover:bg-blue-600" : "bg-gray-400 cursor-not-allowed"
  }`}
>
  Sign Up
</button>*/}
          </form>

          <p className="mt-6 text-center text-slate-400 text-sm">
            Already have an account?{" "}
            <Link to="/signIn" className="text-emerald-400 font-semibold hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
};

export default SignUp;