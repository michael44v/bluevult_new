
import Footer from "@/components/landing/Footer";
import Header from "@/components/landing/Header";
import { useSystemSettings } from "@/hooks/useAdminData";

const About = () => {
  const { data: settings = [] } = useSystemSettings();
  const platformName = (Array.isArray(settings) && settings.find(s => s.setting_key === "platform_name")?.setting_value) || "BlueVult";

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100">
        <Header />
      {/* Hero Section */}
    <section className="px-6 py-20 mt-32 text-center max-w-4xl mx-auto">    <h1 className="text-4xl md:text-5xl font-bold mb-6">
          About <span className="text-blue-500">BlueVult</span>
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300">
          BlueVult is built to make crypto trading, tracking, and insights
          simple, secure, and accessible for everyone.
        </p>
      </section>

      {/* Mission */}
      <section className="px-6 py-16 max-w-5xl mx-auto grid md:grid-cols-2 gap-12">
        <div>
          <h2 className="text-2xl font-semibold mb-4">Our Mission</h2>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
            Our mission is to empower users with real-time crypto data,
            intuitive dashboards, and transparent tools that help them make
            smarter financial decisions in the digital asset space.
          </p>
        </div>

        <div>
          <h2 className="text-2xl font-semibold mb-4">Why BlueVult?</h2>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
            We focus on simplicity, performance, and security. Whether you're a
            beginner or an experienced trader, BlueVult provides the tools
            you need without unnecessary complexity.
          </p>
        </div>
      </section>

      {/* Features */}
      <section className="bg-gray-50 dark:bg-gray-800 px-6 py-16">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-semibold text-center mb-10">
            What We Offer
          </h2>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-8">
            {[
              "Real-time market tracking",
              "Secure user authentication",
              "Clean & intuitive dashboard",
              "Dark mode support",
              "Multi-currency insights",
              "Fast & reliable performance",
            ].map((item) => (
              <div
                key={item}
                className="p-6 rounded-xl bg-white dark:bg-gray-900 shadow-sm"
              >
                <p className="font-medium">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="px-6 py-20 text-center max-w-4xl mx-auto">
        <h2 className="text-3xl font-semibold mb-6">
          Start Your  Journey Today
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mb-8">
          Join BlueVult and experience a smarter way to interact with crypto.
        </p>

        <a
          href="/signup"
          className="inline-block px-8 py-3 rounded-lg bg-teal-500 text-white font-medium hover:bg-teal-600 transition"
        >
          Get Started
        </a>
       
      </section>
       <div className="p-6 space-y-6">
                <Footer/>
                </div>
    </div>
    
  );
};

export default About;