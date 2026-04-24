const EMERGENCY_TEXT =
  "자해 또는 극단적 선택에 대한 생각이 있다면 지금 혼자 버티지 말고 즉시 119, 112, 자살예방상담전화 109, 정신건강위기상담 1577-0199 또는 가까운 응급실에 도움을 요청하세요.";

const EmergencyNotice = () => {
  return (
    <section className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-900 sm:text-base">
      <h4 className="text-base font-bold sm:text-lg">긴급 도움 안내</h4>
      <p className="mt-2 leading-relaxed">{EMERGENCY_TEXT}</p>
    </section>
  );
};

export default EmergencyNotice;
export { EMERGENCY_TEXT };
