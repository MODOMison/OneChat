import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";

// Cinematic dark base + slowly drifting aurora "blobs" (blue / teal / indigo).
// Never pure black (OLED smear); deep slate radial base.
const Blob: React.FC<{
  x: number;
  y: number;
  size: number;
  color: string;
  phase: number;
}> = ({ x, y, size, color, phase }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const dx = Math.sin(t * 0.5 + phase) * 70;
  const dy = Math.cos(t * 0.42 + phase) * 60;
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: size,
        height: size,
        borderRadius: "50%",
        background: color,
        filter: "blur(110px)",
        opacity: 0.4,
        transform: `translate(${dx}px, ${dy}px)`,
      }}
    />
  );
};

export const Background: React.FC = () => {
  return (
    <AbsoluteFill
      style={{
        background:
          "radial-gradient(circle at 50% 38%, #0C1626 0%, #070B14 55%, #05070D 100%)",
        overflow: "hidden",
      }}
    >
      <Blob x={120} y={80} size={520} color="#2F6BFF" phase={0} />
      <Blob x={560} y={520} size={480} color="#18C7A7" phase={2.1} />
      <Blob x={60} y={620} size={440} color="#5E6AD2" phase={4.2} />
      <Blob x={680} y={120} size={360} color="#2F6BFF" phase={1.3} />
      {/* faint vignette to focus the center */}
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(circle at 50% 50%, transparent 45%, rgba(0,0,0,0.45) 100%)",
        }}
      />
    </AbsoluteFill>
  );
};
