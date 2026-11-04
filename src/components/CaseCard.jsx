import { CIcon } from "./caseIcons";

/** One case study card. The whole card opens the detail view; the round "+" is the keyboard target. */
export default function CaseCard({ study, onOpen }) {
  const open = (e) => onOpen(study.id, e.currentTarget.querySelector(".ck-plus"), e.currentTarget);
  return (
    <article className="ck-card" data-case-id={study.id} onClick={open}>
      <div className="ck-band">
        <span className="ck-ic"><CIcon name={study.icon} size={26} /></span>
      </div>
      <div className="ck-body">
        <span className="ck-tag">{study.category}</span>
        <p className="ck-aud">{study.audience}</p>
        <h3 className="ck-title">{study.title}</h3>
        <p className="ck-sum">{study.summary}</p>
        <div className="ck-hl">
          <strong>{study.highlight.value}</strong>
          <span>{study.highlight.label}</span>
        </div>
        <div className="ck-foot">
          <ul className="ck-outs" aria-label="Outcomes">
            {study.outcomes.map((o) => (
              <li key={o}><CIcon name={o} size={15} />{o}</li>
            ))}
          </ul>
        </div>
      </div>
      <button
        type="button"
        className="ck-plus"
        aria-label={`Open case study: ${study.title}`}
        aria-haspopup="dialog"
        onClick={(e) => { e.stopPropagation(); onOpen(study.id, e.currentTarget, e.currentTarget.closest(".ck-card")); }}
      >
        <CIcon name="plus" size={22} strokeWidth={2.2} />
      </button>
    </article>
  );
}
