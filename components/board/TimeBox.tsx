// Gold framed box: a label on top and a time (or any short text) below.
// It stretches to whatever width its row gives it.
export default function TimeBox({ label, time }: { label: string; time: string }) {
  return (
    <div className="tb" aria-label={`${label} ${time}`}>
      <img className="tb-orn tb-orn-top" src="/parts/box-orn-top.png" alt="" />
      <div className="tb-label">{label}</div>
      <div className="tb-time">{time}</div>
      <img className="tb-orn tb-orn-bottom" src="/parts/box-orn-bottom.png" alt="" />
    </div>
  );
}
