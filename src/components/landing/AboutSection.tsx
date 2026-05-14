import React from "react";

const TEAM = [
  {
    name: "Ethan Volkov",
    role: "CEO & Co-Founder",
    img: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=300&h=360&fit=crop&crop=face",
    bio: "Former Goldman Sachs quant trader with 12 years in algorithmic asset management.",
  },
  {
    name: "Yuki Tanaka",
    role: "CTO",
    img: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=300&h=360&fit=crop&crop=face",
    bio: "Built trading infrastructure at Binance Labs before co-founding BlueVult's tech stack.",
  },
  {
    name: "Amara Diallo",
    role: "Chief Risk Officer",
    img: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=300&h=360&fit=crop&crop=face",
    bio: "PhD in Financial Mathematics. Designed risk models protecting over $2B in client assets.",
  },
];

const AboutSection = () => {
  return (
  <section
  id="about"
  style={{
    background: "#0d1421",
    position: "relative",
    overflow: "hidden",
    fontFamily: "'Roboto', sans-serif",
  }}
>
      {/* Grid Background */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "linear-gradient(rgba(56,97,251,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(56,97,251,0.04) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
          pointerEvents: "none",
        }}
      />

      {/* Glow */}
      <div
        style={{
          position: "absolute",
          top: "-10%",
          left: "-5%",
          width: 500,
          height: 500,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(56,97,251,0.12) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      {/* HERO SECTION */}
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "100px 24px 80px",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 80,
          alignItems: "center",
        }}
      >
        {/* Left Content */}
        <div>
          {/* Badge */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              background: "rgba(56,97,251,0.12)",
              border: "1px solid rgba(56,97,251,0.25)",
              borderRadius: 40,
              padding: "6px 16px",
              marginBottom: 28,
            }}
          >
            <div
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: "#3861fb",
                animation: "pulse 2s infinite",
              }}
            />

            <span
              style={{
                color: "#7b9cff",
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: 1.5,
                textTransform: "uppercase",
              }}
            >
              Established 2003
            </span>
          </div>

          {/* Heading */}
          <h2
            style={{
              fontSize: "clamp(38px, 5vw, 64px)",
              fontWeight: 800,
              color: "#ffffff",
              lineHeight: 1.08,
              marginBottom: 24,
              letterSpacing: -2,
            }}
          >
            Smarter Crypto Investing
            <span
              style={{
                display: "block",
                background:
                  "linear-gradient(135deg, #3861fb 0%, #5b8cff 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Built for the Future.
            </span>
          </h2>

          <p
            style={{
              color: "rgba(235,240,255,0.78)",
              fontSize: 16,
              lineHeight: 1.9,
              marginBottom: 22,
            }}
          >
            BlueVult was founded by a team of quantitative analysts,
            blockchain engineers, and financial strategists with one mission —
            to make institutional-grade crypto investing accessible to everyone.
          </p>

          <p
            style={{
              color: "rgba(180,195,230,0.72)",
              fontSize: 15,
              lineHeight: 1.85,
              marginBottom: 36,
            }}
          >
            Our platform combines AI-driven market intelligence, advanced risk
            management, and real-time portfolio analytics to help investors
            confidently navigate the evolving digital asset economy.
          </p>

          {/* Trust Row */}
          <div
            style={{
              display: "flex",
              gap: 28,
              flexWrap: "wrap",
            }}
          >
            {[
              { icon: "🛡️", label: "Secure Infrastructure" },
              { icon: "⚡", label: "Real-Time Analytics" },
              { icon: "🌍", label: "Global Investors" },
            ].map((item) => (
              <div
                key={item.label}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  color: "rgba(210,220,255,0.75)",
                  fontSize: 13,
                  fontWeight: 500,
                }}
              >
                <span style={{ fontSize: 18 }}>{item.icon}</span>
                {item.label}
              </div>
            ))}
          </div>
        </div>

        {/* Right Video */}
        <div style={{ position: "relative" }}>
          <div
            style={{
              position: "relative",
              borderRadius: 24,
              overflow: "hidden",
              border: "1px solid rgba(56,97,251,0.2)",
              boxShadow: "0 30px 80px rgba(0,0,0,0.5)",
            }}
          >
            <div
              style={{
                position: "relative",
                paddingBottom: "56.25%",
                height: 0,
              }}
            >
              <iframe
                src="https://www.youtube.com/embed/1YyAzVmP9xQ?autoplay=1&mute=1&loop=1&playlist=1YyAzVmP9xQ&controls=1&rel=0"
                title="BlueVult Overview"
                allow="autoplay; encrypted-media; picture-in-picture"
                allowFullScreen
                style={{
                  position: "absolute",
                  inset: 0,
                  width: "100%",
                  height: "100%",
                  border: "none",
                }}
              />
            </div>
          </div>

          {/* Floating Card */}
          <div
            style={{
              position: "absolute",
              bottom: -20,
              left: -20,
              background:
                "linear-gradient(135deg, rgba(14,25,48,0.96), rgba(8,16,34,0.98))",
              border: "1px solid rgba(56,97,251,0.25)",
              borderRadius: 16,
              padding: "14px 20px",
              display: "flex",
              alignItems: "center",
              gap: 12,
              boxShadow: "0 12px 40px rgba(0,0,0,0.45)",
            }}
          >
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: "50%",
                background:
                  "linear-gradient(135deg, #3861fb, #5b8cff)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 20,
              }}
            >
              📈
            </div>

            <div>
              <p
                style={{
                  color: "#4ade80",
                  fontWeight: 700,
                  fontSize: 16,
                  fontFamily: "monospace",
                }}
              >
                +$14,280
              </p>

              <p
                style={{
                  color: "rgba(180,195,230,0.6)",
                  fontSize: 11,
                }}
              >
                Avg. monthly returns
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* TEAM SECTION */}
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "20px 24px 100px",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: 64 }}>
          <p
            style={{
              color: "#7b9cff",
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: 2,
              textTransform: "uppercase",
              marginBottom: 14,
            }}
          >
            Leadership Team
          </p>

          <h3
            style={{
              fontSize: "clamp(30px, 4vw, 48px)",
              fontWeight: 800,
              color: "#ffffff",
              letterSpacing: -1,
            }}
          >
            The Minds Behind BlueVult
          </h3>
        </div>

       <div
  className="team-grid"
  style={{
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: 32,
  }}
