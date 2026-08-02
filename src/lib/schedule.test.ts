import { describe, expect, it } from "vitest";
import { groupWeeklyHours, publicScheduleUrl } from "./schedule";

describe("public schedule presentation", () => {
  it("opens internal scheduling paths on the DietSystem app", () => {
    expect(
      publicScheduleUrl(
        "/agenda/NjQ1ODkzMzk1",
        "https://my.dietsystem.com.br/",
      ),
    ).toBe("https://my.dietsystem.com.br/agenda/NjQ1ODkzMzk1");
  });

  it("keeps safe external scheduling URLs", () => {
    expect(
      publicScheduleUrl(
        "https://agenda.example.com/ana",
        "https://my.dietsystem.com.br",
      ),
    ).toBe("https://agenda.example.com/ana");
    expect(
      publicScheduleUrl("javascript:alert(1)", "https://my.dietsystem.com.br"),
    ).toBeNull();
  });

  it("groups consecutive days with equal hours and preserves a break", () => {
    expect(
      groupWeeklyHours({
        monday: { start: "08:00", end: "18:00" },
        tuesday: { start: "08:00", end: "18:00" },
        wednesday: {
          start: "08:00",
          end: "18:00",
          break_start: "12:00",
          break_end: "13:00",
        },
      }),
    ).toEqual([
      { days: "Seg–Ter", hours: "08:00–18:00" },
      { days: "Qua", hours: "08:00–12:00 e 13:00–18:00" },
    ]);
  });
});
