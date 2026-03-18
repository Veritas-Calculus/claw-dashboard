import type { SVGProps } from 'react'

type IconProps = SVGProps<SVGSVGElement> & {
  size?: number
}

function icon(props: IconProps, children: React.ReactNode) {
  const { size = 20, ...rest } = props
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...rest}
    >
      {children}
    </svg>
  )
}

export function IconDashboard(props: IconProps) {
  return icon(
    props,
    <>
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </>,
  )
}

export function IconAgent(props: IconProps) {
  return icon(
    props,
    <>
      <rect x="4" y="4" width="16" height="16" rx="2" />
      <circle cx="9" cy="10" r="1.5" fill="currentColor" stroke="none" />
      <circle cx="15" cy="10" r="1.5" fill="currentColor" stroke="none" />
      <path d="M9 15c.5 1 1.5 1.5 3 1.5s2.5-.5 3-1.5" />
    </>,
  )
}

export function IconTask(props: IconProps) {
  return icon(
    props,
    <>
      <path d="M9 11l3 3L22 4" />
      <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
    </>,
  )
}

export function IconLog(props: IconProps) {
  return icon(
    props,
    <>
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
      <path d="M14 2v6h6" />
      <line x1="8" y1="13" x2="16" y2="13" />
      <line x1="8" y1="17" x2="13" y2="17" />
    </>,
  )
}

export function IconAlert(props: IconProps) {
  return icon(
    props,
    <>
      <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 01-3.46 0" />
    </>,
  )
}

export function IconTopology(props: IconProps) {
  return icon(
    props,
    <>
      <circle cx="6" cy="6" r="3" />
      <circle cx="18" cy="6" r="3" />
      <circle cx="12" cy="18" r="3" />
      <line x1="8.5" y1="7.5" x2="10.5" y2="16" />
      <line x1="15.5" y1="7.5" x2="13.5" y2="16" />
      <line x1="9" y1="6" x2="15" y2="6" />
    </>,
  )
}

export function IconSettings(props: IconProps) {
  return icon(
    props,
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 01-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
    </>,
  )
}

export function IconSearch(props: IconProps) {
  return icon(
    props,
    <>
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </>,
  )
}

export function IconSun(props: IconProps) {
  return icon(
    props,
    <>
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" />
      <line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" />
      <line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </>,
  )
}

export function IconMoon(props: IconProps) {
  return icon(
    props,
    <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />,
  )
}

export function IconMenu(props: IconProps) {
  return icon(
    props,
    <>
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </>,
  )
}

export function IconChevronLeft(props: IconProps) {
  return icon(props, <polyline points="15 18 9 12 15 6" />)
}

export function IconChevronRight(props: IconProps) {
  return icon(props, <polyline points="9 18 15 12 9 6" />)
}

export function IconChevronDown(props: IconProps) {
  return icon(props, <polyline points="6 9 12 15 18 9" />)
}

export function IconUser(props: IconProps) {
  return icon(
    props,
    <>
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </>,
  )
}

export function IconX(props: IconProps) {
  return icon(
    props,
    <>
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </>,
  )
}

export function IconCheck(props: IconProps) {
  return icon(props, <polyline points="20 6 9 17 4 12" />)
}

export function IconArrowUp(props: IconProps) {
  return icon(
    props,
    <>
      <line x1="12" y1="19" x2="12" y2="5" />
      <polyline points="5 12 12 5 19 12" />
    </>,
  )
}

export function IconArrowDown(props: IconProps) {
  return icon(
    props,
    <>
      <line x1="12" y1="5" x2="12" y2="19" />
      <polyline points="19 12 12 19 5 12" />
    </>,
  )
}

export function IconExport(props: IconProps) {
  return icon(
    props,
    <>
      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </>,
  )
}

export function IconFilter(props: IconProps) {
  return icon(
    props,
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />,
  )
}

export function IconRefresh(props: IconProps) {
  return icon(
    props,
    <>
      <polyline points="23 4 23 10 17 10" />
      <polyline points="1 20 1 14 7 14" />
      <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" />
    </>,
  )
}

export function IconDownload(props: IconProps) {
  return icon(
    props,
    <>
      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </>,
  )
}

