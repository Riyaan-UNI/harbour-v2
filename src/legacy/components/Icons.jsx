/* Harbour icon set — inline SVG only, consistent 24x24 viewBox, no emoji. */

const paths = {
  home: <path d="M4 10.6 12 4l8 6.6V19a1.5 1.5 0 0 1-1.5 1.5H15V15H9v5.5H5.5A1.5 1.5 0 0 1 4 19z" />,
  shield: (
    <>
      <path d="M12 3.2 19 6v5.6c0 4.3-2.9 7.9-7 9.2-4.1-1.3-7-4.9-7-9.2V6z" />
      <path d="m9 12 2.2 2.2L15.5 10" />
    </>
  ),
  checklist: (
    <>
      <path d="m3.5 7 1.4 1.4L7.8 5.5M3.5 12.4l1.4 1.4 2.9-2.9M3.5 17.8l1.4 1.4 2.9-2.9" />
      <path d="M11 7h9.5M11 12.4h9.5M11 17.8h9.5" />
    </>
  ),
  translate: (
    <>
      <path d="M3.5 6h9M8 6V4M5.2 6c.4 4 3 7 6.8 8.8M11 6c0 3.3-2.4 6.2-5.8 7.6" />
      <path d="m13 20.5 3.8-9.5 3.7 9.5M14.6 16.8h4.6" />
    </>
  ),
  chat: <path d="M20 14.5a2 2 0 0 1-2 2H8.6L4.5 20V6a2 2 0 0 1 2-2H18a2 2 0 0 1 2 2z" />,
  dashboard: <path d="M3.5 20V11M9.5 20V4.5M15.5 20v-8M21 20V8.5" />,
  users: (
    <>
      <path d="M15.5 20v-1.4a3.6 3.6 0 0 0-3.6-3.6H7.1a3.6 3.6 0 0 0-3.6 3.6V20" />
      <circle cx="9.5" cy="8" r="3.4" />
      <path d="M20.5 20v-1.4a3.6 3.6 0 0 0-2.7-3.5M15.6 4.9a3.4 3.4 0 0 1 0 6.2" />
    </>
  ),
  rabbit: (
    <>
      <path d="M8.6 20.4a3.6 3.6 0 0 1 0-7.2h6.8a3.6 3.6 0 0 1 0 7.2z" />
      <path d="M9.4 13.4c-.9-1.7-1.5-3.8-1.3-5.5.2-1.4 2-1.8 2.5-.4l1.1 2.7M14.6 13.4c.9-1.7 1.5-3.8 1.3-5.5-.2-1.4-2-1.8-2.5-.4l-1.1 2.7" />
      <path d="M10.6 17h.01M13.4 17h.01" />
    </>
  ),
  globe: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M3.2 9.2h17.6M3.2 14.8h17.6M12 3c2.6 2.7 2.6 15.3 0 18M12 3c-2.6 2.7-2.6 15.3 0 18" />
    </>
  ),
  waves: <path d="M2.8 9.2c2 0 2.6-1.6 4.6-1.6s2.6 1.6 4.6 1.6 2.6-1.6 4.6-1.6 2.6 1.6 4.6 1.6M2.8 15c2 0 2.6-1.6 4.6-1.6S10 15 12 15s2.6-1.6 4.6-1.6S19.2 15 21.2 15" />,
  sos: (
    <>
      <path d="M12 3.4 2.6 20h18.8z" />
      <path d="M12 9.6v4.6M12 17.3v.01" />
    </>
  ),
  user: (
    <>
      <circle cx="12" cy="8.2" r="3.8" />
      <path d="M4.4 20a7.8 7.8 0 0 1 15.2 0" />
    </>
  ),
  more: (
    <>
      <circle cx="5.2" cy="12" r="1.7" fill="currentColor" stroke="none" />
      <circle cx="12" cy="12" r="1.7" fill="currentColor" stroke="none" />
      <circle cx="18.8" cy="12" r="1.7" fill="currentColor" stroke="none" />
    </>
  ),
  search: (
    <>
      <circle cx="10.8" cy="10.8" r="6.6" />
      <path d="m15.8 15.8 4.4 4.4" />
    </>
  ),
  close: <path d="M6 6l12 12M18 6 6 18" />,
  external: (
    <>
      <path d="M14 4h6v6M20 4 10.5 13.5" />
      <path d="M18 14v5a1.5 1.5 0 0 1-1.5 1.5H5.5A1.5 1.5 0 0 1 4 19V7.5A1.5 1.5 0 0 1 5.5 6H10" />
    </>
  ),
  check: <path d="m5 12.8 4.3 4.3L19 7" />,
  chevronDown: <path d="m6 9.2 6 6 6-6" />,
  chevronRight: <path d="m9.2 6 6 6-6 6" />,
  copy: (
    <>
      <rect x="9" y="9" width="11" height="11" rx="2.2" />
      <path d="M5 14.6V6.2A1.2 1.2 0 0 1 6.2 5h8.4" />
    </>
  ),
  volume: (
    <>
      <path d="M4 9v6h4l5 4V5L8 9z" />
      <path d="M16 9a4 4 0 0 1 0 6M18.5 6.5a7.5 7.5 0 0 1 0 11" />
    </>
  ),
  swap: <path d="M7 4 4 7l3 3M4 7h13.5M17 20l3-3-3-3M20 17H6.5" />,
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  alert: (
    <>
      <path d="M12 3.4 2.6 20h18.8z" />
      <path d="M12 9.6v4.6M12 17.3v.01" />
    </>
  ),
  info: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11.2v5M12 7.9v.01" />
    </>
  ),
  dot: <circle cx="12" cy="12" r="4" fill="currentColor" stroke="none" />,
  phone: <path d="M6.4 3.2h3.1l1.5 4-2.1 1.5a12.4 12.4 0 0 0 6.4 6.4l1.5-2.1 4 1.5v3.1a2 2 0 0 1-2.2 2A16.6 16.6 0 0 1 4.4 5.4a2 2 0 0 1 2-2.2z" />,
  play: <path d="m8.2 5 11 7-11 7z" />,
  pause: <path d="M9.2 5v14M14.8 5v14" />,
  sparkle: <path d="M12 3.2l1.9 5.4 5.4 1.9-5.4 1.9L12 17.8l-1.9-5.4L4.7 10.5l5.4-1.9z" />,
  plus: <path d="M12 5.2v13.6M5.2 12h13.6" />,
  minus: <path d="M5.2 12h13.6" />,
  calendar: (
    <>
      <rect x="3.6" y="5.2" width="16.8" height="15" rx="2.2" />
      <path d="M3.6 10.2h16.8M8.2 3.2v4M15.8 3.2v4" />
    </>
  ),
  lock: (
    <>
      <rect x="4.6" y="10.2" width="14.8" height="10" rx="2.2" />
      <path d="M8.2 10.2V7.6a3.8 3.8 0 0 1 7.6 0v2.6" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7.2v5l3.4 2" />
    </>
  ),
  send: <path d="M4.2 12 20 4.2l-7 15.6-2.6-6.2z" />,
  list: <path d="M4.2 6.4h15.6M4.2 12h15.6M4.2 17.6h15.6" />,
  sun: (
    <>
      <circle cx="12" cy="12" r="4.2" />
      <path d="M12 3v2.2M12 18.8V21M4.2 12H2M22 12h-2.2M6.5 6.5 5 5M19 19l-1.5-1.5M17.5 6.5 19 5M5 19l1.5-1.5" />
    </>
  ),
  moon: <path d="M20.2 15.1A8.6 8.6 0 0 1 8.9 3.8 8.8 8.8 0 1 0 20.2 15.1Z" />,
  cloud: <path d="M7.4 18.5h9.4a4.1 4.1 0 0 0 .5-8.2 5.6 5.6 0 0 0-10.6 1.4 3.4 3.4 0 0 0 .7 6.8z" />,
  rain: (
    <>
      <path d="M7.4 15.5h9.4a4.1 4.1 0 0 0 .5-8.2 5.6 5.6 0 0 0-10.6 1.4 3.4 3.4 0 0 0 .7 6.8z" />
      <path d="M9 18.4 8 21M13 18.4 12 21M17 18.4 16 21" />
    </>
  ),
  compass: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="m15.4 8.6-2 5.4-5.4 2 2-5.4z" />
    </>
  ),
};

export function Icon({ name, size = 24, className = "", title, ...props }) {
  const glyph = paths[name] || paths.info;
  const labelled = Boolean(title);
  return (
    <svg
      className={`harbour-icon ${className}`.trim()}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      role={labelled ? "img" : undefined}
      aria-hidden={labelled ? undefined : true}
      focusable="false"
      {...props}
    >
      {labelled ? <title>{title}</title> : null}
      {glyph}
    </svg>
  );
}

export default Icon;
