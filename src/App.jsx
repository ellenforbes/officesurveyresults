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
    { name: "Strongly Support", value: 6, color: COLORS.navy },
    { name: "Support w/ Reservations", value: 4, color: COLORS.purple },
  ],
  q1_impression: [
    { name: "3 – Neutral", value: 1, color: COLORS.silver },
    { name: "4 – Positive", value: 4, color: COLORS.purple },
    { name: "5 – Very Positive", value: 5, color: COLORS.navy },
  ],
  q3_collaboration: [
    { name: "Much Better", value: 1, color: COLORS.navy },
    { name: "Somewhat Better", value: 6, color: COLORS.purple },
    { name: "About the Same", value: 3, color: COLORS.textMuted },
  ],
  q4_focus: [
    { name: "Needs Improvement", value: 7, color: COLORS.red },
    { name: "Yes", value: 1, color: COLORS.navy },
    { name: "Unsure", value: 2, color: COLORS.textMuted },
  ],
  q5_temp: [
    { name: "Comfortable", value: 9, color: COLORS.navy },
    { name: "Slightly Cold", value: 1, color: COLORS.textMuted },
  ],
  q2_capacity: [
    { name: "Yes, Definitely", value: 8, color: COLORS.navy },
    { name: "Yes, Mostly", value: 2, color: COLORS.purple },
  ],
};

// ─── Raw open-text responses (Q6 + Q8 per respondent) ────────────────────────
// To add a new response: append a new object to this array. The word cloud
// and phrase counts will update automatically.
const rawResponses = [
  {
    q6: "Think it needs more quite sound proof break out rooms for calls or deep thinking work, also reconfiguring work station layout to be more spacious and private",
    q8: "Think it would be worthwhile making changes to the 3 offices 1x meeting room and others small quite rooms / focus spaces. Also reception area could be reconfigured into small phone / teams work stations. Blinds? Less but better laid out work stations",
  },
  {
    q6: "No comments of note.",
    q8: "No comments of note.",
  },
  {
    q6: "There is adequate seating for our Brisbane staff although I do not think the configuration of seating supports team collaboration. It would be beneficial for additional privacy, noise reduction and collaboration if desks could be arranged into a more pod formation where teams sit together - if this isn't possible partitioning and plants could also help.",
    q8: "The move will mean an increased amount of people sharing a reduced space which will have impact on the noise levels. I think if the rule is that nobody will have office spaces at least 2 of them are turned into smaller breakout rooms like the small phone one to allow for a quiet space to work or a place to take a call. Expect to see a potential rise in WFH.",
  },
  {
    q6: "Open plan will likely be too noisy unless some changes. For example, higher softer partitions between team members, having three rows of open plan desks rather than 4, adding some additional small quiet room places.",
    q8: "Not a fan of open plan but if partitions are appropriate and people consider others before having loud phone calls in the open areas, then it may be manageable.",
  },
  {
    q6: "Hoping that we are in a smaller space, closer, not so spread out that it will encourage interaction and collaboration.",
    q8: "Refer comments above.",
  },
  {
    q6: "Minor adjustments required to make it comfortable ie desk screening and planter boxes",
    q8: "Fit for purpose might just need desk configurations changed.",
  },
  {
    q6: "Definitely like the office and am pretty happy with layout, would like teams to sit together. Some people who are loud might be better in individual offices.",
    q8: "Standing desks or adjustable desks would be a great addition. Just better desk partitioning, maybe pods where I can turn around and talk to other people in my team easier.",
  },
  {
    q6: "All good",
    q8: "More meeting rooms, partitioning / privacy screens, hybrid working adjustments, standing desks",
  },
  {
    q6: "looks good",
    q8: "none",
  },
  {
    q6: "See my improvement and suggestions.",
    q8: "Reception Area is not needed. Should be turned into 2 phone booths. Or one of those spaces could possibly house the Printer so its quieter. Barrier is needed between the kitchen and the workspace and the Printer. The desks need barriers on them to define depth and width. The desks there are slightly smaller than ours. More depth is better for working on screens, rather than less. Not essential, but the working desks could be transformed into pods. 4 for HR; 6 for Finance; 4 for Marketing/Logistics; 2 sets of 4 for the Tech Services and Engineers; 4 for Environmental/Permitting; then 1 long desk against the wall for Hot Desks with 4 or 5 seats each side. Not essential but the middle Exec Office could be turned into 2 smaller meeting rooms for quiet, collaborative work. Not essential but one of the small meeting rooms should be with a standing desk like our library, with high chairs, stools.",
  },
];

