import type { StrokeOptions } from "perfect-freehand";

export type Point = [x: number, y: number];
export type SignaturePoints = Record<string, Point[]>;

export interface SignatureProps {
  options?: StrokeOptions;
  readonly?: boolean;
  defaultPoints?: SignaturePoints;
}

export interface SignatureExposed {
  svg: SVGSVGElement | null;
  clear: () => void;
}

export interface CanvasSignatureExposed {
  canvas: HTMLCanvasElement | null;
  clear: () => void;
}

export interface SignaturePathSlotProps {
  d: string;
  key: string;
  points: Point[];
  index: number;
}

export type { StrokeOptions };
