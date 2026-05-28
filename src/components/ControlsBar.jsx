import { I } from "../icons/index.jsx";
import { fmt } from "../utils/format.js";

export default function ControlsBar({
  playing, curTime, duration, volume, muted, speed,
  showSub, fullscreen, hasFile, fileName, pct, vpct, readOnly,
  onTogglePlay, onSeek, onSeekBy, onVolChange, onToggleMute,
  onSpeed, onToggleSub, onLoadSub, onRotate, onScreenshot,
  onToggleFs, onLoadMovie, onActivity,
}) {
  const ro = readOnly;

  /* ── Partner view: no seek bar, no transport ── */
  if (ro) {
    return (
      <div className="ctrl-row ctrl-row-partner">
        <div className="ctrl-l">
          <div className="vol-wrap">
            <button className="ic-btn" onClick={onToggleMute} title={muted ? "Unmute" : "Mute"}>
              {muted || volume === 0 ? I.VolMute : I.VolHi}
            </button>
            <input
              type="range" className="vol" min={0} max={1} step={0.01}
              value={muted ? 0 : volume} style={{ "--vpct": `${vpct}%` }}
              onChange={(e) => onVolChange(parseFloat(e.target.value))}
            />
          </div>
        </div>
        <div className="ctrl-r" style={{ marginLeft: "auto" }}>
          <button className={`ic-btn${showSub ? " active" : ""}`} onClick={onToggleSub} title="Toggle subtitles">{I.Sub}</button>
          <button className="ic-btn btn-rotate" onClick={onRotate} title="Rotate video">{I.Rot}</button>
          <button className="ic-btn ic-btn-ss" onClick={onScreenshot} title="Screenshot">{I.SS}</button>
          <button className="ic-btn" onClick={onToggleFs} title={fullscreen ? "Exit fullscreen" : "Fullscreen"}>
            {fullscreen ? I.FsExit : I.Fs}
          </button>
        </div>
      </div>
    );
  }

  /* ── Host view: full controls ── */
  return (
    <>
      {/* Seek bar */}
      <div className="seek-row">
        <input
          type="range"
          className="seek"
          min={0} max={duration || 1} step={0.1} value={curTime}
          style={{ "--pct": `${pct}%` }}
          onMouseDown={onActivity}
          onTouchStart={onActivity}
          onChange={(e) => onSeek(parseFloat(e.target.value))}
        />
        <span className="tl">{fmt(curTime)} / {fmt(duration)}</span>
      </div>

      {/* Controls row */}
      <div className="ctrl-row">
        {/* Left: volume */}
        <div className="ctrl-l">
          <div className="vol-wrap">
            <button className="ic-btn" onClick={onToggleMute} title={muted ? "Unmute" : "Mute"}>
              {muted || volume === 0 ? I.VolMute : I.VolHi}
            </button>
            <input
              type="range"
              className="vol"
              min={0} max={1} step={0.01}
              value={muted ? 0 : volume}
              style={{ "--vpct": `${vpct}%` }}
              onMouseDown={onActivity}
              onTouchStart={onActivity}
              onChange={(e) => onVolChange(parseFloat(e.target.value))}
            />
          </div>
        </div>

        {/* Centre: transport */}
        <div className="ctrl-c">
          <button className="ic-btn skip10" onClick={() => onSeekBy(-10)} title="-10s">{I.Bwd}</button>
          <button className="ic-btn" onClick={() => onSeekBy(-5)} title="-5s" style={{ fontSize: ".6rem" }}>-5</button>
          <button className="ic-btn play-btn" onClick={onTogglePlay}>
            {playing ? I.Pause : I.Play}
          </button>
          <button className="ic-btn" onClick={() => onSeekBy(5)} title="+5s" style={{ fontSize: ".6rem" }}>+5</button>
          <button className="ic-btn skip10" onClick={() => onSeekBy(10)} title="+10s">{I.Fwd}</button>
        </div>

        {/* Right: extras */}
        <div className="ctrl-r">
          <select
            className="spd"
            value={speed}
            onFocus={onActivity}
            onChange={(e) => onSpeed(parseFloat(e.target.value))}
            title="Playback speed"
          >
            {[0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2].map((s) => (
              <option key={s} value={s}>{s}×</option>
            ))}
          </select>
          <button className={`ic-btn${showSub ? " active" : ""}`} onClick={onToggleSub} title="Toggle subtitles">{I.Sub}</button>
          <button className="ic-btn" onClick={onLoadSub} title="Load subtitle file"
            style={{ fontSize: ".58rem", letterSpacing: "0", fontWeight: "bold" }}>CC+</button>
          <button className="ic-btn btn-rotate" onClick={onRotate} title="Rotate video">{I.Rot}</button>
          <button className="ic-btn ic-btn-ss" onClick={onScreenshot} title="Screenshot">{I.SS}</button>
          <button className="ic-btn" onClick={onToggleFs} title={fullscreen ? "Exit fullscreen" : "Fullscreen"}>
            {fullscreen ? I.FsExit : I.Fs}
          </button>
          <button className="ic-btn" onClick={onLoadMovie} title="Load movie">{I.Load}</button>
        </div>
      </div>

      {fileName && <div className="fname">🎞 {fileName}</div>}
    </>
  );
}