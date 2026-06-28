import { useRef, useEffect } from "react";

export default function StreamVideo({ stream, muted = false, volume = 1, className = "", style = {} }) {
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

  useEffect(() => {
    if (vidRef.current && !muted) vidRef.current.volume = Math.max(0, Math.min(1, volume));
  }, [volume, muted]);

  return (
    <video ref={vidRef} autoPlay muted={muted} playsInline className={className} style={style} />
  );
}