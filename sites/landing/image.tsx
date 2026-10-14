import type { ImgHTMLAttributes } from "react";

// The standalone homepage serves the same assets directly, without Next's image endpoint.
export default function LandingImage(props: ImgHTMLAttributes<HTMLImageElement>) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img {...props} alt={props.alt || ""} loading="lazy" decoding="async" />;
}
