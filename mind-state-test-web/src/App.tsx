import { useState } from "react";
import Header from "./components/Header";
import Landing from "./components/Landing";
import TestFlow from "./components/TestFlow";

type Screen = "landing" | "test";

const App = () => {
  const [screen, setScreen] = useState<Screen>("landing");

  return (
    <div className="min-h-screen bg-canvas text-ink">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top,_rgba(20,184,166,0.13),_transparent_45%),radial-gradient(circle_at_80%_20%,_rgba(96,165,250,0.12),_transparent_35%)]" />
      <div className="relative z-10">
        <Header subtitle="지금 내 마음은 어떤 패턴에 가까울까?" />
        {screen === "landing" ? (
          <Landing onStart={() => setScreen("test")} />
        ) : (
          <TestFlow onRestartToLanding={() => setScreen("landing")} />
        )}
        <footer className="px-4 pb-8 text-center text-xs text-slate-500 sm:px-6">
          <p>입력한 응답은 기기 밖으로 전송·저장되지 않습니다.</p>
          <p className="mt-1">
            본 서비스는 참고용 자가 체크 도구이며 의학적 진단을 제공하지 않습니다.
          </p>
        </footer>
      </div>
    </div>
  );
};

export default App;
