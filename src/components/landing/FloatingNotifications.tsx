import { useEffect, useState } from "react";

const notifications = [
  "Michael withdrew $40,000",
  "David invested $50,000",
  "Sophia earned $12,400",
  "Daniel withdrew $98,200",
  "Emma invested $450,000",
  "James earned $49,500",
  "Olivia withdrew $122,000",
  "Noah invested $157,800",
  "Charlotte earned $18,600",
  "Lucas withdrew $211,000",
  "Ava invested $300,500",
  "Ethan earned $409,700",
  "Mia withdrew $27,000",
  "Benjamin invested $96,200",
  "Isabella earned $14,300",
  "Elijah withdrew $1,119,500",
  "Harper invested $10,000",
  "Alexander earned $21,400",
  "Amelia withdrew $83,800",
  "Henry invested $25,000",
];

const FloatingNotifications = () => {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      // Fade out first
      setVisible(false);

      // After fade-out, switch notification and fade back in
      setTimeout(() => {
        setIndex((prev) => (prev + 1) % notifications.length);
        setVisible(true);
      }, 400); // matches fade-out duration
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const text = notifications[index];
  const isWithdraw = text.toLowerCase().includes("withdrew");
  const isEarned = text.toLowerCase().includes("earned");
  const dotColor = isWithdraw ? "#ef4444" : isEarned ? "#f59e0b" : "#22c55e";

  return (
    <>
      <div
        style={{
          position: "fixed",
          left: 16,
          bottom: 20,
          zIndex: 999999,
          background: "#ffffff",
          border: "1px solid rgba(0,0,0,0.08)",
          borderRadius: 14,
          padding: "12px 16px",
          display: "flex",
          alignItems: "center",
          gap: 12,
          maxWidth: 300,         // cap width — won't stretch full viewport
          width: "calc(100vw - 32px)", // fills mobile but capped at 300px via maxWidth
          boxShadow: "0 4px 24px rgba(0,0,0,0.10)",
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(8px)",
          transition: "opacity 0.4s ease, transform 0.4s ease",
        }}
      >
        <div
          style={{
            width: 9,
            height: 9,
            borderRadius: "50%",
            background: dotColor,
            boxShadow: `0 0 8px ${dotColor}`,
            flexShrink: 0,
          }}
        />
        <div style={{ overflow: "hidden" }}>
          <p
            style={{
              color: "#111827",
              margin: 0,
              fontSize: 13,
              fontWeight: 600,
              fontFamily: "'DM Sans', sans-serif",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {text}
          </p>
          <span
            style={{
              color: "rgba(0,0,0,0.4)",
              fontSize: 11,
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            Just now
          </span>
        </div>
      </div>
    </>
  );
};

export default FloatingNotifications;