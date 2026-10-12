import type { ReactNode } from 'react'

// Motifs of the Hotel Seeblick website

/** The 40 × 10 px wave in front of eyebrows */
export const WaveMark = () => (
  <svg aria-hidden="true" width="40" height="10" viewBox="0 0 40 10">
    <path d="M0 5 Q5 0 10 5 T20 5 T30 5 T40 5" fill="none" stroke="currentColor" strokeWidth="2" />
  </svg>
)

/** Small uppercase label above a headline. The wave mark is only shown on white. */
export function Eyebrow({ children, wave = true }: { children: ReactNode; wave?: boolean }) {
  return (
    <span className="eyebrow">
      {wave && <WaveMark />}
      {children}
    </span>
  )
}

/** Full-width wave from white into a lake mist section */
export const WaveDivider = () => (
  <svg className="wave-divider" aria-hidden="true" viewBox="0 0 1440 40" preserveAspectRatio="none">
    <path d="M0 20 Q90 0 180 20 T360 20 T540 20 T720 20 T900 20 T1080 20 T1260 20 T1440 20 V40 H0 Z" fill="var(--lake-mist)" />
  </svg>
)

/** Layered mountains above the lake, with ripple lines on the water */
export const MountainScene = () => (
  <svg className="mountain-scene" aria-hidden="true" viewBox="0 0 1440 520" preserveAspectRatio="none">
    <polygon points="0,360 220,170 380,290 560,110 760,300 940,150 1120,280 1300,130 1440,240 1440,520 0,520" fill="#3D6A5D" />
    <polygon points="0,420 300,300 520,400 760,280 1000,390 1240,300 1440,380 1440,520 0,520" fill="#24443B" />
    <rect x="0" y="430" width="1440" height="90" fill="var(--lake)" />
    <line x1="80" y1="458" x2="420" y2="458" stroke="var(--lake-foam)" strokeWidth="2" opacity="0.6" />
    <line x1="620" y1="474" x2="1100" y2="474" stroke="var(--lake-foam)" strokeWidth="2" opacity="0.45" />
    <line x1="1180" y1="494" x2="1400" y2="494" stroke="var(--lake-foam)" strokeWidth="2" opacity="0.35" />
  </svg>
)

/** Header of the subpages: the hero in small, with the mountains and the lake */
export function PageHeader({ eyebrow, title, children }: { eyebrow: string; title: string; children?: ReactNode }) {
  return (
    <section className="page-header">
      <MountainScene />
      <div className="container page-header-content">
        <Eyebrow wave={false}>{eyebrow}</Eyebrow>
        <h1>{title}</h1>
        {children}
      </div>
    </section>
  )
}
