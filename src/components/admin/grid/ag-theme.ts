import { themeQuartz } from "ag-grid-community";

/**
 * Rumbaclaat dark + gold AG Grid theme (Theming API — no CSS imports, no blue).
 * Values reference the brand CSS tokens in theme.css so the grid tracks the
 * design system. browserColorScheme:"dark" keeps the built-in filter/menu
 * inputs dark; accentColor drives selection/sort/focus accents (gold).
 */
export const adminGridTheme = themeQuartz.withParams({
  browserColorScheme: "dark",
  backgroundColor: "var(--bg-card2)",
  foregroundColor: "var(--text)",
  accentColor: "var(--gold)",
  borderColor: "var(--gold-bdr)",
  chromeBackgroundColor: "var(--bg-card3)",
  headerBackgroundColor: "var(--bg-card3)",
  headerTextColor: "var(--text-muted)",
  headerFontWeight: 600,
  oddRowBackgroundColor: "transparent",
  rowHoverColor: "var(--gold-lt)",
  selectedRowBackgroundColor: "var(--gold-lt)",
  cellTextColor: "var(--text)",
  menuBackgroundColor: "var(--bg-card3)",
  fontFamily: "var(--sans)",
  fontSize: 14,
  headerFontSize: 12,
  spacing: 9,
  wrapperBorderRadius: 0,
  borderRadius: 6,
});
