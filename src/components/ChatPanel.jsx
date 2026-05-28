import { useRef, useState } from "react";
import { I } from "../icons/index.jsx";
import EmojiPicker from "./EmojiPicker.jsx";

export default function ChatPanel({ msgs, name, onSend }) {
  const [chatVal,   setChatVal]   = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const chatInputRef = useRef(null);
  const chatEndRef   = useRef(null);

  /* Auto-scroll when messages arrive */
  const scrollToBottom = () =>
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });

  const send = () => {
    const text = chatVal.trim();
    if (!text) return;
    onSend(text);
    setChatVal("");
  };

  return (
    <div className="chat-panel">
      <div className="msgs" ref={(el) => { if (el) scrollToBottom(); }}>
        {msgs.length === 0 && (
          <div className="sys-msg">No messages yet. Say hi! 👋</div>
        )}
        {msgs.map((m) =>
          m.type === "sys" ? (
            <div key={m.id} className="sys-msg">{m.text}</div>
          ) : (
            <div key={m.id} className={`msg ${m.who}`}>
              <div className="msg-who">{m.name}</div>
              <div className="bubble">{m.text}</div>
            </div>
          )
        )}
        <div ref={chatEndRef} />
      </div>

      <div className="chat-inp-row">
        <textarea
          ref={chatInputRef}
          className="chat-inp"
          rows={1}
          placeholder="Send a message…"
          value={chatVal}
          onChange={(e) => setChatVal(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send();
            }
          }}
        />
        <div className="emoji-wrap">
          <button
            className="emoji-trigger"
            title="Emoji"
            onClick={() => setShowEmoji((v) => !v)}
          >
            😊
          </button>
          {showEmoji && (
            <EmojiPicker
              onSelect={(emoji) => {
                setChatVal((v) => v + emoji);
                setShowEmoji(false);
                chatInputRef.current?.focus();
              }}
              onClose={() => setShowEmoji(false)}
            />
          )}
        </div>
        <button
          className="ic-btn"
          style={{
            background: "linear-gradient(135deg,var(--acc),var(--acc2))",
            border: "none",
            color: "#fff",
          }}
          onClick={send}
        >
          {I.Send}
        </button>
      </div>
    </div>
  );
}