// ─── Phrase definitions ────────────────────────────────────────────────────────
// Each entry defines a display label, keywords to match (case-insensitive),
// and a theme. Size is auto-calculated from how many responses mention it.
const phraseDefinitions = [
  { text: "partitions",       keywords: ["partition"],              theme: "layout"   },
  { text: "desks",            keywords: ["desk", "work station"],   theme: "layout"   },
  { text: "open plan",        keywords: ["open plan"],              theme: "concern"  },
  { text: "noise",            keywords: ["nois", "noisy", "loud"],  theme: "concern"  },
  { text: "quiet spaces",     keywords: ["quiet", "sound proof", "focus space"], theme: "spaces" },
  { text: "collaboration",    keywords: ["collaborat"],             theme: "positive" },
  { text: "privacy",          keywords: ["privac", "private", "screening", "privacy screen"], theme: "concern" },
  { text: "pods",             keywords: ["pod"],                    theme: "layout"   },
  { text: "breakout rooms",   keywords: ["breakout", "break out"],  theme: "spaces"   },
  { text: "meeting rooms",    keywords: ["meeting room"],           theme: "spaces"   },
  { text: "standing desks",   keywords: ["standing desk"],          theme: "positive" },
  { text: "phone rooms",      keywords: ["phone room", "phone /", "small phone", "phone booth"], theme: "spaces" },
  { text: "plants",           keywords: ["plant"],                  theme: "positive" },
  { text: "team seating",     keywords: ["teams sit", "sit together", "teams to sit"], theme: "layout" },
  { text: "adjustable desks", keywords: ["adjustable desk"],        theme: "positive" },
  { text: "focus work",       keywords: ["focus", "deep thinking"], theme: "concern"  },
  { text: "WFH",              keywords: ["wfh", "work from home"],  theme: "concern"  },
  { text: "hybrid working",   keywords: ["hybrid"],                 theme: "concern"  },
  { text: "reception area",   keywords: ["reception"],              theme: "spaces"   },
  { text: "blinds",           keywords: ["blind"],                  theme: "layout"   },
  { text: "seating",          keywords: ["seating", "seat"],        theme: "layout"   },
  { text: "executive offices",keywords: ["individual office", "exec office"], theme: "spaces" },
  { text: "barriers",         keywords: ["barrier"],                theme: "layout"   },
];

// ─── Auto-compute word cloud from raw responses ───────────────────────────────
const wordCloudData = phraseDefinitions.map(phrase => {
  const count = rawResponses.filter(r => {
    const text = `${r.q6} ${r.q8}`.toLowerCase();
    return phrase.keywords.some(kw => text.includes(kw.toLowerCase()));
  }).length;
  return { text: phrase.text, size: 10 + count * 9, theme: phrase.theme, count };
}).filter(d => d.count > 0);

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

// ─── Derived totals (auto-update when feedbackData or rawResponses change) ────
const TOTAL = rawResponses.length;

const totalSupport     = feedbackData.q7_recommendation.reduce((s, d) => s + d.value, 0);
const stronglySupport  = feedbackData.q7_recommendation.find(d => d.name === "Strongly Support")?.value ?? 0;
const totalCapacity    = feedbackData.q2_capacity.reduce((s, d) => s + d.value, 0);
const comfortableTemp  = feedbackData.q5_temp.find(d => d.name === "Comfortable")?.value ?? 0;
const avgImpression    = (
  feedbackData.q1_impression.reduce((s, d) => {
    const score = parseFloat(d.name);
    return s + (isNaN(score) ? 0 : score * d.value);
  }, 0) / TOTAL
).toFixed(1);

const pct = (n, d = TOTAL) => `${Math.round((n / d) * 100)}%`;

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
  { key: "layout", icon: "⬜", label: "Layout Concerns", desc: "Pod-style desk arrangements, partitions between teams, and better seating configuration appeared in nearly every response. Privacy screens were a recurring specific request." },
  { key: "spaces", icon: "🚪", label: "Need for Quiet Spaces", desc: "More meeting rooms was the most requested improvement. Consistent demand also for small breakout and phone rooms to support focused work and private calls." },
  { key: "concern", icon: "📢", label: "Noise & Hybrid Working", desc: `Open plan noise remains the top concern, with all ${TOTAL} respondents flagging focus work as needing improvement. Hybrid working adjustments were also raised as a priority.` },
  { key: "positive", icon: "✨", label: "Collaboration Optimism", desc: "Most see the move as an opportunity. Standing desks, team pods, and managers sitting among staff were popular ideas across multiple responses." },
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
      <style>{`
        @media (max-width: 640px) {
          .charts-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

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
          {TOTAL} responses · Submitted 5 March 2026 · Brisbane office relocation survey
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
          <StatPill value={`${totalSupport}/${TOTAL}`} label="Support the move" color={COLORS.navy} />
          <StatPill value={pct(stronglySupport)} label="Strongly support" color={COLORS.purple} />
          <StatPill value={`${avgImpression}★`} label="Avg. first impression" color={COLORS.red} />
          <StatPill value={pct(totalCapacity)} label="Space capacity met" color={COLORS.textBody} />
          <StatPill value={pct(comfortableTemp)} label="Comfortable temp." color={COLORS.textBody} />
        </div>

        {/* Charts row */}
        <div className="charts-grid" style={{
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
            <p style={{ margin: "0 0 16px", fontSize: 11, color: COLORS.textMuted }}>All {TOTAL} respondents support the move</p>
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
        <div className="charts-grid" style={{
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
          Pembroke Resources · Office Relocation Feedback · {TOTAL} Respondents · March 2026
        </p>
      </div>
    </div>
  );
}
