import { useRef, useEffect } from "react";
import { EMOJIS } from "../constants/config.js";

export default function EmojiPicker({ onSelect, onClose }) {
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onClose();
    };
    document.addEventListener("mousedown", handler);
    document.addEventListener("touchstart", handler);
    return () => {
      document.removeEventListener("mousedown", handler);
      document.removeEventListener("touchstart", handler);
    };
  }, [onClose]);

  return (
    <div className="emoji-panel" ref={ref}>
      {EMOJIS.map((e) => (
        <button key={e} onClick={() => onSelect(e)} title={e}>
          {e}
        </button>
      ))}
    </div>
  );
}