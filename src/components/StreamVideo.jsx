import { useRef, useEffect } from "react";

export default function StreamVideo({ stream, muted = false, volume = 1, className = "", style = {} }) {
  const vidRef = useRef(null);

  useEffect(() => {
    const vid = vidRef.current;
    if (!vid) return;
    if (stream) {
      vid.srcObject = stream;
      vid.muted = muted; // set property directly — JSX muted attr is unreliable in React
      vid.play().catch(() => {
        if (!muted) {
          // Browser blocked audio autoplay — play muted first, then unmute
          vid.muted = true;
          vid.play().then(() => { vid.muted = false; }).catch(() => {});
        }
      });
    } else {
      vid.srcObject = null;
    }
  }, [stream]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const vid = vidRef.current;
    if (!vid) return;
    vid.muted = muted;
    if (!muted) vid.volume = Math.max(0, Math.min(1, volume));
  }, [volume, muted]);

  return (
    <video ref={vidRef} autoPlay muted={muted} playsInline className={className} style={style} />
  );
}