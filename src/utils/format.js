export const fmt = (s) => {
  if (!s || isNaN(s)) return "0:00";
  const h  = Math.floor(s / 3600);
  const m  = Math.floor((s % 3600) / 60);
  const sc = Math.floor(s % 60);
  return h > 0
    ? `${h}:${String(m).padStart(2, "0")}:${String(sc).padStart(2, "0")}`
    : `${m}:${String(sc).padStart(2, "0")}`;
};

export const uid = () =>
  Math.random().toString(36).slice(2, 8).toUpperCase();

export function parseSRT(raw) {
  return raw
    .trim()
    .split(/\n\s*\n/)
    .map((blk) => {
      const lines = blk.trim().split("\n");
      if (lines.length < 3) return null;
      const m = lines[1].match(
        /(\d+:\d+:\d+[,.]?\d*)\s*-->\s*(\d+:\d+:\d+[,.]?\d*)/
      );
      if (!m) return null;
      const ts = (s) => {
        const [h, mn, rest] = s.split(":");
        const [sec, ms] = rest.replace(",", ".").split(".");
        return +h * 3600 + +mn * 60 + +sec + (+ms || 0) / 1000;
      };
      return {
        start: ts(m[1]),
        end:   ts(m[2]),
        text:  lines.slice(2).join("\n").replace(/<[^>]+>/g, ""),
      };
    })
    .filter(Boolean);
}