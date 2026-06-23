// @ts-nocheck
"use client";

/* eslint-disable @next/next/no-img-element */

import * as React from "react";
import { jsx, jsxs } from "react/jsx-runtime";

export const f = { jsx, jsxs };
export const La = React;

export type IconProps = { size?: number; strokeWidth?: number; className?: string };

function SvgIcon({ size = 24, strokeWidth = 2, className, children }: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      {children}
    </svg>
  );
}
function qr(props: IconProps) { return <SvgIcon {...props}><path d="M4 6h16" /><path d="M4 12h16" /><path d="M4 18h16" /></SvgIcon>; }
function Lr(props: IconProps) { return <SvgIcon {...props}><path d="M18 6 6 18" /><path d="m6 6 12 12" /></SvgIcon>; }
function Hr(props: IconProps) { return <SvgIcon {...props}><path d="m3 11 9-9 9 9" /><path d="M5 10v10h14V10" /><path d="M9 20v-6h6v6" /></SvgIcon>; }
function Co(props: IconProps) { return <SvgIcon {...props}><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2Z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7Z" /></SvgIcon>; }
function Or(props: IconProps) { return <SvgIcon {...props}><circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" /></SvgIcon>; }
function Ur(props: IconProps) { return <SvgIcon {...props}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></SvgIcon>; }
function jr(props: IconProps) { return <SvgIcon {...props}><path d="m9 18 6-6-6-6" /></SvgIcon>; }
function vf(props: IconProps) { return <SvgIcon {...props}><path d="m12 3-1.9 5.1L5 10l5.1 1.9L12 17l1.9-5.1L19 10l-5.1-1.9Z" /><path d="M5 3v4" /><path d="M3 5h4" /><path d="M19 17v4" /><path d="M17 19h4" /></SvgIcon>; }
function Gr(props: IconProps) { return <SvgIcon {...props}><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3" /><path d="M12 9v4" /><path d="M12 17h.01" /></SvgIcon>; }
function Qr(props: IconProps) { return <SvgIcon {...props}><path d="M12.8 19.6A2 2 0 1 0 14 16H2" /><path d="M17.5 8a2.5 2.5 0 1 1 2 4H2" /><path d="M9.8 4.4A2 2 0 1 1 11 8H2" /></SvgIcon>; }
function _r(props: IconProps) { return <SvgIcon {...props}><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="2.5" /></SvgIcon>; }
function Kr(props: IconProps) { return <SvgIcon {...props}><path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z" /></SvgIcon>; }
function Er(props: IconProps) { return <SvgIcon {...props}><path d="M22 11.1V12a10 10 0 1 1-5.9-9.1" /><path d="m9 11 3 3L22 4" /></SvgIcon>; }
function Sr(props: IconProps) { return <SvgIcon {...props}><path d="m20 6-11 11-5-5" /></SvgIcon>; }
function Ar(props: IconProps) { return <SvgIcon {...props}><path d="m18 15-6-6-6 6" /></SvgIcon>; }

export { qr, Lr, Hr, Co, Or, Ur, jr, vf, Gr, Qr, _r, Kr, Er, Sr, Ar };
