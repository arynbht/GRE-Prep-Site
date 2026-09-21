import type { SVGProps } from 'react';

/**
 * One icon family, one stroke weight.
 *
 * Mixing stroke widths or borrowing a glyph from a second set is the fastest
 * way to make an interface look unfinished, so every icon here is 24x24 on a
 * 1.6 stroke with round caps and joins.
 *
 * Decorative by default: `aria-hidden` is on unless a `title` is passed, which
 * covers the common case of an icon sitting beside visible text.
 */

interface IconProps extends Omit<SVGProps<SVGSVGElement>, 'children'> {
  size?: number;
  /** Supply only when the icon is the sole carrier of meaning. */
  title?: string;
}

function Svg({ size = 20, title, children, ...rest }: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden={title ? undefined : true}
      role={title ? 'img' : undefined}
      focusable="false"
      {...rest}
    >
      {title ? <title>{title}</title> : null}
      {children}
    </svg>
  );
}

export const Icon = {
  Upload: (p: IconProps) => (
    <Svg {...p}>
      <path d="M12 15V3m0 0L8 7m4-4 4 4" />
      <path d="M3 15v4a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-4" />
    </Svg>
  ),
  Target: (p: IconProps) => (
    <Svg {...p}>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="5" />
      <circle cx="12" cy="12" r="1.4" />
    </Svg>
  ),
  Clock: (p: IconProps) => (
    <Svg {...p}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3.2 1.9" />
    </Svg>
  ),
  Check: (p: IconProps) => (
    <Svg {...p}>
      <path d="m5 12.5 4.5 4.5L19 7.5" />
    </Svg>
  ),
  Book: (p: IconProps) => (
    <Svg {...p}>
      <path d="M4 4.5A1.5 1.5 0 0 1 5.5 3H19v15H5.5A1.5 1.5 0 0 0 4 19.5z" />
      <path d="M4 19.5A1.5 1.5 0 0 1 5.5 18H19v3H5.5A1.5 1.5 0 0 1 4 19.5z" />
    </Svg>
  ),
  Spark: (p: IconProps) => (
    <Svg {...p}>
      <path d="M12 3v3M12 18v3M4.2 7.5l2.6 1.5M17.2 15l2.6 1.5M4.2 16.5l2.6-1.5M17.2 9l2.6-1.5" />
      <circle cx="12" cy="12" r="3.2" />
    </Svg>
  ),
  Chart: (p: IconProps) => (
    <Svg {...p}>
      <path d="M4 20h16" />
      <path d="M7 20v-6M12 20V6M17 20v-9" />
    </Svg>
  ),
  Lock: (p: IconProps) => (
    <Svg {...p}>
      <rect x="4" y="10" width="16" height="10.5" rx="2" />
      <path d="M8 10V7.5a4 4 0 0 1 8 0V10" />
    </Svg>
  ),
  Flame: (p: IconProps) => (
    <Svg {...p}>
      <path d="M12 3c2.5 3.2 5.5 5 5.5 9a5.5 5.5 0 1 1-11 0c0-1.8.7-3 1.8-4.2.4 1 1 1.7 1.9 2C10.5 7.4 11 5.2 12 3Z" />
    </Svg>
  ),
  Layers: (p: IconProps) => (
    <Svg {...p}>
      <path d="m12 3 8 4.5-8 4.5-8-4.5z" />
      <path d="m4 12 8 4.5 8-4.5M4 16.5 12 21l8-4.5" />
    </Svg>
  ),
  ArrowRight: (p: IconProps) => (
    <Svg {...p}>
      <path d="M4 12h15m0 0-5.5-5.5M19 12l-5.5 5.5" />
    </Svg>
  ),
  Keyboard: (p: IconProps) => (
    <Svg {...p}>
      <rect x="2.5" y="6" width="19" height="12" rx="2" />
      <path d="M7 10h.01M11 10h.01M15 10h.01M8 14h8" />
    </Svg>
  ),
};

export type IconName = keyof typeof Icon;
