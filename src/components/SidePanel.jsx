import { useState } from "react";
import CamPanel from "./CamPanel.jsx";
import ChatPanel from "./ChatPanel.jsx";

export default function SidePanel({ panelOpen, msgs, name, onSendChat, camPanelProps }) {
  const [tab, setTab] = useState("cam");

  return (
    <div className={`side${panelOpen ? " panel-open" : ""}`}>
      <div className="stabs">
        <button
          className={`stab${tab === "cam" ? " on" : ""}`}
          onClick={() => setTab("cam")}
        >
          📹 Cams
        </button>
        <button
          className={`stab${tab === "chat" ? " on" : ""}`}
          onClick={() => setTab("chat")}
        >
          💬 Chat
        </button>
      </div>

      {tab === "cam" && <CamPanel {...camPanelProps} />}
      {tab === "chat" && (
        <ChatPanel msgs={msgs} name={name} onSend={onSendChat} />
      )}
    </div>
  );
}