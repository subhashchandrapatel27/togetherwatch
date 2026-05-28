import { useState } from "react";
import { I } from "../icons/index.jsx";

export default function Header({
  roomId, partner, pOnline, isHost,
  onCopyCode, onLeave, onTogglePanel, panelOpen,
  theme, onToggleTheme,
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);

  return (
    <header className="hdr">
      <div className="hdr-logo">🎬 Together Watch</div>

      {/* Desktop: centre info */}
      <div className="hdr-mid">
        <div className="room-code" onClick={onCopyCode} title="Click to copy">
          {I.Link} {roomId} {I.Copy}
        </div>
        {pOnline
          ? <span className="badge badge-ok"><span className="dot dot-ok"/>{partner}</span>
          : <span className="badge badge-warn"><span className="dot dot-warn"/>Waiting</span>}
        <span className="badge badge-role">
          {isHost ? "🎬 Host" : "👁 Watch"}
        </span>
      </div>

      {/* Desktop: right actions */}
      <div className="hdr-right">
        <button className="ic-btn hdr-theme-btn" onClick={onToggleTheme} title={theme === "dark" ? "Light mode" : "Dark mode"}>
          {theme === "dark" ? I.Sun : I.Moon}
        </button>
        <button className="btn btn-o btn-sm hdr-share-btn" onClick={onCopyCode}>{I.Link} Share</button>
        <button className="btn btn-d btn-sm hdr-leave-btn" onClick={onLeave}>Leave</button>

        {/* Tablet (600–900px): directly toggle side panel */}
        <button
          className="ic-btn hdr-cams-toggle"
          onClick={onTogglePanel}
          title={panelOpen ? "Hide Cams & Chat" : "Show Cams & Chat"}
          aria-label="Toggle Cams panel"
        >
          {panelOpen ? I.Close : I.Menu}
        </button>

        {/* Phone (≤600px): opens header dropdown */}
        <button
          className="ic-btn hdr-panel-toggle"
          onClick={() => setMenuOpen(m => !m)}
          aria-label="Menu"
        >
          {menuOpen ? I.Close : I.Menu}
        </button>
      </div>

      {/* Mobile dropdown menu */}
      {menuOpen && (
        <div className="hdr-mobile-menu">
          {/* Room info */}
          <div className="hmm-info">
            <div
              className="room-code hmm-code"
              onClick={() => { onCopyCode(); closeMenu(); }}
            >
              {I.Link} {roomId} — tap to copy
            </div>
            <div className="hmm-badges">
              {pOnline
                ? <span className="badge badge-ok"><span className="dot dot-ok"/>{partner}</span>
                : <span className="badge badge-warn"><span className="dot dot-warn"/>Waiting for partner</span>}
              <span className="badge badge-role">
                {isHost ? "🎬 Host" : "👁 Watching"}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="hmm-actions">
            <button
              className="btn btn-o btn-sm hmm-btn"
              onClick={() => { onTogglePanel(); closeMenu(); }}
            >
              {panelOpen ? "✕ Close Cams" : "📷 Cams & Chat"}
            </button>
            <button
              className="btn btn-o btn-sm hmm-btn"
              onClick={() => { onCopyCode(); closeMenu(); }}
            >
              {I.Link} Share Code
            </button>
            <button
              className="ic-btn"
              onClick={() => { onToggleTheme(); closeMenu(); }}
              title={theme === "dark" ? "Light mode" : "Dark mode"}
            >
              {theme === "dark" ? I.Sun : I.Moon}
            </button>
            <button
              className="btn btn-d btn-sm hmm-btn"
              onClick={() => { closeMenu(); onLeave(); }}
            >
              Leave
            </button>
          </div>
        </div>
      )}
    </header>
  );
}