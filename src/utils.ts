import type { CSSProperties } from "vue";
import { getStroke } from "perfect-freehand";
import type { Point } from "./types";

export const defaultOptions = {
  size: 6,
  smoothing: 0.46,
  thinning: 0.73,
  streamline: 0.5,
  easing: (value: number) => value,
  start: {
    taper: 0,
    easing: (value: number) => value,
    cap: true,
  },
  end: {
    taper: 0,
    easing: (value: number) => value,
    cap: true,
  },
};

export const defaultSvgStyle: CSSProperties = {
  "--vue-signature-background": "#fff",
  touchAction: "none",
  position: "relative",
  width: "100%",
  height: "100%",
  backgroundColor: "var(--vue-signature-background)",
};

export const defaultCanvasStyle: CSSProperties = {
  "--vue-signature-background": "#fff",
  touchAction: "none",
  position: "relative",
  width: "100%",
  height: "100%",
  backgroundColor: "var(--vue-signature-background)",
};

export function getSvgPathFromStroke(stroke: number[][]): string {
  if (stroke.length === 0) return "";

  const commands = stroke.reduce<string[]>(
    (result, [x0, y0], index, points) => {
      const [x1, y1] = points[(index + 1) % points.length];
      result.push(String(x0), String(y0), String((x0 + x1) / 2), String((y0 + y1) / 2));
      return result;
    },
    ["M", String(stroke[0][0]), String(stroke[0][1]), "Q"],
  );

  commands.push("Z");
  return commands.join(" ");
}

export function getSignaturePath(points: Point[], options?: Parameters<typeof getStroke>[1]): string {
  return getSvgPathFromStroke(getStroke(points, { ...defaultOptions, ...options }));
}

export function getPoint(event: PointerEvent, element: SVGSVGElement | HTMLCanvasElement): Point {
  const bounds = element.getBoundingClientRect();
  return [event.clientX - bounds.left, event.clientY - bounds.top];
}
