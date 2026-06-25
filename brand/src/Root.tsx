import "./index.css";
import { Composition } from "remotion";
import { OneChatIntro } from "./OneChatIntro";
import { OneChatSplash } from "./OneChatSplash";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {/* #1 — brand logo intro (~4.5s) */}
      <Composition
        id="OneChatIntro"
        component={OneChatIntro}
        durationInFrames={140}
        fps={30}
        width={1080}
        height={1080}
      />
      {/* #3 — looping app splash / loader (3s seamless loop) */}
      <Composition
        id="OneChatSplash"
        component={OneChatSplash}
        durationInFrames={90}
        fps={30}
        width={1080}
        height={1080}
      />
    </>
  );
};
