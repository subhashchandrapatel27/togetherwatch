/* Empty string = socket.io connects to the current page origin.
   Vite proxies /socket.io → localhost:3001, so phones on LAN go through
   the HTTPS Vite server and avoid mixed-content / mediaDevices issues.
   Override with VITE_SOCKET_URL for production deployments. */
export const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "";

export const ICE_SERVERS = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
    { urls: "stun:stun2.l.google.com:19302" },
  ],
};

export const EMOJIS = [
  "😀","😂","🤣","😍","🥰","😎","🤔","😅","😊","😭",
  "😱","🤩","😴","🥹","💀","😏","🥲","🫠","🤯","😤",
  "👍","👎","👏","🙌","🤝","🫶","💪","🙏","👀","🤦",
  "❤️","🔥","💯","✨","🎉","🎬","🍿","🌟","💫","🎵",
  "😋","🤤","🍕","☕","🎮","🏆","💎","🚀","🌈","💤",
];