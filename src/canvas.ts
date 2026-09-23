import CanvasSignature from "./CanvasSignature";

export { default as CanvasSignature } from "./CanvasSignature";
export { defaultOptions, getSignaturePath, getSvgPathFromStroke } from "./utils";
export { getStroke } from "perfect-freehand";
export type {
  CanvasSignatureExposed,
  Point,
  SignaturePoints,
  SignatureProps as CanvasSignatureProps,
  StrokeOptions,
} from "./types";

export default CanvasSignature;
