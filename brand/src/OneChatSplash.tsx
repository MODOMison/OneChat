import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { loadFont } from "@remotion/google-fonts/Inter";
import { Background } from "./Background";

const { fontFamily } = loadFont("normal", {
  weights: ["600", "800"],
  subsets: ["latin"],
});

// A seamless looping splash/loader: breathing logo, orbiting accent dot,
// animated "connecting your apps…" dots. Loop length is a clean multiple of
// the pulse period so it tiles perfectly.
export const OneChatSplash: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Breathing pulse — period 1.5s (loop length should be a multiple of it).
  const pulse = Math.sin(((frame / fps) * (Math.PI * 2)) / 1.5) * 0.5 + 0.5;
  const scale = interpolate(pulse, [0, 1], [0.95, 1.05]);
  const glow = interpolate(pulse, [0, 1], [22, 60]);

  // Orbit: exactly one full turn per loop → seamless.
  const rot = (frame / durationInFrames) * 360;

  // Loader dots cycle every 0.5s.
  const dots = Math.floor((frame / (fps * 0.5)) % 4);

  return (
    <AbsoluteFill style={{ background: "#05070D" }}>
      <Background />
      <AbsoluteFill
        style={{
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: 64,
        }}
      >
        <div
          style={{
            position: "relative",
            width: 340,
            height: 340,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              position: "absolute",
              width: 340,
              height: 340,
              borderRadius: "50%",
              border: "2px solid rgba(255,255,255,0.07)",
            }}
          />
          <div
            style={{
              position: "absolute",
              width: 340,
              height: 340,
              transform: `rotate(${rot}deg)`,
            }}
          >
            <div
              style={{
                position: "absolute",
                top: -9,
                left: "50%",
                marginLeft: -9,
                width: 18,
                height: 18,
                borderRadius: "50%",
                background: "#18C7A7",
                boxShadow: "0 0 18px #18C7A7",
              }}
            />
          </div>
          <div
            style={{
              transform: `scale(${scale})`,
              width: 188,
              height: 188,
              borderRadius: 48,
              background: "linear-gradient(135deg, #2F6BFF 0%, #18C7A7 100%)",
              boxShadow: `0 0 ${glow}px rgba(47,107,255,0.6), inset 0 0 0 2px rgba(255,255,255,0.18)`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg viewBox="0 0 24 24" style={{ width: 116, height: 116 }}>
              <path
                fill="#fff"
                d="M12 3.2c-5 0-9 3.35-9 7.5 0 2.36 1.3 4.46 3.36 5.84-.18 1.02-.78 2.2-1.76 3.16 1.66-.2 3.22-.86 4.3-1.78.92.2 1.9.38 3.1.38 5 0 9-3.35 9-7.5S17 3.2 12 3.2z"
              />
              <circle cx="8.4" cy="10.7" r="1.5" fill="#2563EB" />
              <circle cx="12" cy="10.7" r="1.5" fill="#2563EB" />
              <circle cx="15.6" cy="10.7" r="1.5" fill="#2563EB" />
            </svg>
          </div>
        </div>
        <div
          style={{
            fontFamily,
            fontWeight: 600,
            fontSize: 30,
            color: "#A6B2C6",
            letterSpacing: 2,
          }}
        >
          connecting your apps{".".repeat(dots)}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
