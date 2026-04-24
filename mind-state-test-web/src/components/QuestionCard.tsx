import { ANSWER_LABELS } from "../data/questions";

type QuestionCardProps = {
  number: number;
  total: number;
  category: string;
  text: string;
  value: number | null;
  onSelect: (value: number) => void;
};

const QuestionCard = ({
  number,
  total,
  category,
  text,
  value,
  onSelect,
}: QuestionCardProps) => {
  return (
    <section
      key={number}
      className="animate-slide-up rounded-3xl border border-slate-200 bg-white p-5 shadow-soft transition duration-300 ease-out sm:p-7"
      aria-live="polite"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-semibold text-brand-700">
          문항 {number} / {total}
        </p>
        <span className="rounded-full bg-brand-100 px-2.5 py-1 text-xs font-semibold text-brand-700">
          {category}
        </span>
      </div>

      <h3 className="mt-3 text-xl font-bold leading-snug text-slate-800 sm:text-2xl">
        {text}
      </h3>
      <p className="mt-2 text-sm text-slate-500">가장 가까운 답을 선택하면 됩니다.</p>

      <fieldset className="mt-6 space-y-3">
        <legend className="sr-only">응답 선택</legend>
        {ANSWER_LABELS.map((label, index) => {
          const selected = value === index;
          return (
            <label
              key={label}
              className={`group flex cursor-pointer items-center justify-between rounded-2xl border px-4 py-4 text-sm transition sm:text-base ${
                selected
                  ? "answer-pop border-brand-500 bg-brand-50 text-brand-800"
                  : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
              }`}
            >
              <div className="flex items-center gap-3">
                <input
                  type="radio"
                  name={`question-${number}`}
                  value={index}
                  checked={selected}
                  onChange={() => onSelect(index)}
                  className="h-4 w-4 border-slate-300 text-brand-600 focus:ring-brand-500"
                />
                <span className="font-medium">{label}</span>
              </div>
              <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-500 group-hover:bg-slate-200">
                {index}
              </span>
            </label>
          );
        })}
      </fieldset>
    </section>
  );
};

export default QuestionCard;
