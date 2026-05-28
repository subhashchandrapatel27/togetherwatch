import { useState, useRef, useEffect, useCallback } from "react";
import { ICE_SERVERS } from "../constants/config.js";
import { fmt, parseSRT } from "../utils/format.js";
import { I } from "../icons/index.jsx";
import { useSocket } from "../hooks/useSocket.js";
import { useTheme } from "../hooks/useTheme.js";
import Header from "./Header.jsx";
import VideoSection from "./VideoSection.jsx";
import SidePanel from "./SidePanel.jsx";

export default function Room({ session, onLeave }) {
  const { name, roomId, isHost } = session;
  const [theme, toggleTheme] = useTheme();

  /* ── DOM refs ── */
  const videoRef      = useRef(null);
  const localVidRef   = useRef(null);
  const fileInputRef  = useRef(null);
  const subInputRef   = useRef(null);
  const wrapRef       = useRef(null);
  const hideTimer     = useRef(null);

  /* ── Stream refs ── */
  const localStream       = useRef(null);
  const movieStreamRef    = useRef(null);
  const movieStreamIdRef  = useRef(null);
  const blobUrlRef        = useRef(null);
  const canvasRef         = useRef(document.createElement("canvas")); // screenshot canvas
  const streamCanvasRef   = useRef(document.createElement("canvas")); // color-accurate capture
  const streamRafRef          = useRef(null);
  const remoteMovieStreamRef  = useRef(null); // mirror of state for use in event handlers
  /* ── WebRTC refs ── */
  const pcRef              = useRef(null);
  const peerSocketIdRef    = useRef(null);
  const isInitiatorRef     = useRef(false);
  const pendingIceRef      = useRef([]);
  const receivedStreamsRef = useRef(new Map());
  const remoteMovieIdRef   = useRef(null);
  const buildPCRef         = useRef(null);

  /* ── Player state ── */
  const [hasFile,      setHasFile]      = useState(false);
  const [fileName,     setFileName]     = useState("");
  const [playing,      setPlaying]      = useState(false);
  const [curTime,      setCurTime]      = useState(0);
  const [duration,     setDuration]     = useState(0);
  const [volume,       setVolume]       = useState(1);
  const [muted,        setMuted]        = useState(false);
  const [speed,        setSpeed]        = useState(1);
  const [rotation,     setRotation]     = useState(0);
  const [fullscreen,   setFullscreen]   = useState(false);
  const [ctrlVisible,  setCtrlVisible]  = useState(true);
  const [subtitles,    setSubtitles]    = useState([]);
  const [activeSub,    setActiveSub]    = useState("");
  const [showSub,      setShowSub]      = useState(true);
  const [dragOver,     setDragOver]     = useState(false);
  const [ssFlash,      setSsFlash]      = useState(false);

  /* ── Camera state ── */
  const [camOn, setCamOn] = useState(false);
  const [micOn, setMicOn] = useState(true);

  /* ── Screenshots ── */
  const [screenshots, setScreenshots] = useState([]);
  const [ssToast,     setSsToast]     = useState(false);

  /* ── Room / partner state ── */
  const [partner,           setPartner]           = useState(null);
  const [pOnline,           setPOnline]           = useState(false);
  const [msgs,              setMsgs]              = useState([]);
  const [syncMsg,           setSyncMsg]           = useState("");
  const [copyMsg,           setCopyMsg]           = useState(false);
  const [remoteStream,      setRemoteStream]      = useState(null);
  const [remoteMovieStream, setRemoteMovieStream] = useState(null);
  const [hostMovieLoaded,   setHostMovieLoaded]   = useState(false);
  const [panelOpen,         setPanelOpen]         = useState(false);
  const [audioLocked,       setAudioLocked]       = useState(false);

  /* ── Internal ── */
  const ignoreRef  = useRef(false);
  const hasFileRef = useRef(false);
  useEffect(() => { hasFileRef.current = hasFile; }, [hasFile]);

  /* ── Bind video ref to DOM element created by VideoSection ── */
  useEffect(() => {
    const el = document.getElementById("main-video");
    if (el) videoRef.current = el;
  });

  /* ── html2canvas CDN ── */
  useEffect(() => {
    if (window.html2canvas) return;
    const s = document.createElement("script");
    s.src = "https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js";
    s.async = true;
    document.head.appendChild(s);
  }, []);

  /* ─────────────────────────────────────────────
     SOCKET
  ───────────────────────────────────────────── */
  const [emit, socketHandlerRef] = useSocket(roomId, name, isHost);

  /* ─────────────────────────────────────────────
     WEBRTC
  ───────────────────────────────────────────── */
  const closePeerConnection = useCallback(() => {
    if (pcRef.current) { pcRef.current.close(); pcRef.current = null; }
    pendingIceRef.current = [];
    setRemoteStream(null);
    setRemoteMovieStream(null);
  }, []);

  const buildPC = useCallback(async (peerSocketId, isInitiator, offerSdp = null) => {
    closePeerConnection();
    isInitiatorRef.current = isInitiator;

    const pc = new RTCPeerConnection(ICE_SERVERS);
    pcRef.current = pc;

    if (localStream.current) {
      localStream.current.getTracks().forEach(t => pc.addTrack(t, localStream.current));
    }
    if (isHost && movieStreamRef.current) {
      movieStreamRef.current.getTracks()
        .filter(t => t.readyState === "live")
        .forEach(t => pc.addTrack(t, movieStreamRef.current));
    }

    pc.ontrack = ({ streams }) => {
      if (!streams?.length) return;
      const stream = streams[0];
      receivedStreamsRef.current.set(stream.id, stream);
      if (isHost) {
        setRemoteStream(stream);
      } else {
        if (remoteMovieIdRef.current && stream.id === remoteMovieIdRef.current) {
          setRemoteMovieStream(stream);
        } else {
          setRemoteStream(stream);
        }
      }
    };

    pc.onicecandidate = ({ candidate }) => {
      if (candidate) emit("ice", { candidate: candidate.toJSON(), to: peerSocketId });
    };

    /* Renegotiation — fires when tracks are added/removed on existing connection */
    pc.onnegotiationneeded = async () => {
      try {
        if (pc.signalingState !== "stable" || !pc.remoteDescription) return;
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        emit("offer", { sdp: pc.localDescription, to: peerSocketIdRef.current });
      } catch (e) {}
    };

    pc.onconnectionstatechange = () => {
      if (pc.connectionState === "connected") {
        pc.getSenders().forEach(sender => {
          if (sender.track?.kind !== "video") return;
          const params = sender.getParameters();
          if (!params.encodings?.length) params.encodings = [{}];
          params.encodings[0].maxBitrate = 8_000_000;
          sender.setParameters(params).catch(() => {});
        });
      }
      if (pc.connectionState === "failed") pc.restartIce();
    };

    if (isInitiator) {
      const offer = await pc.createOffer({ offerToReceiveAudio: true, offerToReceiveVideo: true });
      await pc.setLocalDescription(offer);
      emit("offer", { sdp: pc.localDescription, to: peerSocketId });
    } else if (offerSdp) {
      await pc.setRemoteDescription(new RTCSessionDescription(offerSdp));
      for (const c of pendingIceRef.current) {
        await pc.addIceCandidate(new RTCIceCandidate(c)).catch(() => {});
      }
      pendingIceRef.current = [];
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      emit("answer", { sdp: pc.localDescription, to: peerSocketId });
    }
  }, [isHost, closePeerConnection, emit]);

  buildPCRef.current = buildPC;

  /* ─────────────────────────────────────────────
     MOVIE CAPTURE (host only)
     Canvas intermediate preserves sRGB colour;
     audio tracks pulled from video element.
  ───────────────────────────────────────────── */
  const setupMovieCapture = useCallback((videoEl) => {
    if (!isHost) return;

    if (streamRafRef.current) {
      cancelAnimationFrame(streamRafRef.current);
      streamRafRef.current = null;
    }
    if (movieStreamRef.current) {
      movieStreamRef.current.getTracks().forEach(t => t.stop());
    }

    const canvas = streamCanvasRef.current;

    const draw = () => {
      if (videoEl.readyState >= 2) {
        const w = videoEl.videoWidth  || 1280;
        const h = videoEl.videoHeight || 720;
        if (canvas.width !== w || canvas.height !== h) {
          canvas.width  = w;
          canvas.height = h;
        }
        canvas.getContext("2d").drawImage(videoEl, 0, 0, w, h);
      }
      streamRafRef.current = requestAnimationFrame(draw);
    };
    draw();

    const captureFn = canvas.captureStream?.bind(canvas) || canvas.mozCaptureStream?.bind(canvas);
    if (!captureFn) {
      cancelAnimationFrame(streamRafRef.current);
      streamRafRef.current = null;
      addSys("⚠️ captureStream not supported — partner needs their own copy");
      return;
    }

    // Video: color-accurate sRGB pipeline through canvas
    const canvasStream = captureFn(60);

    // Audio: pull directly from the video element — far more reliable than Web Audio API.
    // captureStream() on a <video> includes audio tracks when the source has audio.
    const elCapture = videoEl.captureStream?.bind(videoEl) || videoEl.mozCaptureStream?.bind(videoEl);
    const audioTracks = elCapture ? elCapture().getAudioTracks() : [];

    const stream = new MediaStream([
      ...canvasStream.getVideoTracks(),
      ...audioTracks,
    ]);

    movieStreamRef.current = stream;
    movieStreamIdRef.current = stream.id;

    emit("movie-loaded", { movieStreamId: stream.id, fileName: videoEl.dataset.fname || "" });

    if (peerSocketIdRef.current) {
      buildPCRef.current?.(peerSocketIdRef.current, isInitiatorRef.current);
    }
  }, [isHost, emit]);

  /* ─────────────────────────────────────────────
     SOCKET EVENT HANDLER
  ───────────────────────────────────────────── */
  socketHandlerRef.current = async (type, payload) => {
    const v = videoRef.current;

    switch (type) {
      case "room-joined": {
        if (payload.peer) {
          peerSocketIdRef.current = payload.peer.socketId;
          setPartner(payload.peer.name);
          setPOnline(true);
          addSys(`${payload.peer.name} is already here ✨`);
          emit("request-state");
        }
        break;
      }
      case "peer-joined": {
        peerSocketIdRef.current = payload.socketId;
        setPartner(payload.name);
        setPOnline(true);
        addSys(`${payload.name} joined ✨`);
        buildPC(payload.socketId, true);
        if (v && isHost && hasFileRef.current) {
          emit("send-state", {
            to: payload.socketId,
            time: v.currentTime,
            playing: !v.paused,
            duration: v.duration || 0,
            fileName,
            movieStreamId: movieStreamIdRef.current,
          });
        }
        break;
      }
      case "peer-left": {
        setPartner(null);
        setPOnline(false);
        peerSocketIdRef.current = null;
        closePeerConnection();
        addSys(`${payload.name || "Partner"} left`);
        break;
      }
      case "play": {
        if (!isHost) { setPlaying(true); setCurTime(payload.time || 0); break; }
        if (!v) break;
        ignoreRef.current = true;
        if (Math.abs(v.currentTime - payload.time) > 0.8) v.currentTime = payload.time;
        v.play().catch(() => {}).finally(() => { ignoreRef.current = false; });
        setPlaying(true);
        toast("▶ Synced — play");
        break;
      }
      case "pause": {
        if (!isHost) { setPlaying(false); setCurTime(payload.time || 0); break; }
        if (!v) break;
        ignoreRef.current = true;
        if (Math.abs(v.currentTime - payload.time) > 0.8) v.currentTime = payload.time;
        v.pause(); setPlaying(false); ignoreRef.current = false;
        toast("⏸ Synced — pause");
        break;
      }
      case "seek": {
        if (isHost && v) v.currentTime = payload.time;
        setCurTime(payload.time || 0);
        toast(`⏩ ${fmt(payload.time)}`);
        break;
      }
      case "speed": {
        if (isHost && v) v.playbackRate = payload.speed;
        setSpeed(payload.speed);
        break;
      }
      case "chat": {
        addMsg({ who: "them", name: payload.name, text: payload.text });
        break;
      }
      case "state-requested": {
        if (v && isHost && hasFileRef.current) {
          emit("send-state", {
            to: payload.from,
            time: v.currentTime,
            playing: !v.paused,
            duration: v.duration || 0,
            fileName,
            movieStreamId: movieStreamIdRef.current,
          });
        }
        break;
      }
      case "state-received": {
        if (!isHost) {
          if (payload.time     !== undefined) setCurTime(payload.time);
          if (payload.duration !== undefined) setDuration(payload.duration);
          if (payload.fileName)  setFileName(payload.fileName);
          if (payload.playing  !== undefined) setPlaying(payload.playing);
          if (payload.movieStreamId) {
            remoteMovieIdRef.current = payload.movieStreamId;
            setHostMovieLoaded(true);
            const existing = receivedStreamsRef.current.get(payload.movieStreamId);
            if (existing) { setRemoteMovieStream(existing); setHasFile(true); }
          }
        }
        break;
      }
      case "movie-loaded": {
        if (!isHost) {
          remoteMovieIdRef.current = payload.movieStreamId;
          setHostMovieLoaded(true);
          if (payload.fileName) setFileName(payload.fileName);
          addSys(`Host loaded: ${payload.fileName || "a movie"} — connecting stream…`);
          const existing = receivedStreamsRef.current.get(payload.movieStreamId);
          if (existing) { setRemoteMovieStream(existing); setHasFile(true); }
        }
        break;
      }
      case "offer": {
        const existingPc = pcRef.current;
        if (existingPc && existingPc.signalingState !== "closed" && existingPc.remoteDescription) {
          /* Renegotiation on live connection — don't tear down, just exchange new SDP */
          try {
            await existingPc.setRemoteDescription(new RTCSessionDescription(payload.sdp));
            const answer = await existingPc.createAnswer();
            await existingPc.setLocalDescription(answer);
            emit("answer", { sdp: existingPc.localDescription, to: payload.from });
          } catch (e) {}
        } else {
          /* Fresh connection */
          peerSocketIdRef.current = payload.from;
          isInitiatorRef.current  = false;
          await buildPC(payload.from, false, payload.sdp);
        }
        break;
      }
      case "answer": {
        const pc = pcRef.current; if (!pc) break;
        await pc.setRemoteDescription(new RTCSessionDescription(payload.sdp)).catch(() => {});
        for (const c of pendingIceRef.current)
          await pc.addIceCandidate(new RTCIceCandidate(c)).catch(() => {});
        pendingIceRef.current = [];
        /* Apply bitrate to all video senders — covers camera tracks added via renegotiation */
        pc.getSenders().forEach(sender => {
          if (sender.track?.kind !== "video") return;
          const params = sender.getParameters();
          if (!params.encodings?.length) params.encodings = [{}];
          params.encodings[0].maxBitrate = 8_000_000;
          sender.setParameters(params).catch(() => {});
        });
        break;
      }
      case "ice": {
        const pc = pcRef.current; if (!pc) break;
        if (pc.remoteDescription) {
          await pc.addIceCandidate(new RTCIceCandidate(payload.candidate)).catch(() => {});
        } else {
          pendingIceRef.current.push(payload.candidate);
        }
        break;
      }
      case "screenshot": {
        const { dataUrl, time } = payload;
        setScreenshots(prev =>
          [{ id: Date.now() + Math.random(), dataUrl, time, fromPartner: true }, ...prev].slice(0, 20)
        );
        setSsToast(true); setTimeout(() => setSsToast(false), 2200);
        break;
      }
      case "room-full": {
        alert("Room is full (max 2 users). Please use a different room code.");
        break;
      }
    }
  };

  /* cleanup on unmount */
  useEffect(() => () => {
    closePeerConnection();
    if (streamRafRef.current) cancelAnimationFrame(streamRafRef.current);
  }, [closePeerConnection]);

  /* Partner: wire video srcObject when movie stream arrives.
     Look up the element directly — don't rely on the pre-populated ref
     which may not be set yet when this effect first fires. */
  useEffect(() => {
    if (isHost || !remoteMovieStream) return;
    const v = document.getElementById("main-video") || videoRef.current;
    if (!v) return;
    videoRef.current = v;
    v.srcObject = remoteMovieStream;
    setHasFile(true);
    setAudioLocked(true); // partner must tap to unlock audio (browser autoplay policy)
  }, [remoteMovieStream, isHost]);

  /* Video events (host only for time tracking) */
  useEffect(() => {
    const v = videoRef.current; if (!v) return;
    const onTime  = () => {
      if (!isHost) return;
      setCurTime(v.currentTime);
      const s = subtitles.find(x => v.currentTime >= x.start && v.currentTime <= x.end);
      setActiveSub(s ? s.text : "");
    };
    const onMeta  = () => { if (isHost) setDuration(v.duration || 0); };
    const onPlay  = () => { if (!ignoreRef.current) setPlaying(true); };
    const onPause = () => { if (!ignoreRef.current) setPlaying(false); };
    v.addEventListener("timeupdate",     onTime);
    v.addEventListener("loadedmetadata", onMeta);
    v.addEventListener("durationchange", onMeta);
    v.addEventListener("play",           onPlay);
    v.addEventListener("pause",          onPause);
    return () => {
      v.removeEventListener("timeupdate",     onTime);
      v.removeEventListener("loadedmetadata", onMeta);
      v.removeEventListener("durationchange", onMeta);
      v.removeEventListener("play",           onPlay);
      v.removeEventListener("pause",          onPause);
    };
  }, [subtitles, isHost]);

  /* Subtitle display for partner (curTime from socket) */
  useEffect(() => {
    if (isHost) return;
    const s = subtitles.find(x => curTime >= x.start && curTime <= x.end);
    setActiveSub(s ? s.text : "");
  }, [curTime, subtitles, isHost]);

  /* Keep ref in sync so event handlers always see the latest stream */
  useEffect(() => { remoteMovieStreamRef.current = remoteMovieStream; }, [remoteMovieStream]);

  /* Fullscreen tracking — standard + WebKit document events */
  useEffect(() => {
    const reattach = () => {
      /* Fix 1: re-attach partner movie stream if iOS/browser cleared srcObject on exit */
      if (isHost) return;
      const v = videoRef.current || document.getElementById("main-video");
      if (!v) return;
      const ms = remoteMovieStreamRef.current;
      if (!ms) return;
      if (!v.srcObject) { v.srcObject = ms; v.play().catch(() => setAudioLocked(true)); }
      else if (v.paused)  { v.play().catch(() => {}); }
    };
    const h = () => {
      const isFs = !!(document.fullscreenElement || document.webkitFullscreenElement);
      setFullscreen(isFs);
      if (!isFs) reattach();
    };
    document.addEventListener("fullscreenchange",       h);
    document.addEventListener("webkitfullscreenchange", h);
    return () => {
      document.removeEventListener("fullscreenchange",       h);
      document.removeEventListener("webkitfullscreenchange", h);
    };
  }, [isHost]);

  /* Fix 1 + Fix 3: iOS native video fullscreen (webkitEnterFullscreen path)
     Re-binds every render so it always targets the live DOM element. */
  useEffect(() => {
    const v = document.getElementById("main-video");
    if (!v) return;
    const onBegin = () => setFullscreen(true);
    const onEnd = () => {
      setFullscreen(false);
      if (!isHost) {
        const ms = remoteMovieStreamRef.current;
        if (ms && !v.srcObject) { v.srcObject = ms; v.play().catch(() => setAudioLocked(true)); }
        else if (ms && v.paused)  { v.play().catch(() => {}); }
      }
    };
    v.addEventListener("webkitbeginfullscreen", onBegin);
    v.addEventListener("webkitendfullscreen",   onEnd);
    return () => {
      v.removeEventListener("webkitbeginfullscreen", onBegin);
      v.removeEventListener("webkitendfullscreen",   onEnd);
    };
  });

  /* Auto-hide controls in fullscreen */
  const revealControls = useCallback(() => {
    setCtrlVisible(true);
    clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => {
      if (document.fullscreenElement) setCtrlVisible(false);
    }, 4000);
  }, []);

  const keepVisible = useCallback(() => {
    setCtrlVisible(true);
    clearTimeout(hideTimer.current);
  }, []);

  const startWatching = useCallback(() => {
    const v = videoRef.current;
    if (v) v.play().catch(() => {});
    // Unlock any other video elements that may be blocked (camera streams)
    document.querySelectorAll("video").forEach(vid => {
      if (vid !== v && vid.paused && vid.srcObject) vid.play().catch(() => {});
    });
    setAudioLocked(false);
  }, []);

  useEffect(() => {
    if (!fullscreen) { setCtrlVisible(true); clearTimeout(hideTimer.current); return; }
    setCtrlVisible(true);
    hideTimer.current = setTimeout(() => {
      if (document.fullscreenElement) setCtrlVisible(false);
    }, 4000);
    return () => clearTimeout(hideTimer.current);
  }, [fullscreen]);

  /* Webcam hidden master ref */
  useEffect(() => {
    const vid = localVidRef.current; if (!vid) return;
    if (camOn && localStream.current) {
      if (vid.srcObject !== localStream.current) {
        vid.srcObject = localStream.current;
        vid.play().catch(() => {});
      }
    } else if (!camOn) vid.srcObject = null;
  }, [camOn]);

  /* ─────────────────────────────────────────────
     LOAD MOVIE (host only)
  ───────────────────────────────────────────── */
  const loadMovie = useCallback((file) => {
    if (!isHost || !file) return;
    const isVideo =
      file.type.startsWith("video/") ||
      /\.(mp4|mkv|webm|avi|mov|m4v|ogv|3gp|ts|flv|wmv)$/i.test(file.name);
    if (!isVideo) { alert("Please select a video file."); return; }

    if (blobUrlRef.current) { URL.revokeObjectURL(blobUrlRef.current); blobUrlRef.current = null; }
    const url = URL.createObjectURL(file);
    blobUrlRef.current = url;

    const v = videoRef.current;
    if (v) {
      v.pause();
      v.removeAttribute("src");
      v.srcObject = null;
      v.load();
      v.dataset.fname = file.name;
      v.src = url;
      v.load();
      const onLoaded = () => {
        v.removeEventListener("loadeddata", onLoaded);
        setupMovieCapture(v);
      };
      v.addEventListener("loadeddata", onLoaded);
    }
    setFileName(file.name); setHasFile(true); setPlaying(false);
    setCurTime(0); setDuration(0); setActiveSub("");
    addSys(`Loaded: ${file.name}`);
  }, [isHost, setupMovieCapture]);

  const loadSub = (file) => {
    if (!file) return;
    const r = new FileReader();
    r.onload = (e) => { setSubtitles(parseSRT(e.target.result)); addSys("Subtitles loaded"); };
    r.readAsText(file);
  };

  /* ─────────────────────────────────────────────
     PLAYBACK
  ───────────────────────────────────────────── */
  const togglePlay = useCallback(() => {
    if (!isHost) return;
    const v = videoRef.current; if (!v || !hasFile) return;
    if (v.paused) {
      v.play().then(() => {
        setPlaying(true);
        if (!ignoreRef.current) emit("play", { time: v.currentTime });
      }).catch(e => console.warn(e));
    } else {
      v.pause(); setPlaying(false);
      if (!ignoreRef.current) emit("pause", { time: v.currentTime });
    }
  }, [isHost, hasFile, emit]);

  const seekTo = useCallback((t) => {
    if (!isHost) return;
    const v = videoRef.current; if (!v) return;
    const clamped = Math.max(0, Math.min(v.duration || 0, t));
    v.currentTime = clamped; setCurTime(clamped); emit("seek", { time: clamped });
  }, [isHost, emit]);

  const seekBy = useCallback((delta) => {
    if (!isHost) return;
    const v = videoRef.current; if (!v || !hasFile) return;
    seekTo(v.currentTime + delta);
  }, [isHost, hasFile, seekTo]);

  const onVolChange = useCallback((val) => {
    const v = videoRef.current;
    if (v) { v.volume = val; v.muted = val === 0; }
    setVolume(val); setMuted(val === 0);
  }, []);

  const toggleMute = useCallback(() => {
    const v = videoRef.current; if (!v) return;
    v.muted = !muted; setMuted(!muted);
  }, [muted]);

  const changeSpeed = useCallback((s) => {
    if (!isHost) return;
    const v = videoRef.current; if (!v) return;
    v.playbackRate = s; setSpeed(s); emit("speed", { speed: s });
  }, [isHost, emit]);

  const toggleFs = useCallback(() => {
    const isFs = !!(document.fullscreenElement || document.webkitFullscreenElement);
    if (isFs) {
      (document.exitFullscreen || document.webkitExitFullscreen)?.call(document);
      return;
    }
    const wrap = wrapRef.current;
    if (wrap?.requestFullscreen) {
      wrap.requestFullscreen().catch(() => {});
    } else if (wrap?.webkitRequestFullscreen) {
      wrap.webkitRequestFullscreen();
    } else {
      // iOS Safari: only <video> supports native fullscreen
      const v = document.getElementById("main-video");
      v?.webkitEnterFullscreen?.();
    }
  }, []);

  /* ─────────────────────────────────────────────
     SCREENSHOT
  ───────────────────────────────────────────── */
  const takeScreenshot = useCallback(async () => {
    const v = videoRef.current;
    if (!v || !hasFile || v.readyState < 2) { alert("No video to screenshot yet."); return; }
    const time = curTime;
    setSsFlash(true);
    setTimeout(() => setSsFlash(false), 350);

    const addAndShare = (dataUrl) => {
      setScreenshots(prev => [{ id: Date.now(), dataUrl, time }, ...prev].slice(0, 20));
      setSsToast(true); setTimeout(() => setSsToast(false), 2200);
      // Compress to JPEG and send to partner
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, 1280 / img.width, 720 / img.height);
        const c = document.createElement("canvas");
        c.width  = Math.round(img.width  * scale);
        c.height = Math.round(img.height * scale);
        c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
        emit("screenshot", { dataUrl: c.toDataURL("image/jpeg", 0.75), time });
      };
      img.src = dataUrl;
    };

    try {
      if (!window.html2canvas) {
        await new Promise((res, rej) => {
          let tries = 0;
          const chk = setInterval(() => {
            if (window.html2canvas) { clearInterval(chk); res(); }
            if (++tries > 50) { clearInterval(chk); rej(); }
          }, 100);
        });
      }
      const canvas = await window.html2canvas(document.body, {
        useCORS: true, allowTaint: true, backgroundColor: "#07090f",
        scale: window.devicePixelRatio || 1, logging: false,
        onclone: (doc) => {
          doc.querySelectorAll("video.main-vid").forEach(cv => {
            const c = doc.createElement("canvas");
            c.width  = v.videoWidth  || cv.clientWidth  || 1280;
            c.height = v.videoHeight || cv.clientHeight || 720;
            c.getContext("2d").drawImage(v, 0, 0, c.width, c.height);
            c.style.cssText = cv.style.cssText +
              ";width:100%;height:100%;object-fit:contain;position:absolute;inset:0";
            cv.parentNode?.replaceChild(c, cv);
          });
        },
      });
      addAndShare(canvas.toDataURL("image/png"));
    } catch {
      const canvas = canvasRef.current;
      canvas.width  = v.videoWidth  || 1280;
      canvas.height = v.videoHeight || 720;
      canvas.getContext("2d").drawImage(v, 0, 0, canvas.width, canvas.height);
      addAndShare(canvas.toDataURL("image/png"));
    }
  }, [hasFile, curTime, emit]);

  const dlScreenshot = (ss) => {
    const a = document.createElement("a");
    a.href = ss.dataUrl;
    a.download = `screenshot_${fmt(ss.time).replace(/:/g, "-")}.png`;
    a.click();
  };

  /* ─────────────────────────────────────────────
     WEBCAM
  ───────────────────────────────────────────── */
  const startCam = async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      alert(
        "Camera requires a secure connection.\n\n" +
        "Open the app via HTTPS and accept the self-signed certificate warning on your device."
      );
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { frameRate: { ideal: 60, max: 60 }, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: true,
      });
      /* Fix 2: honour current mute state so UI and track state stay in sync */
      stream.getAudioTracks().forEach(t => { t.enabled = micOn; });
      localStream.current = stream;
      const vid = localVidRef.current;
      if (vid) { vid.srcObject = stream; vid.play().catch(() => {}); }
      setCamOn(true);
      if (!peerSocketIdRef.current) return;
      const pc = pcRef.current;
      if (pc && pc.signalingState !== "closed") {
        /* Add tracks to the live connection — onnegotiationneeded handles renegotiation */
        stream.getTracks().forEach(t => pc.addTrack(t, stream));
      } else {
        await buildPC(peerSocketIdRef.current, isInitiatorRef.current);
      }
    } catch (err) {
      alert(
        err?.name === "NotAllowedError" ? "Camera permission denied. Please allow camera & mic access and try again." :
        err?.name === "NotFoundError"   ? "No camera found on this device." :
        "Camera error: " + (err.message || err)
      );
    }
  };

  const stopCam = async () => {
    const pc = pcRef.current;
    if (pc && localStream.current) {
      /* Remove only the camera/mic senders — movie stream senders stay untouched */
      const trackIds = new Set(localStream.current.getTracks().map(t => t.id));
      pc.getSenders()
        .filter(s => s.track && trackIds.has(s.track.id))
        .forEach(s => pc.removeTrack(s));
    }
    localStream.current?.getTracks().forEach(t => t.stop());
    localStream.current = null;
    const vid = localVidRef.current;
    if (vid) { vid.srcObject = null; vid.load(); }
    setCamOn(false);
  };

  const toggleMic = () => {
    const next = !micOn;
    localStream.current?.getAudioTracks().forEach(t => { t.enabled = next; });
    setMicOn(next);
  };

  /* ─────────────────────────────────────────────
     CHAT & UTILS
  ───────────────────────────────────────────── */
  const sendChat = (text) => {
    emit("chat", { name, text });
    addMsg({ who: "me", name, text });
  };

  const copyCode = () => {
    navigator.clipboard.writeText(roomId).catch(() => {});
    setCopyMsg(true); setTimeout(() => setCopyMsg(false), 2000);
  };

  const addSys = (text) =>
    setMsgs(p => [...p, { id: Date.now() + Math.random(), type: "sys", text }]);
  const addMsg = (m) =>
    setMsgs(p => [...p, { id: Date.now() + Math.random(), ...m }]);
  const toast  = (msg) => {
    setSyncMsg(msg);
    setTimeout(() => setSyncMsg(""), 2600);
  };

  /* ── Computed ── */
  const pct  = duration ? (curTime / duration) * 100 : 0;
  const vpct = muted ? 0 : volume * 100;

  const ctrlProps = {
    playing, curTime, duration, volume, muted, speed,
    showSub, fullscreen, hasFile, fileName, pct, vpct,
    readOnly:    !isHost,
    onTogglePlay: togglePlay,
    onSeek:      (t) => { keepVisible(); seekTo(t); },
    onSeekBy:    seekBy,
    onVolChange,
    onToggleMute: toggleMute,
    onSpeed:     changeSpeed,
    onToggleSub: () => setShowSub(x => !x),
    onLoadSub:   () => subInputRef.current?.click(),
    onRotate:    () => setRotation(r => (r + 90) % 360),
    onScreenshot: takeScreenshot,
    onToggleFs:  toggleFs,
    onLoadMovie: () => fileInputRef.current?.click(),
    onActivity:  keepVisible,
  };

  const camPanelProps = {
    name, partner, pOnline,
    localStream: localStream.current,
    remoteStream, remoteMovieStream, hostMovieLoaded,
    camOn, micOn, isHost, roomId, screenshots,
    onStartCam:       startCam,
    onStopCam:        stopCam,
    onToggleMic:      toggleMic,
    onScreenshot:     takeScreenshot,
    onCopyCode:       copyCode,
    onDlScreenshot:   dlScreenshot,
    onDelScreenshot:  (id) => setScreenshots(p => p.filter(s => s.id !== id)),
    onClearScreenshots: () => setScreenshots([]),
  };

  /* ─────────────────────────────────────────────
     RENDER
  ───────────────────────────────────────────── */
  return (
    <div className="room">
      {/* Hidden webcam element (master source) */}
      <video ref={localVidRef} autoPlay muted playsInline style={{ display: "none" }} />

      {/* Hidden file inputs */}
      {isHost && (
        <input
          ref={fileInputRef}
          type="file"
          accept="video/*,.mkv,.avi,.mov,.m4v,.ogv,.3gp"
          style={{ display: "none" }}
          onChange={(e) => { loadMovie(e.target.files?.[0]); e.target.value = ""; }}
        />
      )}
      <input
        ref={subInputRef}
        type="file"
        accept=".srt,.vtt"
        style={{ display: "none" }}
        onChange={(e) => { loadSub(e.target.files?.[0]); e.target.value = ""; }}
      />

      {/* Header */}
      <Header
        roomId={roomId}
        partner={partner}
        pOnline={pOnline}
        isHost={isHost}
        onCopyCode={copyCode}
        onLeave={onLeave}
        onTogglePanel={() => setPanelOpen(v => !v)}
        panelOpen={panelOpen}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      {/* Partner banner */}
      {!isHost && (
        <div className="partner-banner">
          👁 You are watching <b>{partner || "host"}</b>'s stream
          {hostMovieLoaded && !remoteMovieStream && " — connecting…"}
          {remoteMovieStream && " — live ✓"}
          {!hostMovieLoaded && " — waiting for host to load a movie"}
        </div>
      )}

      <div className="main">
        {/* Player column */}
        <VideoSection
          ref={wrapRef}
          isHost={isHost}
          hasFile={hasFile}
          fileName={fileName}
          dragOver={dragOver}
          hostMovieLoaded={hostMovieLoaded}
          partner={partner}
          pOnline={pOnline}
          name={name}
          localStream={localStream.current}
          remoteStream={remoteStream}
          camOn={camOn}
          micOn={micOn}
          fullscreen={fullscreen}
          ctrlVisible={ctrlVisible}
          ssFlash={ssFlash}
          rotation={rotation}
          showSub={showSub}
          activeSub={activeSub}
          ctrlProps={ctrlProps}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => { e.preventDefault(); setDragOver(false); loadMovie(e.dataTransfer.files[0]); }}
          onClickDropzone={() => fileInputRef.current?.click()}
          onLoadMovie={() => fileInputRef.current?.click()}
          keepVisible={keepVisible}
          revealControls={revealControls}
          audioLocked={audioLocked}
          onStartWatching={startWatching}
        />

        {/* Side panel */}
        <SidePanel
          panelOpen={panelOpen}
          msgs={msgs}
          name={name}
          onSendChat={sendChat}
          camPanelProps={camPanelProps}
        />
      </div>

      {/* Toasts */}
      {syncMsg && <div className="toast toast-sync">{I.Sync} {syncMsg}</div>}
      {copyMsg && <div className="toast toast-copy">{I.Copy} Code copied!</div>}
      {ssToast && <div className="toast toast-ss">{I.SS} Screenshot saved!</div>}
    </div>
  );
}