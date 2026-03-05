import { useState, useEffect, useRef } from "react";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadialBarChart, RadialBar } from "recharts";

const COLORS = {
  navy:      "#1F1F55",
  navyDark:  "#141430",
  red:       "#D7282F",
  grey:      "#86828B",
  silver:    "#C9C4C4",
  purple:    "#6D3A85",
  slate:     "#B8CED9",
  fog:       "#f2f1f6",
  mist:      "#e8e5ed",
  // darker text variants for use on white/light backgrounds
  textBody:  "#3d3a52",
  textMuted: "#5c5876",
};

const feedbackData = {
  q7_recommendation: [
    { name: "Strongly Support", value: 3, color: COLORS.navy },
    { name: "Support w/ Reservations", value: 4, color: COLORS.purple },
  ],
  q1_impression: [
    { name: "3 – Neutral", value: 1, color: COLORS.silver },
    { name: "4 – Positive", value: 4, color: COLORS.purple },
    { name: "5 – Very Positive", value: 2, color: COLORS.navy },
  ],
  q3_collaboration: [
    { name: "Much Better", value: 1, color: COLORS.navy },
    { name: "Somewhat Better", value: 4, color: COLORS.purple },
    { name: "About the Same", value: 2, color: COLORS.textMuted },
  ],
  q4_focus: [
    { name: "Needs Improvement", value: 6, color: COLORS.red },
    { name: "Yes", value: 1, color: COLORS.navy },
  ],
  q5_temp: [
    { name: "Comfortable", value: 6, color: COLORS.navy },
    { name: "Slightly Cold", value: 1, color: COLORS.textMuted },
  ],
  q2_capacity: [
    { name: "Yes, Definitely", value: 5, color: COLORS.navy },
    { name: "Yes, Mostly", value: 2, color: COLORS.purple },
  ],
};

const wordCloudData = [
  { text: "open plan", size: 52, theme: "layout" },
  { text: "partitions", size: 46, theme: "layout" },
  { text: "noise", size: 44, theme: "concern" },
  { text: "meeting rooms", size: 40, theme: "spaces" },
  { text: "breakout rooms", size: 38, theme: "spaces" },
  { text: "pods", size: 36, theme: "layout" },
  { text: "quiet spaces", size: 34, theme: "spaces" },
  { text: "collaboration", size: 32, theme: "positive" },
  { text: "desks", size: 30, theme: "layout" },
  { text: "WFH", size: 28, theme: "concern" },
  { text: "privacy", size: 28, theme: "concern" },
  { text: "seating", size: 26, theme: "layout" },
  { text: "phone rooms", size: 24, theme: "spaces" },
  { text: "standing desks", size: 22, theme: "positive" },
  { text: "team pods", size: 20, theme: "positive" },
  { text: "adjustable desks", size: 18, theme: "positive" },
  { text: "focus work", size: 18, theme: "concern" },
  { text: "storage", size: 14, theme: "concern" },
  { text: "plants", size: 14, theme: "positive" },
  { text: "blinds", size: 12, theme: "layout" },
  { text: "reception area", size: 14, theme: "spaces" },
  { text: "executive offices", size: 16, theme: "spaces" },
];

const themeColors = {
  layout: COLORS.navy,
  concern: COLORS.red,
  spaces: COLORS.purple,
  positive: COLORS.textBody,
};

const themeLabels = {
  layout: "Layout",
  concern: "Concerns",
  spaces: "Spaces",
  positive: "Opportunities",
};

const TOTAL = 7;

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: "white",
        border: `1px solid ${COLORS.mist}`,
        borderRadius: 8,
        padding: "10px 14px",
        boxShadow: "0 4px 16px rgba(31,31,85,0.12)",
        fontFamily: "'DM Sans', sans-serif",
      }}>
        <p style={{ margin: 0, fontWeight: 600, color: COLORS.navy, fontSize: 13 }}>
          {payload[0].name}
        </p>
        <p style={{ margin: "4px 0 0", color: COLORS.textMuted, fontSize: 12 }}>
          {payload[0].value} respondent{payload[0].value !== 1 ? "s" : ""}
        </p>
      </div>
    );
  }
  return null;
};

