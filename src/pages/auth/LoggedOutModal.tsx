import React, { CSSProperties } from "react";

interface LoggedOutModalProps {
  open: boolean;
  onConfirm: () => void;
}

function LoggedOutModal({ open, onConfirm }: LoggedOutModalProps) {
  if (!open) return null;

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <div style={styles.icon}>⚠️</div>
        <h2>You have been logged out</h2>
        <p>Your session is no longer valid. Please sign in again.</p>

        <button style={styles.button} onClick={onConfirm}>
          OK
        </button>
      </div>
    </div>
  );
}

const styles: Record<string, CSSProperties> = {
  overlay: {
    position: "fixed" as const,
    inset: 0,
    backgroundColor: "rgba(0,0,0,0.6)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 9999,
  },
  modal: {
    background: "#111",
    color: "#fff",
    padding: "2rem",
    borderRadius: "12px",
    width: "90%",
    maxWidth: "400px",
    textAlign: "center" as const,
  },
  icon: {
    fontSize: "4rem",
    marginBottom: "1rem",
  },
  button: {
    marginTop: "1.5rem",
    padding: "0.7rem 1.5rem",
    fontSize: "1rem",
    borderRadius: "8px",
    border: "none",
    cursor: "pointer",
  },
};

export default LoggedOutModal;