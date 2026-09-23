import { mount } from "@vue/test-utils";
import { nextTick } from "vue";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import CanvasSignature from "../src/canvas";
import type { CanvasSignatureExposed, SignaturePoints } from "../src/types";

const initialPoints: SignaturePoints = {
  saved: [
    [12, 18],
    [34, 41],
    [56, 20],
  ],
};

const context = {
  setTransform: vi.fn(),
  clearRect: vi.fn(),
  fill: vi.fn(),
  fillStyle: "",
};

function pointerEvent(type: string, x: number, y: number, pointerId = 1) {
  const event = new Event(type, { bubbles: true, cancelable: true }) as PointerEvent;
  Object.defineProperties(event, {
    clientX: { value: x },
    clientY: { value: y },
    pointerId: { value: pointerId },
    button: { value: 0 },
  });
  return event;
}

describe("CanvasSignature", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "Path2D",
      class Path2DMock {
        constructor(readonly path: string) {}
      },
    );
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(
      context as unknown as CanvasRenderingContext2D,
    );
    vi.spyOn(HTMLCanvasElement.prototype, "getBoundingClientRect").mockReturnValue({
      left: 10,
      top: 20,
      width: 300,
      height: 160,
      right: 310,
      bottom: 180,
      x: 10,
      y: 20,
      toJSON: () => ({}),
    } as DOMRect);
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("draws preloaded strokes to the Canvas context", () => {
    mount(CanvasSignature, { props: { defaultPoints: initialPoints } });

    expect(context.fill).toHaveBeenCalledTimes(1);
    expect(context.clearRect).toHaveBeenCalled();
  });

  it("emits the completed stroke points and redraws after options change", async () => {
    const wrapper = mount(CanvasSignature, { props: { options: { size: 3 } } });
    const canvas = wrapper.element;
    canvas.dispatchEvent(pointerEvent("pointerdown", 30, 50));
    document.dispatchEvent(pointerEvent("pointermove", 50, 80));
    document.dispatchEvent(pointerEvent("pointerup", 50, 80));
    await nextTick();

    expect(wrapper.emitted("stroke")).toEqual([
      [
        [
          [20, 30],
          [40, 60],
        ],
      ],
    ]);
    expect(context.fill).toHaveBeenCalled();

    const previousFillCount = context.fill.mock.calls.length;
    await wrapper.setProps({ options: { size: 12 } });
    expect(context.fill.mock.calls.length).toBeGreaterThan(previousFillCount);
  });

  it("blocks pointer input in readonly mode and clears strokes through its ref", async () => {
    const wrapper = mount(CanvasSignature, { props: { defaultPoints: initialPoints, readonly: true } });
    wrapper.element.dispatchEvent(pointerEvent("pointerdown", 30, 50));
    document.dispatchEvent(pointerEvent("pointerup", 30, 50));

    expect(wrapper.emitted("stroke")).toBeUndefined();
    (wrapper.vm as unknown as CanvasSignatureExposed).clear();
    await nextTick();

    expect(context.clearRect.mock.calls.length).toBeGreaterThanOrEqual(3);
    expect(context.fill).toHaveBeenCalledTimes(1);
  });
});