const DonutChart = ({ data, title, subtitle }) => {
  const [active, setActive] = useState(null);
  return (
    <div style={{ textAlign: "center" }}>
      <ResponsiveContainer width="100%" height={180}>
        <PieChart>
          <Pie
            data={data}
            cx="50%" cy="50%"
            innerRadius={52} outerRadius={76}
            paddingAngle={3}
            dataKey="value"
            onMouseEnter={(_, idx) => setActive(idx)}
            onMouseLeave={() => setActive(null)}
          >
            {data.map((entry, index) => (
              <Cell
                key={index}
                fill={entry.color}
                opacity={active === null || active === index ? 1 : 0.4}
                stroke="none"
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>
      <div style={{ marginTop: -8 }}>
        {data.map((d, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginBottom: 4 }}>
            <div style={{ width: 10, height: 10, borderRadius: 2, background: d.color, flexShrink: 0 }} />
            <span style={{ fontSize: 12, color: COLORS.textMuted, fontFamily: "'DM Sans', sans-serif" }}>
              {d.name} <strong style={{ color: COLORS.navy }}>({d.value})</strong>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

const HorizBar = ({ data, max }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 8 }}>
    {data.map((d, i) => (
      <div key={i}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
          <span style={{ fontSize: 12, color: COLORS.textMuted, fontFamily: "'DM Sans', sans-serif" }}>{d.name}</span>
          <span style={{ fontSize: 12, fontWeight: 700, color: COLORS.navy, fontFamily: "'DM Sans', sans-serif" }}>{d.value}</span>
        </div>
        <div style={{ height: 8, background: COLORS.mist, borderRadius: 4, overflow: "hidden" }}>
          <div style={{
            height: "100%",
            width: `${(d.value / (max || TOTAL)) * 100}%`,
            background: d.color,
            borderRadius: 4,
            transition: "width 0.8s cubic-bezier(.4,0,.2,1)",
          }} />
        </div>
      </div>
    ))}
  </div>
);

const WordCloud = () => {
  const sorted = [...wordCloudData].sort((a, b) => b.size - a.size);
  return (
    <div style={{
      display: "flex",
      flexWrap: "wrap",
      gap: "10px 14px",
      alignItems: "center",
      justifyContent: "center",
      padding: "8px 0",
    }}>
      {sorted.map((word, i) => (
        <span
          key={i}
          style={{
            fontSize: Math.max(11, word.size * 0.38),
            fontWeight: word.size > 38 ? 700 : word.size > 24 ? 600 : 500,
            color: themeColors[word.theme],
            fontFamily: "'DM Sans', sans-serif",
            lineHeight: 1.2,
            opacity: 0.85 + (word.size / wordCloudData[0].size) * 0.15,
            transition: "transform 0.2s",
            cursor: "default",
            padding: "2px 6px",
            borderRadius: 4,
            background: `${themeColors[word.theme]}12`,
          }}
        >
          {word.text}
        </span>
      ))}
    </div>
  );
};

const StatPill = ({ value, label, color }) => (
  <div style={{
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 4,
    padding: "14px 20px",
    borderRadius: 12,
    background: `${color}12`,
    border: `1.5px solid ${color}30`,
  }}>
    <span style={{ fontSize: 32, fontWeight: 800, color, fontFamily: "'DM Serif Display', serif", lineHeight: 1 }}>
      {value}
    </span>
    <span style={{ fontSize: 11, color: COLORS.textMuted, fontFamily: "'DM Sans', sans-serif", textAlign: "center", lineHeight: 1.3 }}>
      {label}
    </span>
  </div>
);

const themes = [
  { key: "layout", icon: "⬜", label: "Layout Concerns", desc: "Pod-style desk arrangements, partitions between teams, and better seating configuration appeared in nearly every response." },
  { key: "spaces", icon: "🚪", label: "Need for Quiet Spaces", desc: "Consistent demand for small breakout / phone rooms to replace exec offices, enabling focused work and private calls." },
  { key: "concern", icon: "📢", label: "Noise & Open Plan", desc: "Open plan noise is the top concern. Respondents want rules and physical barriers to manage sound in shared areas." },
  { key: "positive", icon: "✨", label: "Collaboration Optimism", desc: "Most see the move as an opportunity. Standing desks, team pods, and managers sitting among staff were popular ideas." },
];

export default function App() {
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setLoaded(true), 100);
    return () => clearTimeout(t);
  }, []);

  return (
    <div style={{
      minHeight: "100vh",
      background: COLORS.fog,
      fontFamily: "'DM Sans', sans-serif",
      padding: "0 0 48px",
    }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet" />

      {/* Header */}
      <div style={{
        background: COLORS.navyDark,
        padding: "32px 40px 28px",
        borderBottom: `4px solid ${COLORS.red}`,
      }}>
        <p style={{ margin: "0 0 4px", color: COLORS.textMuted, fontSize: 12, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase" }}>
          Pembroke Resources · March 2026
        </p>
        <h1 style={{ margin: 0, color: "white", fontSize: 28, fontFamily: "'DM Serif Display', serif", fontWeight: 400, lineHeight: 1.2 }}>
          New Office Feedback Summary
        </h1>
        <p style={{ margin: "8px 0 0", color: COLORS.silver, fontSize: 13 }}>
          7 responses · Submitted 5 March 2026 · Brisbane office relocation survey
        </p>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 24px 0" }}>

        {/* Top stats */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
          gap: 14,
          marginBottom: 28,
          opacity: loaded ? 1 : 0,
          transform: loaded ? "none" : "translateY(12px)",
          transition: "all 0.5s ease",
        }}>
          <StatPill value="7/7" label="Support the move" color={COLORS.navy} />
          <StatPill value="43%" label="Strongly support" color={COLORS.purple} />
          <StatPill value="4.1★" label="Avg. first impression" color={COLORS.red} />
          <StatPill value="100%" label="Space capacity met" color={COLORS.textBody} />
          <StatPill value="86%" label="Comfortable temp." color={COLORS.textBody} />
        </div>

        {/* Charts row */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: 16,
          marginBottom: 20,
          opacity: loaded ? 1 : 0,
          transform: loaded ? "none" : "translateY(16px)",
          transition: "all 0.6s ease 0.1s",
        }}>
          {/* Overall recommendation */}
          <div style={{ background: "white", borderRadius: 14, padding: "22px 20px", boxShadow: "0 2px 10px rgba(31,31,85,0.07)" }}>
            <h3 style={{ margin: "0 0 4px", fontSize: 13, fontWeight: 700, color: COLORS.navy, textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Overall Recommendation
            </h3>
            <p style={{ margin: "0 0 16px", fontSize: 11, color: COLORS.textMuted }}>All 7 respondents support the move</p>
            <DonutChart data={feedbackData.q7_recommendation} />
          </div>

          {/* First impression */}
          <div style={{ background: "white", borderRadius: 14, padding: "22px 20px", boxShadow: "0 2px 10px rgba(31,31,85,0.07)" }}>
            <h3 style={{ margin: "0 0 4px", fontSize: 13, fontWeight: 700, color: COLORS.navy, textTransform: "uppercase", letterSpacing: "0.06em" }}>
              First Impression
            </h3>
            <p style={{ margin: "0 0 16px", fontSize: 11, color: COLORS.textMuted }}>Reactions to the new office space</p>
            <DonutChart data={feedbackData.q1_impression} />
          </div>

          {/* Collaboration */}
          <div style={{ background: "white", borderRadius: 14, padding: "22px 20px", boxShadow: "0 2px 10px rgba(31,31,85,0.07)" }}>
            <h3 style={{ margin: "0 0 4px", fontSize: 13, fontWeight: 700, color: COLORS.navy, textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Collaboration Potential
            </h3>
            <p style={{ margin: "0 0 16px", fontSize: 11, color: COLORS.textMuted }}>Compared to current space</p>
            <DonutChart data={feedbackData.q3_collaboration} />
          </div>
        </div>

        {/* Secondary charts row */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: 16,
          marginBottom: 24,
          opacity: loaded ? 1 : 0,
          transform: loaded ? "none" : "translateY(16px)",
          transition: "all 0.6s ease 0.2s",
        }}>
          <div style={{ background: "white", borderRadius: 14, padding: "22px 20px", boxShadow: "0 2px 10px rgba(31,31,85,0.07)" }}>
            <h3 style={{ margin: "0 0 4px", fontSize: 13, fontWeight: 700, color: COLORS.navy, textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Space Capacity
            </h3>
            <p style={{ margin: "0 0 16px", fontSize: 11, color: COLORS.textMuted }}>Will it fit the team?</p>
            <HorizBar data={feedbackData.q2_capacity} />
          </div>
          <div style={{ background: "white", borderRadius: 14, padding: "22px 20px", boxShadow: "0 2px 10px rgba(31,31,85,0.07)" }}>
            <h3 style={{ margin: "0 0 4px", fontSize: 13, fontWeight: 700, color: COLORS.navy, textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Focus Work
            </h3>
            <p style={{ margin: "0 0 16px", fontSize: 11, color: COLORS.textMuted }}>Does the space support deep work?</p>
            <HorizBar data={feedbackData.q4_focus} />
          </div>
          <div style={{ background: "white", borderRadius: 14, padding: "22px 20px", boxShadow: "0 2px 10px rgba(31,31,85,0.07)" }}>
            <h3 style={{ margin: "0 0 4px", fontSize: 13, fontWeight: 700, color: COLORS.navy, textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Temperature
            </h3>
            <p style={{ margin: "0 0 16px", fontSize: 11, color: COLORS.textMuted }}>Thermal comfort in the space</p>
            <HorizBar data={feedbackData.q5_temp} />
          </div>
        </div>

        {/* Word cloud */}
        <div style={{
          background: "white",
          borderRadius: 14,
          padding: "26px 28px",
          marginBottom: 20,
          boxShadow: "0 2px 10px rgba(31,31,85,0.07)",
          opacity: loaded ? 1 : 0,
          transform: loaded ? "none" : "translateY(16px)",
          transition: "all 0.6s ease 0.3s",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16, flexWrap: "wrap", gap: 12 }}>
            <div>
              <h3 style={{ margin: "0 0 4px", fontSize: 13, fontWeight: 700, color: COLORS.navy, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                Most Common Themes
              </h3>
              <p style={{ margin: 0, fontSize: 11, color: COLORS.textMuted }}>Key words and concepts from open text responses — size reflects frequency</p>
            </div>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              {Object.entries(themeColors).map(([key, color]) => (
                <div key={key} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <div style={{ width: 9, height: 9, borderRadius: 2, background: color }} />
                  <span style={{ fontSize: 11, color: COLORS.textMuted }}>{themeLabels[key]}</span>
                </div>
              ))}
            </div>
          </div>
          <WordCloud />
        </div>

        {/* Themes */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 14,
          opacity: loaded ? 1 : 0,
          transform: loaded ? "none" : "translateY(16px)",
          transition: "all 0.6s ease 0.4s",
        }}>
          {themes.map((theme, i) => (
            <div key={i} style={{
              background: "white",
              borderRadius: 14,
              padding: "20px",
              boxShadow: "0 2px 10px rgba(31,31,85,0.07)",
              borderLeft: `4px solid ${themeColors[theme.key]}`,
            }}>
              <div style={{ fontSize: 20, marginBottom: 8 }}>{theme.icon}</div>
              <h4 style={{ margin: "0 0 8px", fontSize: 13, fontWeight: 700, color: themeColors[theme.key] }}>
                {theme.label}
              </h4>
              <p style={{ margin: 0, fontSize: 12, color: COLORS.textBody, lineHeight: 1.6 }}>{theme.desc}</p>
            </div>
          ))}
        </div>

        <p style={{ marginTop: 28, fontSize: 11, color: COLORS.textMuted, textAlign: "center" }}>
          Pembroke Resources · Office Relocation Feedback · 7 Respondents · March 2026
        </p>
      </div>
    </div>
  );
}
