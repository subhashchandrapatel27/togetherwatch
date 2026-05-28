import { useState } from "react";
import { uid } from "../utils/format.js";
import { SOCKET_URL } from "../constants/config.js";
import { useTheme } from "../hooks/useTheme.js";
import { I } from "../icons/index.jsx";

export default function Landing({ onEnter }) {
  const [theme, toggleTheme] = useTheme();
  const [name,    setName]    = useState("");
  const [roomId,  setRoomId]  = useState("");
  const [mode,    setMode]    = useState("create");
  const [checking, setChecking] = useState(false);
  const [roomErr,  setRoomErr]  = useState("");

  const go = async () => {
    const n = name.trim();
    const r = mode === "create" ? uid() : roomId.trim().toUpperCase();

    if (!n) return setRoomErr("Please enter your name.");
    if (mode === "join" && !r) return setRoomErr("Please enter a room code.");

    setRoomErr("");

    if (mode === "join") {
      setChecking(true);
      try {
        const res  = await fetch(`${SOCKET_URL}/room/${r}`);
        const data = await res.json();
        if (!data.exists) {
          setRoomErr("Room not found. Check the code and try again.");
          setChecking(false);
          return;
        }
        if (data.full) {
          setRoomErr("Room is full (max 2 users). Try a different code.");
          setChecking(false);
          return;
        }
      } catch {
        setRoomErr("Cannot reach the server. Make sure it is running.");
        setChecking(false);
        return;
      }
      setChecking(false);
    }

    onEnter({ name: n, roomId: r, isHost: mode === "create" });
  };

  const handleKey = (e) => e.key === "Enter" && go();

  return (
    <div className="land">
      <button className="ic-btn land-theme-btn" onClick={toggleTheme} title={theme === "dark" ? "Light mode" : "Dark mode"}>
        {theme === "dark" ? I.Sun : I.Moon}
      </button>
      <div className="land-logo">
        <div className="land-icon">🎬</div>
        <div className="land-title">Together Watch</div>
        <div className="land-sub">Cinema for two · anywhere</div>
      </div>

      <div className="card">
        <div className="card-h">Create or join a room</div>

        <div>
          <div className="lbl">Your name</div>
          <input
            className="inp"
            placeholder="e.g. Jordan"
            value={name}
            maxLength={22}
            onChange={(e) => { setName(e.target.value); setRoomErr(""); }}
            onKeyDown={handleKey}
          />
        </div>

        <div className="tabs2">
          <button
            className={`tab2 ${mode === "create" ? "on" : ""}`}
            onClick={() => { setMode("create"); setRoomErr(""); }}
          >
            🎬 Create Room (Host)
          </button>
          <button
            className={`tab2 ${mode === "join" ? "on" : ""}`}
            onClick={() => { setMode("join"); setRoomErr(""); }}
          >
            👁 Join Room (Watch)
          </button>
        </div>

        {mode === "join" && (
          <div>
            <div className="lbl">Room code</div>
            <input
              className={`inp${roomErr ? " inp-err" : ""}`}
              placeholder="e.g. AB12CD"
              value={roomId}
              maxLength={8}
              onChange={(e) => { setRoomId(e.target.value.toUpperCase()); setRoomErr(""); }}
              onKeyDown={handleKey}
            />
          </div>
        )}

        {roomErr && <div className="land-err">{roomErr}</div>}

        <button className="btn btn-p" onClick={go} disabled={checking}>
          {checking
            ? "⏳ Checking room…"
            : mode === "create"
            ? "✨ Create Room & Host"
            : "→ Join & Watch"}
        </button>

        <div className="divdr">how it works</div>
        <div className="tip">
          {mode === "create"
            ? "You are the host. Load a movie and it streams live to your partner."
            : "Enter the 6-letter code your host shared. The room must already exist."}
        </div>
      </div>
    </div>
  );
}