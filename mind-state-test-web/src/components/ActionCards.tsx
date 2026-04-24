import { useMemo, useState } from "react";
import type { ActionItem } from "../types";

type ActionCardsProps = {
  title: string;
  actions: ActionItem[];
};

const badgeClassByDifficulty: Record<ActionItem["difficulty"], string> = {
  쉬움: "bg-emerald-100 text-emerald-700",
  보통: "bg-blue-100 text-blue-700",
  어려움: "bg-amber-100 text-amber-700",
};

const kindLabelClass: Record<ActionItem["kind"], string> = {
  즉시: "bg-brand-100 text-brand-700",
  소통: "bg-cyan-100 text-cyan-700",
  루틴: "bg-indigo-100 text-indigo-700",
  전문가: "bg-rose-100 text-rose-700",
};

const ActionCards = ({ title, actions }: ActionCardsProps) => {
  const [checkedMap, setCheckedMap] = useState<Record<string, boolean>>({});

  const doneCount = useMemo(
    () => actions.filter((action) => checkedMap[action.id]).length,
    [actions, checkedMap]
  );

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-lg font-semibold text-slate-800">{title}</h3>
        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
          {doneCount}/{actions.length}
        </span>
      </div>

      <div className="mt-3 space-y-3">
        {actions.map((action) => {
          const checked = Boolean(checkedMap[action.id]);
          return (
            <label
              key={action.id}
              className={`block rounded-2xl border p-4 transition ${
                checked
                  ? "border-brand-300 bg-brand-50"
                  : "border-slate-200 bg-slate-50 hover:border-slate-300"
              }`}
            >
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  className="mt-1 h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                  checked={checked}
                  onChange={(event) => {
                    setCheckedMap((prev) => ({
                      ...prev,
                      [action.id]: event.target.checked,
                    }));
                  }}
                />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-slate-800 sm:text-base">{action.title}</p>
                  <p className="mt-1 text-sm leading-relaxed text-slate-600">{action.description}</p>

                  <div className="mt-3 flex flex-wrap gap-2 text-xs font-medium">
                    <span className={`rounded-full px-2 py-1 ${kindLabelClass[action.kind]}`}>{action.kind}</span>
                    <span className={`rounded-full px-2 py-1 ${badgeClassByDifficulty[action.difficulty]}`}>{action.difficulty}</span>
                    <span className="rounded-full bg-slate-200 px-2 py-1 text-slate-600">{action.time}</span>
                  </div>
                </div>
              </div>
            </label>
          );
        })}
      </div>
    </section>
  );
};

export default ActionCards;
