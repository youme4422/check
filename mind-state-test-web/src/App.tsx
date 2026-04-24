import { useState } from "react";
import Header from "./components/Header";
import Landing from "./components/Landing";
import TestFlow from "./components/TestFlow";

type Screen = "landing" | "test";

const App = () => {
  const [screen, setScreen] = useState<Screen>("landing");

  return (
    <div className="min-h-screen overflow-x-hidden bg-canvas text-ink">
      <div className="pointer-events-none fixed inset-0">
        <div className="blob blob-1" />
        <div className="blob blob-2" />
        <div className="blob blob-3" />
      </div>

      <div className="relative z-10">
        <Header subtitle="지금 내 마음은 어떤 패턴에 가까울까?" />

        {screen === "landing" ? (
          <Landing onStart={() => setScreen("test")} />
        ) : (
          <TestFlow onRestartToLanding={() => setScreen("landing")} />
        )}

        <footer className="px-4 pb-8 text-center text-xs text-slate-500 sm:px-6">
          <p>답변은 서버로 전송되지 않으며 브라우저 안에서만 계산됩니다.</p>
          <p className="mt-1">
            본 서비스는 참고용 자가 체크 도구이며 의학적 진단을 제공하지 않습니다.
          </p>
          <p className="mt-2">
            <a
              href={`${import.meta.env.BASE_URL}privacy.html`}
              className="font-semibold text-brand-700 underline underline-offset-2"
            >
              개인정보 및 이용 안내
            </a>
          </p>
        </footer>
      </div>
    </div>
  );
};

export default App;
