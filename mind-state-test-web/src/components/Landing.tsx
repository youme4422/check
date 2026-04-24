import DisclaimerCard from "./DisclaimerCard";

type LandingProps = {
  onStart: () => void;
};

const Landing = ({ onStart }: LandingProps) => {
  return (
    <main className="px-4 pb-10 pt-6 sm:px-6">
      <div className="mx-auto max-w-3xl space-y-5">
        <section className="rounded-3xl border border-slate-200 bg-gradient-to-br from-white via-white to-brand-50 p-6 shadow-soft sm:p-8">
          <h2 className="text-3xl font-extrabold text-slate-800 sm:text-4xl">
            마음 상태 분포 테스트
          </h2>
          <p className="mt-3 text-base text-slate-600 sm:text-lg">
            우울, 소진, 활력, 회복력까지 지금 내 마음의 분포를 확인해보세요.
          </p>
          <button
            type="button"
            onClick={onStart}
            className="mt-6 w-full rounded-xl bg-brand-600 px-4 py-3 text-base font-semibold text-white transition hover:bg-brand-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-200 sm:w-auto"
          >
            테스트 시작하기
          </button>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
          <p className="text-sm leading-relaxed text-slate-700">
            이 테스트는 의학적 진단이 아니라, 현재 마음 상태를 돌아보기 위한 자가 체크
            도구입니다.
          </p>
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
