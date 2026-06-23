// @ts-nocheck
"use client";

import { f } from "./column-v15-icons";
import { Jr, wr, kr, $r } from "./column-v15-core";
import { Ir, Pr } from "./column-v15-sections-a";
import { l1 } from "./column-v15-sections-b1";
import { t1 } from "./column-v15-sections-b2";
import { e1 } from "./column-v15-sections-c1";
import { u1, n1 } from "./column-v15-sections-c2";
import { columnV15Css } from "./column-v15-styles";

function c1(){return f.jsxs("div",{className:"cbj-v15-page min-h-screen bg-cream",children:[f.jsx(Jr,{}),f.jsxs("main",{className:"pb-8",children:[f.jsx(wr,{}),f.jsx(kr,{}),f.jsx($r,{}),f.jsx(Ir,{}),f.jsx(Pr,{}),f.jsx(l1,{}),f.jsx(t1,{}),f.jsx(e1,{}),f.jsx(u1,{})]}),f.jsx(n1,{})]})}

export function ColumnV15ArticlePage() {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: columnV15Css }} />
      {f.jsx(c1, {})}
    </>
  );
}