>
          {TEAM.map((member) => (
            <div
              key={member.name}
              style={{
                background:
                  "linear-gradient(160deg, rgba(15,25,50,0.95), rgba(8,16,34,0.98))",
                border: "1px solid rgba(56,97,251,0.15)",
                borderRadius: 22,
                overflow: "hidden",
                transition: "all 0.3s ease",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLDivElement).style.transform =
                  "translateY(-6px)";
                (e.currentTarget as HTMLDivElement).style.boxShadow =
                  "0 24px 60px rgba(56,97,251,0.18)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLDivElement).style.transform =
                  "translateY(0)";
                (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
              }}
            >
              <div
                style={{
                  position: "relative",
                  height: 240,
                  overflow: "hidden",
                }}
              >
                <img
                  src={member.img}
                  alt={member.name}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    objectPosition: "center top",
                  }}
                />

                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background:
                      "linear-gradient(to top, rgba(8,16,34,1), transparent)",
                  }}
                />
              </div>

              <div style={{ padding: "24px" }}>
                <p
                  style={{
                    color: "#ffffff",
                    fontWeight: 700,
                    fontSize: 20,
                    marginBottom: 6,
                  }}
                >
                  {member.name}
                </p>

                <p
                  style={{
                    color: "#7b9cff",
                    fontSize: 13,
                    fontWeight: 700,
                    marginBottom: 14,
                    letterSpacing: 0.5,
                  }}
                >
                  {member.role}
                </p>

                <p
                  style={{
                    color: "rgba(180,195,230,0.72)",
                    fontSize: 14,
                    lineHeight: 1.75,
                  }}
                >
                  {member.bio}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Styles */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700;800&display=swap');

        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.4;
          }
        }

        @media (max-width: 900px) {
          #about > div:nth-child(3) {
            grid-template-columns: 1fr !important;
            gap: 50px !important;
          }

          .team-grid {
  grid-template-columns: 1fr !important;
}
        }
      `}</style>
    </section>
  );
};

export default AboutSection;