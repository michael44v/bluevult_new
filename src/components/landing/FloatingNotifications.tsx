import { useEffect, useState } from "react";

const notifications = [
  "Michael withdrew $40,000",
  "David invested $50,000",
  "Sophia earned $12,400",
  "Daniel withdrew $98,200",
  "Emma invested $15,000",
  "James earned $49,500",
  "Olivia withdrew $22,000",
  "Noah invested $57,800",
  "Charlotte earned $18,600",
  "Lucas withdrew $11,000",
  "Ava invested $3,500",
  "Ethan earned $49,700",
  "Mia withdrew $27,000",
  "Benjamin invested $96,200",
  "Isabella earned $14,300",
  "Elijah withdrew $19,500",
  "Harper invested $10,000",
  "Alexander earned $21,400",
  "Amelia withdrew $83,800",
  "Henry invested $25,000",
];

const FloatingNotifications = () => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % notifications.length);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <div
        style={{
          position: "fixed",
          left: 20,
          bottom: 20,
          zIndex: 999999,
          background: "#111827",
          border: "1px solid rgba(56,97,251,0.3)",
          borderRadius: 14,
          padding: "14px 18px",
          display: "flex",
          alignItems: "center",
          gap: 12,
          minWidth: 300,
          boxShadow: "0 10px 35px rgba(0,0,0,0.45)",
          animation: "fadeSlide 0.4s ease",
        }}
      >
        <div
          style={{
            width: 10,
            height: 10,
            borderRadius: "50%",
            background: "#22c55e",
            boxShadow: "0 0 10px #22c55e",
            flexShrink: 0,
          }}
        />

        <div>
          <p
            style={{
              color: "#fff",
              margin: 0,
              fontSize: 14,
              fontWeight: 600,
              fontFamily: "Roboto, sans-serif",
            }}
          >
            {notifications[index]}
          </p>

          <span
            style={{
              color: "rgba(255,255,255,0.55)",
              fontSize: 11,
              fontFamily: "Roboto, sans-serif",
            }}
          >
            Just now
          </span>
        </div>
      </div>

      <style>{`
        @keyframes fadeSlide {
          from {
            opacity: 0;
            transform: translateY(20px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (max-width: 600px) {
          div[style*="position: fixed"] {
            left: 12px !important;
            right: 12px !important;
            min-width: unset !important;
            width: auto !important;
            bottom: 12px !important;
          }
        }
      `}</style>
    </>
  );
};

export default FloatingNotifications;