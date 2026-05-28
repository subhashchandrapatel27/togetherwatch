import { I } from "../icons/index.jsx";
import { fmt } from "../utils/format.js";
import CamTile from "./CamTile.jsx";
import StreamVideo from "./StreamVideo.jsx";

export default function CamPanel({
  name, partner, pOnline,
  localStream, remoteStream, remoteMovieStream, hostMovieLoaded,
  camOn, micOn, isHost, roomId,
  screenshots,
  onStartCam, onStopCam, onToggleMic, onScreenshot, onCopyCode,
  onDlScreenshot, onDelScreenshot, onClearScreenshots,
}) {
  const remoteHasCam =
    !!(remoteStream && remoteStream.getVideoTracks().length > 0);

  return (
    <div className="cam-panel">
      {/* Camera grid */}
      <div className="cam-grid">
        <CamTile
          stream={localStream}
          label={`${name} (you)`}
          muted={true}
          micMuted={!micOn}
          camOn={camOn}
        />
        <div className="cam-tile">
          {pOnline && remoteHasCam ? (
            <>
              <StreamVideo
                stream={remoteStream}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
              <div className="tile-lbl">{partner}</div>
            </>
          ) : (
            <div className="cam-ph">
              <span className="ph-ic">{pOnline ? "🎭" : "⏳"}</span>
              <span>{pOnline ? partner : "Waiting…"}</span>
            </div>
          )}
        </div>
      </div>

      {/* Camera controls */}
      <div className="cam-ctrls">
        <button
          className={`btn btn-sm ${camOn ? "btn-d" : "btn-o"}`}
          style={{ flex: 1 }}
          onClick={camOn ? onStopCam : onStartCam}
        >
          {camOn ? <>{I.CamOff} Stop Camera</> : <>{I.Cam} Start Camera</>}
        </button>
        <button
          className={`ic-btn${!micOn ? " active" : ""}`}
          onClick={onToggleMic}
          title="Toggle mic"
        >
          {micOn ? I.Mic : I.MicOff}
        </button>
        <button
          className="ic-btn ic-btn-ss"
          onClick={onScreenshot}
          title="Screenshot"
        >
          {I.SS}
        </button>
      </div>

      {/* Room status */}
      <div className="info-box">
        <div className="info-lbl">Room status</div>
        <div className="info-row">
          <span className={`dot ${pOnline ? "dot-ok" : "dot-warn"}`} />
          {pOnline ? "Partner connected" : "No partner yet"}
        </div>
        {isHost && (
          <div className="info-row">
            <span className={`dot ${remoteMovieStream ? "dot-ok" : "dot-warn"}`} />
            {remoteMovieStream
              ? "Streaming movie to partner"
              : "No movie loaded"}
          </div>
        )}
        {!isHost && (
          <div className="info-row">
            <span
              className={`dot ${
                remoteMovieStream ? "dot-ok" : "dot-warn"
              }`}
            />
            {remoteMovieStream
              ? "Receiving stream ✓"
              : hostMovieLoaded
              ? "Connecting stream…"
              : "Waiting for host's movie"}
          </div>
        )}
        <div className="info-row">
          Code: <span className="info-code">{roomId}</span>
        </div>
        <button
          className="btn btn-o btn-sm"
          style={{ marginTop: ".3rem" }}
          onClick={onCopyCode}
        >
          {I.Link} Copy code
        </button>
      </div>

      {/* Screenshots */}
      <div className="ss-section">
        <div className="ss-head">
          <span className="info-lbl" style={{ margin: 0 }}>
            📸 Screenshots ({screenshots.length})
          </span>
          {screenshots.length > 0 && (
            <button
              className="btn btn-o btn-sm"
              style={{ fontSize: ".6rem", padding: ".18rem .5rem" }}
              onClick={onClearScreenshots}
            >
              Clear all
            </button>
          )}
        </div>
        {screenshots.length === 0 ? (
          <div className="ss-empty">
            No screenshots yet — click 📸 during playback
          </div>
        ) : (
          <div className="ss-grid">
            {screenshots.map((ss) => (
              <div className="ss-thumb" key={ss.id}>
                <img src={ss.dataUrl} alt="" />
                <div className="ss-time">{fmt(ss.time)}</div>
                {ss.fromPartner && <div className="ss-from-partner">📡 partner</div>}
                <div className="ss-actions">
                  <button
                    className="ic-btn"
                    style={{ width: 28, height: 28 }}
                    onClick={() => onDlScreenshot(ss)}
                  >
                    {I.Dl}
                  </button>
                  <button
                    className="ic-btn"
                    style={{ width: 28, height: 28, color: "var(--err)" }}
                    onClick={() => onDelScreenshot(ss.id)}
                  >
                    {I.Trash}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}