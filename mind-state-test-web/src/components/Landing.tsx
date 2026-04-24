import DisclaimerCard from "./DisclaimerCard";
import StepIndicator from "./StepIndicator";
import VisualHero from "./VisualHero";

type LandingProps = {
  onStart: () => void;
};

const Landing = ({ onStart }: LandingProps) => {
  return (
    <main className="px-4 pb-10 pt-6 sm:px-6">
      <div className="mx-auto max-w-4xl space-y-5">
        <StepIndicator current="start" />

        <section className="rounded-3xl border border-slate-200 bg-gradient-to-br from-white via-white to-brand-50 p-6 shadow-soft sm:p-8">
          <div className="grid gap-5 md:grid-cols-[1.1fr_1fr] md:items-center">
            <div>
              <p className="inline-flex rounded-full bg-brand-100 px-3 py-1 text-xs font-semibold text-brand-700">
                정답 없는 테스트
              </p>
              <h2 className="mt-3 text-3xl font-extrabold text-slate-800 sm:text-4xl">
                마음 상태 분포 테스트
              </h2>
              <p className="mt-3 text-base text-slate-600 sm:text-lg">
                우울, 소진, 활력, 회복력까지 지금 내 마음의 분포를 확인해보세요.
              </p>

              <div className="mt-4 flex flex-wrap gap-2 text-sm">
                <span className="rounded-full bg-slate-100 px-3 py-1 font-medium text-slate-600">
                  약 3분 소요
                </span>
                <span className="rounded-full bg-slate-100 px-3 py-1 font-medium text-slate-600">
                  저장/전송 없음
                </span>
                <span className="rounded-full bg-slate-100 px-3 py-1 font-medium text-slate-600">
                  모바일 최적화
                </span>
              </div>

              <button
                type="button"
                onClick={onStart}
                className="mt-6 w-full rounded-xl bg-brand-600 px-4 py-3 text-base font-semibold text-white transition hover:bg-brand-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-200 sm:w-auto"
              >
                테스트 시작하기
              </button>
            </div>

            <VisualHero />
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
          <h3 className="text-lg font-semibold text-slate-800">무엇을 확인하나요?</h3>
          <ul className="mt-3 grid grid-cols-2 gap-2 text-sm text-slate-700 sm:grid-cols-3">
            <li className="rounded-xl bg-slate-50 px-3 py-2">활력</li>
            <li className="rounded-xl bg-slate-50 px-3 py-2">정서 안정</li>
            <li className="rounded-xl bg-slate-50 px-3 py-2">사회 연결</li>
            <li className="rounded-xl bg-slate-50 px-3 py-2">자기비판</li>
            <li className="rounded-xl bg-slate-50 px-3 py-2">회복탄력성</li>
            <li className="rounded-xl bg-slate-50 px-3 py-2">위험 신호</li>
          </ul>
        </section>

        <DisclaimerCard />
      </div>
    </main>
  );
};

export default Landing;
