import { forwardRef } from "react";
import ControlsBar from "./ControlsBar.jsx";
import PipTile from "./PipTile.jsx";
import StreamVideo from "./StreamVideo.jsx";
import { I } from "../icons/index.jsx";

/* VideoSection wraps the drop-zone / wait-screen / video player column */
const VideoSection = forwardRef(function VideoSection(
  {
    isHost, hasFile, fileName, dragOver, hostMovieLoaded,
    partner, pOnline, name,
    localStream, remoteStream, camOn, micOn,
    fullscreen, ctrlVisible, ssFlash, rotation,
    showSub, activeSub,
    ctrlProps,
    onDragOver, onDragLeave, onDrop, onClickDropzone, onLoadMovie,
    keepVisible, revealControls,
    audioLocked, onStartWatching,
  },
  wrapRef
) {
  const rotCls = ["", "rot90", "rot180", "rot270"][rotation / 90] || "";
  const remoteHasCam =
    !!(remoteStream && remoteStream.getVideoTracks().length > 0);

  return (
    <div className="pcol">
      {/* Host: drop zone when no file loaded */}
      {isHost && !hasFile && (
        <div
          className={`dropzone${dragOver ? " over" : ""}`}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          onClick={onClickDropzone}
        >
          <div className="dz-icon">🎬</div>
          <div className="dz-title">Load your movie</div>
          <div className="dz-sub">
            Drop a file or click to browse — MP4, MKV, WebM, AVI, MOV and more
            <br />
            Your partner will receive the stream automatically.
          </div>
          <button
            className="btn btn-o btn-sm dz-btn"
            onClick={(e) => { e.stopPropagation(); onLoadMovie(); }}
          >
            {I.Load} Browse Files
          </button>
        </div>
      )}

      {/* Partner: waiting screen */}
      {!isHost && !hasFile && (
        <div className="wait-screen">
          <div className="wait-icon">📡</div>
          <div className="wait-title">Waiting for host</div>
          <div className="wait-sub">
            {hostMovieLoaded
              ? "Connecting stream… hold tight."
              : "The host hasn't loaded a movie yet. Ask them to start!"}
          </div>
        </div>
      )}

      {/* Video wrapper */}
      <div
        ref={wrapRef}
        id="vwrap"
        className={[
          "vwrap",
          rotCls,
          fullscreen ? "is-fs" : "",
          ctrlVisible ? "ctrl-visible" : "",
        ]
          .filter(Boolean)
          .join(" ")}
        style={{ display: hasFile ? "flex" : "none" }}
        onMouseMove={fullscreen ? revealControls : undefined}
        onTouchStart={fullscreen ? revealControls : undefined}
        onClick={fullscreen ? revealControls : undefined}
      >
        {/* The movie element — populated by Room */}
        <video
          id="main-video"
          className="main-vid"
          playsInline
          onClick={(e) => {
            e.stopPropagation();
            if (ctrlProps.readOnly === false) ctrlProps.onTogglePlay();
          }}
        />

        {ssFlash && <div className="ss-flash" />}
        {showSub && activeSub && (
          <div className="sub-overlay">{activeSub}</div>
        )}

        {/* Partner audio-unlock overlay — required by browser autoplay policy */}
        {!isHost && audioLocked && (
          <div className="audio-unlock" onClick={onStartWatching}>
            <div className="au-icon">▶</div>
            <div className="au-title">Tap to start watching</div>
            <div className="au-sub">Enables audio for movie and video chat</div>
          </div>
        )}

        {/* PiP camera overlays */}
        <div className={`pip-wrap${fullscreen ? " show" : ""}`}>
          <PipTile
            stream={localStream}
            label={`${name} (you)`}
            muted={true}
            micMuted={!micOn}
            camOn={camOn}
          />
          <div className="pip-tile">
            {pOnline && remoteHasCam ? (
              <StreamVideo
                stream={remoteStream}
                muted={true}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            ) : (
              <div className="pip-ph">
                <span className="pip-ph-ic">
                  {pOnline ? "🎭" : "⏳"}
                </span>
                <span>{pOnline ? partner : "Waiting"}</span>
              </div>
            )}
            {pOnline && <div className="pip-lbl">{partner}</div>}
          </div>
        </div>

        {/* Fullscreen controls overlay */}
        <div
          className="fs-ctrl-wrap"
          onMouseEnter={keepVisible}
          onMouseLeave={fullscreen ? revealControls : undefined}
          onTouchStart={(e) => { e.stopPropagation(); keepVisible(); }}
        >
          <ControlsBar {...ctrlProps} />
        </div>
      </div>

      {/* Outer controls bar (non-fullscreen) */}
      {hasFile && !fullscreen && (
        <div className="ctrl-bar-outer">
          <ControlsBar {...ctrlProps} />
        </div>
      )}
    </div>
  );
});

export default VideoSection;