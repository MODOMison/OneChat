import {
  AbsoluteFill,
  Easing,
  interpolate,
  Sequence,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { loadFont } from "@remotion/google-fonts/Inter";
import { Background } from "./Background";

const { fontFamily } = loadFont("normal", {
  weights: ["500", "800"],
  subsets: ["latin"],
});
const EASE = Easing.bezier(0.16, 1, 0.3, 1);

const Sparkles: React.FC = () => {
  const frame = useCurrentFrame();
  const pts = [
    [150, 200],
    [930, 240],
    [840, 850],
    [210, 860],
    [520, 130],
    [980, 540],
    [90, 480],
    [640, 960],
    [430, 980],
  ];
  return (
    <>
      {pts.map(([x, y], i) => {
        const tw = Math.sin(frame / 9 + i * 1.7) * 0.5 + 0.5;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x,
              top: y,
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: "#BFE0FF",
              opacity: tw * 0.85,
              boxShadow: "0 0 10px #9FD0FF",
            }}
          />
        );
      })}
    </>
  );
};

const Logo: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({
    frame,
    fps,
    config: { damping: 12, stiffness: 130, mass: 0.8 },
  });
  const scale = interpolate(s, [0, 1], [0.3, 1]);
  const rise = interpolate(s, [0, 1], [40, 0]);
  const glow = interpolate(Math.sin((frame / fps) * 3), [-1, 1], [26, 62]);
  const shine = interpolate(frame, [8, 46], [-140, 160], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: EASE,
  });
  return (
    <div
      style={{
        transform: `translateY(${rise}px) scale(${scale})`,
        width: 280,
        height: 280,
        borderRadius: 70,
        background: "linear-gradient(135deg, #2F6BFF 0%, #18C7A7 100%)",
        boxShadow: `0 0 ${glow}px rgba(47,107,255,0.65), inset 0 0 0 2px rgba(255,255,255,0.18)`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <svg viewBox="0 0 24 24" style={{ width: 168, height: 168 }}>
        <path
          fill="#fff"
          d="M12 3.2c-5 0-9 3.35-9 7.5 0 2.36 1.3 4.46 3.36 5.84-.18 1.02-.78 2.2-1.76 3.16 1.66-.2 3.22-.86 4.3-1.78.92.2 1.9.38 3.1.38 5 0 9-3.35 9-7.5S17 3.2 12 3.2z"
        />
      </svg>
      <div
        style={{
          position: "absolute",
          top: "-50%",
          left: `${shine}%`,
          width: 70,
          height: "200%",
          background:
            "linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)",
          transform: "rotate(18deg)",
        }}
      />
    </div>
  );
};

const Wordmark: React.FC = () => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateRight: "clamp",
    easing: EASE,
  });
  const y = interpolate(frame, [0, 20], [28, 0], {
    extrapolateRight: "clamp",
    easing: EASE,
  });
  return (
    <div
      style={{
        fontFamily,
        fontWeight: 800,
        fontSize: 104,
        color: "#F1F5F9",
        letterSpacing: -3,
        opacity,
        transform: `translateY(${y}px)`,
      }}
    >
      OneChat
    </div>
  );
};

const Tagline: React.FC = () => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateRight: "clamp",
    easing: EASE,
  });
  const y = interpolate(frame, [0, 20], [16, 0], {
    extrapolateRight: "clamp",
    easing: EASE,
  });
  return (
    <div
      style={{
        fontFamily,
        fontWeight: 500,
        fontSize: 32,
        color: "#A6B2C6",
        letterSpacing: 8,
        textTransform: "uppercase",
        opacity,
        transform: `translateY(${y}px)`,
      }}
    >
      one place for all
    </div>
  );
};

export const OneChatIntro: React.FC = () => {
  const { fps } = useVideoConfig();
  return (
    <AbsoluteFill style={{ background: "#05070D" }}>
      <Background />
      <Sparkles />
      <AbsoluteFill
        style={{
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: 44,
        }}
      >
        <Sequence layout="none">
          <Logo />
        </Sequence>
        <Sequence from={Math.round(1.0 * fps)} layout="none">
          <Wordmark />
        </Sequence>
        <Sequence from={Math.round(1.6 * fps)} layout="none">
          <Tagline />
        </Sequence>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
