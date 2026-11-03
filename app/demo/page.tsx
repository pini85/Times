import { BoardFrame, Banner, BoxRow, TimeBox } from "@/components/board";

// Shows the board pieces in a few arrangements. Not linked from the board.
export default function Demo() {
  return (
    <main className="demo-page">
      <BoardFrame>
        <Banner>ימות החול</Banner>
        <BoxRow cols={2}>
          <TimeBox label="שחרית" time="06:30" />
          <TimeBox label="מנחה" time="13:45" />
          <TimeBox label="ערבית" time="20:00" />
          <TimeBox label="שחרית מנין ב׳" time="07:30" />
        </BoxRow>
        <Banner>ראש חודש</Banner>
        <BoxRow cols={2}>
          <TimeBox label="הלל" time="07:05" />
        </BoxRow>
        <Banner>שיעורי תורה</Banner>
        <BoxRow cols={4}>
          <TimeBox label="דף יומי" time="05:45" />
          <TimeBox label="הלכה" time="19:40" />
          <TimeBox label="גמרא" time="21:00" />
          <TimeBox label="משנה" time="20:15" />
        </BoxRow>
        <Banner>מוצאי שבת קודש</Banner>
        <BoxRow cols={1}>
          <TimeBox label="ערבית" time="17:30" />
        </BoxRow>
      </BoardFrame>
    </main>
  );
}
