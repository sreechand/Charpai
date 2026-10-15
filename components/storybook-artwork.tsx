"use client";
import {useId} from "react";

export function ArtifactImage({src,alt,className}:{src:string;alt:string;className?:string}) {
 const id=`book-ink-${useId().replace(/:/g,"")}`;
 return <><svg width="0" height="0" className="folio-ink-defs" aria-hidden="true"><defs><filter id={id} colorInterpolationFilters="sRGB"><feColorMatrix type="matrix" values="0 0 0 0 0.18  0 0 0 0 0.424  0 0 0 0 0.475  -0.3189 -1.0728 -0.1083 0 1.25"/><feComposite in2="SourceGraphic" operator="in"/></filter></defs></svg>
 {/* eslint-disable-next-line @next/next/no-img-element */}
 <img className={className} src={src} alt={alt} crossOrigin="anonymous" style={{filter:`url(#${id})`}}/></>;
}
