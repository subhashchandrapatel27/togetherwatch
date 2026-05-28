import { useRef, useEffect, useCallback } from "react";
import { io } from "socket.io-client";
import { SOCKET_URL } from "../constants/config.js";

export function useSocket(roomId, name, isHost) {
  const socketRef  = useRef(null);
  const handlerRef = useRef(null);

  useEffect(() => {
    if (!roomId) return;
    const socket = io(SOCKET_URL, { transports: ["websocket", "polling"] });
    socketRef.current = socket;
    socket.emit("join-room", { roomId, name, isHost });
    socket.onAny((event, payload) => {
      handlerRef.current?.(event, payload ?? {});
    });
    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [roomId, name]);

  const emit = useCallback((type, payload = {}) => {
    socketRef.current?.emit(type, payload);
  }, []);

  return [emit, handlerRef];
}