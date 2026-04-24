import { ANSWER_LABELS } from "../data/questions";

type QuestionCardProps = {
  number: number;
  total: number;
  text: string;
  value: number | null;
  onSelect: (value: number) => void;
};

const QuestionCard = ({
  number,
  total,
  text,
  value,
  onSelect,
}: QuestionCardProps) => {
  return (
    <section
      key={number}
      className="animate-fade-in rounded-3xl border border-slate-200 bg-white p-5 shadow-soft transition duration-300 ease-out sm:p-7"
      aria-live="polite"
    >
      <p className="text-sm font-semibold text-brand-700">
        문항 {number} / {total}
      </p>
      <h3 className="mt-2 text-xl font-bold leading-snug text-slate-800 sm:text-2xl">
        {text}
      </h3>

      <fieldset className="mt-6 space-y-2">
        <legend className="sr-only">응답 선택</legend>
        {ANSWER_LABELS.map((label, index) => {
          const selected = value === index;
          return (
            <label
              key={label}
              className={`flex cursor-pointer items-center justify-between rounded-xl border px-4 py-3 text-sm transition sm:text-base ${
                selected
                  ? "border-brand-500 bg-brand-50 text-brand-800"
                  : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
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
                <span>{label}</span>
              </div>
              <span className="font-semibold text-slate-500">{index}</span>
            </label>
          );
        })}
      </fieldset>
    </section>
  );
};

export default QuestionCard;
