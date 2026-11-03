"use client";
import { useEffect, useRef, useState, useTransition } from "react";
import LayoutView from "@/components/LayoutView";
import { MAX_COLS, MAX_TEXT, newId, type Block, type Box, type Layout, type Template } from "@/lib/layout";
import { deleteTemplate, publish, saveTemplate, type Result } from "./actions";

// Builds the board out of banners and rows of time boxes, shows a live
// preview, publishes to the board, and saves/loads named templates.
export default function LayoutEditor({
  initial,
  initialTemplates,
}: {
  initial: Layout;
  initialTemplates: Template[];
}) {
  const [layout, setLayout] = useState(initial);
  const [published, setPublished] = useState(initial);
  const [templates, setTemplates] = useState(initialTemplates);
  const [tplName, setTplName] = useState("");
  const [msg, setMsg] = useState<Result | null>(null);
  const [pending, start] = useTransition();
  const dirty = JSON.stringify(layout) !== JSON.stringify(published);

  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  // ---- editing helpers ----
  const setBlock = (i: number, b: Block) => setLayout((l) => l.map((x, j) => (j === i ? b : x)));
  const removeBlock = (i: number) => setLayout((l) => l.filter((_, j) => j !== i));
  const moveBlock = (i: number, d: number) => setLayout((l) => move(l, i, i + d));
  const copyBlock = (i: number) =>
    setLayout((l) => {
      const b = l[i];
      const c: Block =
        b.type === "row"
          ? { ...b, id: newId(), boxes: b.boxes.map((x) => ({ ...x, id: newId() })) }
          : { ...b, id: newId() };
      return [...l.slice(0, i + 1), c, ...l.slice(i + 1)];
    });
  const addBanner = () => setLayout((l) => [...l, { type: "banner", id: newId(), text: "כותרת חדשה" }]);
  const addRow = () =>
    setLayout((l) => [...l, { type: "row", id: newId(), cols: 3, boxes: [newBox()] }]);

  // ---- server calls ----
  const run = (fn: () => Promise<Result>, after?: (r: Result) => void) =>
    start(async () => {
      try {
        const r = await fn();
        setMsg(r);
        if (r.templates) setTemplates(r.templates);
        if (r.ok) after?.(r);
      } catch {
        setMsg({ ok: false, message: "שגיאה בשמירה, נסו שוב" });
      }
    });

  const onPublish = () => run(() => publish(layout), () => setPublished(layout));
  const onSaveTemplate = () => {
    const name = tplName.trim();
    if (templates.some((t) => t.name === name) && !confirm(`להחליף את התבנית "${name}"?`)) return;
    run(() => saveTemplate(name, layout), () => setTplName(""));
  };
  const onLoad = (t: Template) => {
    if (dirty && !confirm("לטעון את התבנית? שינויים שלא פורסמו יימחקו")) return;
    setLayout(t.layout);
    setTplName(t.name);
    setMsg({ ok: true, message: `נטענה התבנית "${t.name}". לחצו "פרסום ללוח" כדי להציג אותה` });
  };
  const onDelete = (t: Template) => {
    if (confirm(`למחוק את התבנית "${t.name}"?`)) run(() => deleteTemplate(t.name));
  };

  return (
    <div className="editor">
      <div className="editor-side">
        <div className="toolbar">
          <button onClick={onPublish} disabled={pending || !dirty}>
            {pending ? "שומר…" : dirty ? "פרסום ללוח" : "הלוח מעודכן ✓"}
          </button>
          {dirty && (
            <button className="btn-secondary" onClick={() => setLayout(published)} disabled={pending}>
              ביטול שינויים
            </button>
          )}
        </div>
        {msg && <p className={`msg ${msg.ok ? "ok" : "err"}`}>{msg.message}</p>}

        <h2>מבנה הלוח</h2>
        {layout.length === 0 && <p className="sub">הלוח ריק. הוסיפו כותרת או שורה.</p>}
        <ol className="blocks">
          {layout.map((b, i) => (
            <li key={b.id} className={`block block-${b.type}`}>
              <div className="block-head">
                <span>{b.type === "banner" ? "כותרת" : "שורת תיבות"}</span>
                <span className="tools">
                  <IconBtn title="למעלה" onClick={() => moveBlock(i, -1)} disabled={i === 0}>▲</IconBtn>
                  <IconBtn title="למטה" onClick={() => moveBlock(i, 1)} disabled={i === layout.length - 1}>▼</IconBtn>
                  <IconBtn title="שכפול" onClick={() => copyBlock(i)}>⧉</IconBtn>
                  <IconBtn title="מחיקה" onClick={() => removeBlock(i)} danger>✕</IconBtn>
                </span>
              </div>
              {b.type === "banner" ? (
                <input
                  value={b.text}
                  maxLength={MAX_TEXT}
                  aria-label="טקסט הכותרת"
                  onChange={(e) => setBlock(i, { ...b, text: e.target.value })}
                />
              ) : (
                <RowEditor row={b} onChange={(r) => setBlock(i, r)} />
              )}
            </li>
          ))}
        </ol>
        <div className="row">
          <button className="btn-secondary" onClick={addBanner}>+ כותרת</button>
          <button className="btn-secondary" onClick={addRow}>+ שורה</button>
        </div>

        <h2>תבניות</h2>
        <p className="sub small">שמרו את הלוח כתבנית (למשל קיץ, חורף, חג) וטענו אותה בכל עת.</p>
        <div className="tpl-save">
          <input
            placeholder="שם התבנית"
            value={tplName}
            maxLength={MAX_TEXT}
            onChange={(e) => setTplName(e.target.value)}
          />
          <button onClick={onSaveTemplate} disabled={pending || !tplName.trim()}>שמירה כתבנית</button>
        </div>
        {templates.length === 0 ? (
          <p className="sub small">אין עדיין תבניות שמורות.</p>
        ) : (
          <ul className="tpls">
            {templates.map((t) => (
              <li key={t.name}>
                <span className="tpl-name">
                  {t.name}
                  <small>{new Date(t.savedAt).toLocaleDateString("he-IL")}</small>
                </span>
                <button className="small-btn" onClick={() => onLoad(t)} disabled={pending}>טעינה</button>
                <button className="small-btn btn-secondary" onClick={() => onDelete(t)} disabled={pending}>מחיקה</button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="editor-preview">
        <h2>תצוגה מקדימה</h2>
        <Preview layout={layout} />
      </div>
    </div>
  );
}

function RowEditor({ row, onChange }: { row: Extract<Block, { type: "row" }>; onChange: (r: Block) => void }) {
  const setBox = (i: number, x: Box) => onChange({ ...row, boxes: row.boxes.map((y, j) => (j === i ? x : y)) });
  return (
    <>
      <label className="cols">
        תיבות בשורה:
        <span className="seg">
          {Array.from({ length: MAX_COLS }, (_, k) => k + 1).map((n) => (
            <button
              key={n}
              type="button"
              className={n === row.cols ? "on" : ""}
              onClick={() => onChange({ ...row, cols: n })}
            >
              {n}
            </button>
          ))}
        </span>
      </label>
      {row.boxes.map((x, i) => (
        <div className="box-edit" key={x.id}>
          <input
            className="box-label"
            value={x.label}
            placeholder="שם"
            maxLength={MAX_TEXT}
            aria-label="שם התיבה"
            onChange={(e) => setBox(i, { ...x, label: e.target.value })}
          />
          <input
            className="box-time"
            value={x.time}
            placeholder="06:30"
            maxLength={MAX_TEXT}
            aria-label="שעה"
            onChange={(e) => setBox(i, { ...x, time: e.target.value })}
          />
          <IconBtn title="קודם" onClick={() => onChange({ ...row, boxes: move(row.boxes, i, i - 1) })} disabled={i === 0}>▲</IconBtn>
          <IconBtn title="אחר כך" onClick={() => onChange({ ...row, boxes: move(row.boxes, i, i + 1) })} disabled={i === row.boxes.length - 1}>▼</IconBtn>
          <IconBtn title="מחיקה" onClick={() => onChange({ ...row, boxes: row.boxes.filter((_, j) => j !== i) })} danger>✕</IconBtn>
        </div>
      ))}
      <button className="small-btn btn-secondary add-box" onClick={() => onChange({ ...row, boxes: [...row.boxes, newBox()] })}>
        + תיבה
      </button>
    </>
  );
}

// The board at the width of its container
function Preview({ layout }: { layout: Layout }) {
  const ref = useRef<HTMLDivElement>(null);
  const [w, setW] = useState<number>();
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setW(el.clientWidth));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return (
    <div className="preview" ref={ref}>
      {w ? <LayoutView layout={layout} width={`${w}px`} /> : null}
    </div>
  );
}

function IconBtn({
  children, title, onClick, disabled, danger,
}: {
  children: React.ReactNode; title: string; onClick: () => void; disabled?: boolean; danger?: boolean;
}) {
  return (
    <button type="button" className={`icon-btn${danger ? " danger" : ""}`} title={title} aria-label={title} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );
}

function newBox(): Box {
  return { id: newId(), label: "שם", time: "00:00" };
}

function move<T>(list: T[], from: number, to: number): T[] {
  if (to < 0 || to >= list.length) return list;
  const out = [...list];
  const [x] = out.splice(from, 1);
  out.splice(to, 0, x);
  return out;
}
