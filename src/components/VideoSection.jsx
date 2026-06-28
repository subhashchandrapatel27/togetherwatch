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
    screenSharing, remoteScreenStream, cssFs,
  },
  wrapRef
) {
  const rotCls = ["", "rot90", "rot180", "rot270"][rotation / 90] || "";
  const remoteHasCam =
    !!(remoteStream && remoteStream.getVideoTracks().length > 0);

  return (
    <div className="pcol">
      {/* Host: drop zone when no file loaded and not screen sharing */}
      {isHost && !hasFile && !screenSharing && (
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
          <div className="dz-actions" onClick={(e) => e.stopPropagation()}>
            <button
              className="btn btn-o btn-sm dz-btn"
              onClick={onLoadMovie}
            >
              {I.Load} Browse Files
            </button>
            <div className="dz-or">or</div>
            <button
              className="btn btn-p btn-sm dz-btn"
              onClick={ctrlProps.onStartScreenShare}
            >
              {I.ScreenShare} Share Screen
            </button>
          </div>
        </div>
      )}

      {/* Partner: waiting screen — hide when receiving screen share */}
      {!isHost && !hasFile && !remoteScreenStream && (
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
          cssFs ? "css-fs" : "",
        ]
          .filter(Boolean)
          .join(" ")}
        style={{ display: (hasFile || remoteScreenStream || screenSharing) ? "flex" : "none" }}
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

        {/* Received screen share — always in DOM so audio autoplay context is preserved;
            hidden via CSS when no stream is active */}
        <video
          id="screen-share-video"
          autoPlay
          playsInline
          className="screen-share-vid"
          style={{ display: remoteScreenStream ? undefined : "none" }}
        />

        {/* Host screen sharing active — show status overlay when no movie file */}
        {screenSharing && !hasFile && (
          <div className="screen-share-active">
            <div className="ssa-icon">🖥</div>
            <div className="ssa-title">Screen sharing active</div>
            <div className="ssa-sub">Your partner can see your screen</div>
            <button
              className="btn btn-d btn-sm"
              style={{ marginTop: ".75rem" }}
              onClick={ctrlProps.onStopScreenShare}
            >
              {I.ScreenShareOff} Stop Sharing
            </button>
          </div>
        )}

        {/* "You are sharing" badge shown to the sharer when movie is also loaded */}
        {screenSharing && hasFile && (
          <div className="sharing-badge">🖥 Sharing your screen</div>
        )}

        {/* Partner audio-unlock overlay — required by browser autoplay policy */}
        {!isHost && audioLocked && (
          <div className="audio-unlock" onClick={onStartWatching}>
            <div className="au-icon">▶</div>
            <div className="au-title">Tap to start watching</div>
            <div className="au-sub">Enables audio for movie and video chat</div>
          </div>
        )}

        {/* PiP camera overlays — show in fullscreen OR during any screen sharing */}
        <div className={`pip-wrap${(fullscreen || screenSharing || !!remoteScreenStream) ? " show" : ""}`}>
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
      {(hasFile || screenSharing || remoteScreenStream) && !fullscreen && (
        <div className="ctrl-bar-outer">
          <ControlsBar {...ctrlProps} />
        </div>
      )}
    </div>
  );
});

export default VideoSection;