type DisclaimerCardProps = {
  className?: string;
};

const disclaimerText =
  "이 테스트는 의학적 진단이 아니며, 정신건강의학과 진료나 전문가 상담을 대체하지 않습니다. 의료기기 또는 의료행위가 아니며 결과는 참고용 자가 점검으로만 사용해주세요.";

const DisclaimerCard = ({ className = "" }: DisclaimerCardProps) => {
  return (
    <section
      className={`rounded-2xl border border-amber-200 bg-amber-50/80 p-4 text-sm leading-relaxed text-amber-900 ${className}`}
    >
      <p className="font-semibold">안내</p>
      <p className="mt-1">{disclaimerText}</p>
    </section>
  );
};

export default DisclaimerCard;
export { disclaimerText };
