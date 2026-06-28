import { useRef, useEffect } from "react";

export default function PipTile({ stream, label, muted, micMuted, camOn }) {
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
    <div className="pip-tile">
      {camOn ? (
        <video ref={vidRef} autoPlay muted={muted} playsInline style={{ transform: "none" }} />
      ) : (
        <div className="pip-ph">
          <span className="pip-ph-ic">🙈</span>
          <span>Cam off</span>
        </div>
      )}
      <div className="pip-lbl">{label}</div>
      {micMuted && <div className="pip-muted">🔇</div>}
    </div>
  );
}