import { mount } from "@vue/test-utils";
import { h, nextTick } from "vue";
import { describe, expect, it, vi } from "vitest";
import Signature from "../src";
import type { Point, SignatureExposed, SignaturePoints } from "../src/types";

const initialPoints: SignaturePoints = {
  saved: [
    [12, 18],
    [34, 41],
    [56, 20],
  ],
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

describe("Signature", () => {
  it("renders initial points as an SVG path", () => {
    const wrapper = mount(Signature, { props: { defaultPoints: initialPoints } });

    expect(wrapper.find("svg").exists()).toBe(true);
    expect(wrapper.findAll("path")).toHaveLength(1);
    expect(wrapper.find("path").attributes("d")).not.toBe("");
  });

  it("emits the completed stroke points after pointer input", async () => {
    const wrapper = mount(Signature);
    const svg = wrapper.element;
    vi.spyOn(svg, "getBoundingClientRect").mockReturnValue({
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

    svg.dispatchEvent(pointerEvent("pointerdown", 30, 50));
    document.dispatchEvent(pointerEvent("pointermove", 50, 80));
    document.dispatchEvent(pointerEvent("pointerup", 50, 80));
    await nextTick();

    expect(wrapper.emitted("stroke")).toEqual([
      [
        [
          [20, 30],
          [40, 60],
        ] satisfies Point[],
      ],
    ]);
    expect(wrapper.findAll("path")).toHaveLength(1);
  });

  it("does not add strokes while readonly and clears existing paths through its ref", async () => {
    const wrapper = mount(Signature, { props: { defaultPoints: initialPoints, readonly: true } });
    wrapper.element.dispatchEvent(pointerEvent("pointerdown", 30, 50));
    document.dispatchEvent(pointerEvent("pointerup", 30, 50));

    expect(wrapper.emitted("stroke")).toBeUndefined();
    expect(wrapper.findAll("path")).toHaveLength(1);

    (wrapper.vm as unknown as SignatureExposed).clear();
    await nextTick();
    expect(wrapper.findAll("path")).toHaveLength(0);
  });

  it("rerenders paths when stroke options change", async () => {
    const wrapper = mount(Signature, { props: { defaultPoints: initialPoints, options: { size: 3 } } });
    const before = wrapper.find("path").attributes("d");

    await wrapper.setProps({ options: { size: 14 } });

    expect(wrapper.find("path").attributes("d")).not.toBe(before);
  });

  it("provides generated path data and stroke metadata to the path slot", () => {
    const wrapper = mount(Signature, {
      props: { defaultPoints: initialPoints },
      slots: {
        path: ({ d, key, points, index }: { d: string; key: string; points: Point[]; index: number }) =>
          h("path", { d, "data-key": key, "data-count": points.length, "data-index": index }),
      },
    });

    expect(wrapper.find("path").attributes()).toMatchObject({
      "data-key": "saved",
      "data-count": "3",
      "data-index": "0",
    });
  });
});
