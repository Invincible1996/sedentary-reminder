import { useState, useMemo } from "react";
import { Solar, HolidayUtil } from "lunar-typescript";
import { Language } from "../types";
import { I18N_TRANSLATIONS } from "../lib/i18n";

interface Props {
  lang: Language;
  onClose: () => void;
}

interface DayItem {
  year: number;
  month: number;
  day: number;
  isCurrentMonth: boolean;
  date: Date;
}

const ZODIAC_EN: Record<string, string> = {
  "鼠": "Rat",
  "牛": "Ox",
  "虎": "Tiger",
  "兔": "Rabbit",
  "龙": "Dragon",
  "蛇": "Snake",
  "马": "Horse",
  "羊": "Goat",
  "猴": "Monkey",
  "鸡": "Rooster",
  "狗": "Dog",
  "猪": "Pig",
};

export default function CalendarModal({ lang, onClose }: Props) {
  const t = I18N_TRANSLATIONS[lang || "zh"];

  const today = useMemo(() => new Date(), []);
  const [currentYear, setCurrentYear] = useState(() => today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(() => today.getMonth() + 1); // 1-indexed
  const [selectedDate, setSelectedDate] = useState<Date>(() => today);

  // 当月天数与网格格数计算
  const gridDays = useMemo<DayItem[]>(() => {
    const grid: DayItem[] = [];

    // 确定当月第一天是周几
    const firstDay = new Date(currentYear, currentMonth - 1, 1);
    let firstDayWeekday = firstDay.getDay(); // 0 (日) .. 6 (六)
    if (firstDayWeekday === 0) firstDayWeekday = 7; // 统一为 1 (一) .. 7 (日)

    // 上个月的补白天数 (以周一为第一列)
    const paddingStart = firstDayWeekday - 1;

    // 获取上个月的年份和月份
    const prevYear = currentMonth === 1 ? currentYear - 1 : currentYear;
    const prevMonth = currentMonth === 1 ? 12 : currentMonth - 1;
    const prevMonthTotalDays = new Date(prevYear, prevMonth, 0).getDate();

    // 填充上个月的天数
    for (let i = paddingStart - 1; i >= 0; i--) {
      const d = prevMonthTotalDays - i;
      grid.push({
        year: prevYear,
        month: prevMonth,
        day: d,
        isCurrentMonth: false,
        date: new Date(prevYear, prevMonth - 1, d),
      });
    }

    // 填充当月的天数
    const totalDays = new Date(currentYear, currentMonth, 0).getDate();
    for (let d = 1; d <= totalDays; d++) {
      grid.push({
        year: currentYear,
        month: currentMonth,
        day: d,
        isCurrentMonth: true,
        date: new Date(currentYear, currentMonth - 1, d),
      });
    }

    // 填充下个月的天数以补足 42 格 (6 行 7 列)
    const paddingEnd = 42 - grid.length;
    const nextYear = currentMonth === 12 ? currentYear + 1 : currentYear;
    const nextMonth = currentMonth === 12 ? 1 : currentMonth + 1;
    for (let d = 1; d <= paddingEnd; d++) {
      grid.push({
        year: nextYear,
        month: nextMonth,
        day: d,
        isCurrentMonth: false,
        date: new Date(nextYear, nextMonth - 1, d),
      });
    }

    return grid;
  }, [currentYear, currentMonth]);

  // 获取选中日期的农历和黄历详细信息
  const selectedInfo = useMemo(() => {
    const y = selectedDate.getFullYear();
    const m = selectedDate.getMonth() + 1;
    const d = selectedDate.getDate();

    const solar = Solar.fromYmd(y, m, d);
    const lunar = solar.getLunar();

    const weekDayStr =
      lang === "zh"
        ? "星期" + ["日", "一", "二", "三", "四", "五", "六"][selectedDate.getDay()]
        : ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][
            selectedDate.getDay()
          ];

    const jieQi = lunar.getJieQi();
    const lFests = lunar.getFestivals();
    const sFests = solar.getFestivals();
    const allFests = [...sFests, ...lFests];

    // 法定节假日/周末状态
    const h = HolidayUtil.getHoliday(y, m, d);
    let holidayStatus = "";
    let isHoliday = false;
    let isWorkMakeup = false;

    if (h) {
      holidayStatus = lang === "zh"
        ? (h.isWork() ? `${h.getName()}调休` : `${h.getName()}放假`)
        : (h.isWork() ? `Work (${h.getName()})` : `Holiday (${h.getName()})`);
      isHoliday = !h.isWork();
      isWorkMakeup = h.isWork();
    } else {
      const weekday = selectedDate.getDay();
      if (weekday === 0 || weekday === 6) {
        holidayStatus = lang === "zh" ? "周末休息" : "Weekend";
        isHoliday = true;
      }
    }

    const sz = lunar.getYearShengXiao();
    const zodiacStr = lang === "en" ? `${sz} (${ZODIAC_EN[sz] || ""})` : sz;

    return {
      solarDateStr: `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`,
      weekDayStr,
      lunarDateStr: `农历 ${lunar.getYearInGanZhi()}年${lunar.getMonthInChinese()}月${lunar.getDayInChinese()}`,
      ganzhiStr: `${lunar.getYearInGanZhi()}年 ${lunar.getMonthInGanZhi()}月 ${lunar.getDayInGanZhi()}日`,
      zodiacStr,
      jieQi,
      festivals: allFests.length > 0 ? allFests.join(", ") : null,
      holidayStatus,
      isHoliday,
      isWorkMakeup,
    };
  }, [selectedDate, lang, t]);

  const handlePrevMonth = () => {
    if (currentMonth === 1) {
      setCurrentYear((y) => y - 1);
      setCurrentMonth(12);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 12) {
      setCurrentYear((y) => y + 1);
      setCurrentMonth(1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const handlePrevYear = () => {
    setCurrentYear((y) => y - 1);
  };

  const handleNextYear = () => {
    setCurrentYear((y) => y + 1);
  };

  const handleBackToToday = () => {
    setCurrentYear(today.getFullYear());
    setCurrentMonth(today.getMonth() + 1);
    setSelectedDate(today);
  };

  // 生成网格中每个格子的具体展示信息
  const getCellData = (item: DayItem) => {
    const solar = Solar.fromYmd(item.year, item.month, item.day);
    const lunar = solar.getLunar();

    const jieQi = lunar.getJieQi();
    const lFests = lunar.getFestivals();
    const sFests = solar.getFestivals();

    // 放假 / 调休标记
    const h = HolidayUtil.getHoliday(item.year, item.month, item.day);
    const isHoliday = h !== null && !h.isWork();
    const isWork = h !== null && h.isWork();

    let text = lunar.getDayInChinese();
    let isSpecial = false;

    if (jieQi) {
      text = jieQi;
      isSpecial = true;
    } else if (lFests.length > 0) {
      text = lFests[0];
      isSpecial = true;
    } else if (sFests.length > 0) {
      text = sFests[0];
      isSpecial = true;
    } else if (text === "初一") {
      text = lunar.getMonthInChinese() + "月";
    }

    // 周末判断
    const weekday = item.date.getDay();
    const isWeekend = weekday === 0 || weekday === 6;

    return {
      lunarText: text,
      isSpecial,
      isHoliday,
      isWork,
      isWeekend,
    };
  };

  return (
    <div className="overlay" onClick={onClose}>
      <div className="calendar-modal" onClick={(e) => e.stopPropagation()}>
        {/* 左侧日历主体 */}
        <div className="calendar-main-pane">
          <div className="calendar-header-nav">
            <div className="calendar-nav-title">
              <h2>
                {currentYear}年 {currentMonth}月
              </h2>
            </div>
            <div className="calendar-nav-actions">
              <button className="nav-arrow-btn" onClick={handlePrevYear} title="上一年">
                «
              </button>
              <button className="nav-arrow-btn" onClick={handlePrevMonth} title="上一月">
                ‹
              </button>
              <button className="nav-text-btn" onClick={handleBackToToday}>
                {t.backToToday}
              </button>
              <button className="nav-arrow-btn" onClick={handleNextMonth} title="下一月">
                ›
              </button>
              <button className="nav-arrow-btn" onClick={handleNextYear} title="下一年">
                »
              </button>
            </div>
          </div>

          <div className="calendar-weekdays">
            {t.weekDays.map((w: string, idx: number) => (
              <div
                key={w}
                className={`weekday-label${idx >= 5 ? " weekend" : ""}`}
              >
                {w}
              </div>
            ))}
          </div>

          <div className="calendar-days-grid">
            {gridDays.map((item) => {
              const cell = getCellData(item);
              const isSelected =
                selectedDate.getDate() === item.day &&
                selectedDate.getMonth() + 1 === item.month &&
                selectedDate.getFullYear() === item.year;

              const isTodayCell =
                today.getDate() === item.day &&
                today.getMonth() + 1 === item.month &&
                today.getFullYear() === item.year;

              // 文字颜色判定：放假调休/周末/非本月
              let dateClass = "";
              if (!item.isCurrentMonth) {
                dateClass = "other-month";
              } else if (cell.isHoliday || (cell.isWeekend && !cell.isWork)) {
                dateClass = "holiday-day";
              }

              return (
                <div
                  key={`${item.year}-${item.month}-${item.day}`}
                  className={`day-cell${isSelected ? " selected" : ""}${
                    isTodayCell ? " is-today" : ""
                  }`}
                  onClick={() => setSelectedDate(item.date)}
                >
                  {/* 角标展示：休/班 */}
                  {cell.isHoliday && (
                    <span className="badge-tag holiday">{t.holidayLabel}</span>
                  )}
                  {cell.isWork && (
                    <span className="badge-tag work">{t.workLabel}</span>
                  )}

                  <span className={`solar-num ${dateClass}`}>{item.day}</span>
                  <span
                    className={`lunar-desc${cell.isSpecial ? " festival" : ""}${
                      !item.isCurrentMonth ? " other-month" : ""
                    }`}
                  >
                    {cell.lunarText}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* 右侧选定日期吉历卡片 */}
        <div className="calendar-detail-pane">
          <button className="detail-close-btn" onClick={onClose} aria-label={t.close}>
            ✕
          </button>
          <div className="detail-card-content">
            <div className="detail-solar-big">
              <span className="big-day-num">{selectedDate.getDate()}</span>
              <span className="big-weekday">
                <span>{selectedInfo.weekDayStr}</span>
                {selectedInfo.holidayStatus && (
                  <span className={`weekday-status-tag ${selectedInfo.isHoliday ? "holiday" : "work"}`}>
                    {selectedInfo.holidayStatus}
                  </span>
                )}
              </span>
              <span className="big-solar-full">{selectedInfo.solarDateStr}</span>
            </div>

            <div className="detail-divider" />

            <div className="detail-lunar-group">
              <div className="detail-row">
                <span className="detail-label">{t.lunarLabel}</span>
                <span className="detail-val highlight">{selectedInfo.lunarDateStr}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">{t.ganzhiLabel}</span>
                <span className="detail-val">{selectedInfo.ganzhiStr}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">{t.zodiacLabel}</span>
                <span className="detail-val">{selectedInfo.zodiacStr}</span>
              </div>
              {selectedInfo.jieQi && (
                <div className="detail-row">
                  <span className="detail-label">{t.termLabel}</span>
                  <span className="detail-val term">{selectedInfo.jieQi}</span>
                </div>
              )}
              {selectedInfo.festivals && (
                <div className="detail-row">
                  <span className="detail-label">{t.festivalLabel}</span>
                  <span className="detail-val festival">{selectedInfo.festivals}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
