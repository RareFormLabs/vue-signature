import Signature from "./Signature";

export { default as Signature } from "./Signature";
export { defaultOptions, getSignaturePath, getSvgPathFromStroke } from "./utils";
export { getStroke } from "perfect-freehand";
export type {
  Point,
  SignatureExposed,
  SignaturePathSlotProps,
  SignaturePoints,
  SignatureProps,
  StrokeOptions,
} from "./types";

export default Signature;
