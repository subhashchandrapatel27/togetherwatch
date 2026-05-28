import { useState } from "react";
import Landing from "./components/Landing.jsx";
import Room from "./components/Room.jsx";

export default function TogetherWatch() {
  const [session, setSession] = useState(null);
  return session
    ? <Room session={session} onLeave={() => setSession(null)} />
    : <Landing onEnter={setSession} />;
}