import { useRef, useEffect } from "react";

export default function StreamVideo({ stream, muted = false, className = "", style = {} }) {
  const vidRef = useRef(null);

  useEffect(() => {
    const vid = vidRef.current;
    if (!vid) return;
    if (stream) {
      vid.srcObject = stream;
      vid.play().catch(() => {});
    } else {
      vid.srcObject = null;
    }
  }, [stream]);

  return (
    <video
      ref={vidRef}
      autoPlay
      muted={muted}
      playsInline
      className={className}
      style={style}
    />
  );
}