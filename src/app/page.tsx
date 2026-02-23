export default function Home() {
  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        margin: 0,
        padding: 0,
        overflow: "hidden",
        background: "#000",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* Mobile frame */}
      <div
        style={{
          width: 390,
          height: 844,
          borderRadius: 44,
          overflow: "hidden",
          boxShadow:
            "0 0 0 11px #1a1a1a, 0 0 0 13px #333, 0 30px 80px rgba(0,0,0,0.8)",
          position: "relative",
          background: "#000",
          flexShrink: 0,
        }}
      >
        {/* Notch */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: "50%",
            transform: "translateX(-50%)",
            width: 126,
            height: 37,
            background: "#1a1a1a",
            borderBottomLeftRadius: 20,
            borderBottomRightRadius: 20,
            zIndex: 10,
          }}
        />
        <iframe
          src="http://localhost:8081"
          style={{
            width: "100%",
            height: "100%",
            border: "none",
            display: "block",
            background: "#f8fafc",
          }}
          title="ForgeAI Builder"
        />
      </div>
    </div>
  );
}
