import { useRef, useEffect } from "react";

export default function CamTile({ stream, label, muted, micMuted, camOn }) {
  const vidRef = useRef(null);

  useEffect(() => {
    const vid = vidRef.current;
    if (!vid) return;
    if (camOn && stream) {
      vid.srcObject = stream;
      vid.play().catch(() => {});
    } else {
      vid.srcObject = null;
    }
  }, [camOn, stream]);

  return (
    <div className="cam-tile">
      <video
        ref={vidRef}
        autoPlay
        muted={muted}
        playsInline
        style={{
          width: "100%", height: "100%", objectFit: "cover",
          display: camOn ? "block" : "none", transform: "scaleX(-1)",
        }}
      />
      {!camOn && (
        <div className="cam-ph">
          <span className="ph-ic">🙈</span>
          <span>Camera off</span>
        </div>
      )}
      <div className="tile-lbl">{label}</div>
      {micMuted && <div className="tile-muted">🔇</div>}
    </div>
  );
}