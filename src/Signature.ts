import { getStroke } from "perfect-freehand";
import {
  defineComponent,
  h,
  cloneVNode,
  onBeforeUnmount,
  onMounted,
  ref,
  useAttrs,
  useId,
  type PropType,
  type VNode,
} from "vue";
import { defaultOptions, defaultSvgStyle, getPoint, getSvgPathFromStroke } from "./utils";
import type { Point, SignatureExposed, SignaturePathSlotProps, SignaturePoints } from "./types";

type ActiveStroke = {
  key: string;
  pointerId: number;
  points: Point[];
};

export default defineComponent({
  name: "Signature",
  inheritAttrs: false,
  props: {
    options: Object as PropType<Parameters<typeof getStroke>[1]>,
    readonly: Boolean,
    defaultPoints: Object as PropType<SignaturePoints>,
  },
  emits: {
    stroke: (_points: Point[]) => true,
  },
  setup(props, { emit, expose, slots }) {
    const attrs = useAttrs();
    const svg = ref<SVGSVGElement | null>(null);
    const strokes = ref<SignaturePoints>({ ...props.defaultPoints });
    const instanceId = useId();
    let strokeCount = 0;
    let activeStroke: ActiveStroke | null = null;

    function updateActiveStroke(points: Point[]) {
      if (!activeStroke) return;
      activeStroke.points = points;
      strokes.value = { ...strokes.value, [activeStroke.key]: points };
    }

    function finishStroke(event: PointerEvent) {
      if (!activeStroke || activeStroke.pointerId !== event.pointerId) return;
      const points = activeStroke.points.map(([x, y]) => [x, y] as Point);
      activeStroke = null;
      emit("stroke", points);
    }

    function onPointerDown(event: PointerEvent) {
      if (props.readonly || activeStroke) return;
      event.preventDefault();
      const key = `${instanceId}-${++strokeCount}`;
      const points = [getPoint(event, svg.value!)];
      activeStroke = { key, pointerId: event.pointerId, points };
      updateActiveStroke(points);
    }

    function onPointerMove(event: PointerEvent) {
      if (!activeStroke || activeStroke.pointerId !== event.pointerId || !svg.value) return;
      updateActiveStroke([...activeStroke.points, getPoint(event, svg.value)]);
    }

    function onPointerUp(event: PointerEvent) {
      finishStroke(event);
    }

    function clear() {
      activeStroke = null;
      strokes.value = {};
    }

    onMounted(() => {
      document.addEventListener("pointermove", onPointerMove);
      document.addEventListener("pointerup", onPointerUp);
      document.addEventListener("pointercancel", onPointerUp);
    });

    onBeforeUnmount(() => {
      document.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("pointerup", onPointerUp);
      document.removeEventListener("pointercancel", onPointerUp);
    });

    expose({ svg, clear } as unknown as SignatureExposed);

    return () => {
      const options = { ...defaultOptions, ...props.options };
      const pathSlot = slots.path as
        | ((props: SignaturePathSlotProps) => VNode[] | VNode | undefined)
        | undefined;
      const pathNodes = Object.entries(strokes.value).map(([key, points], index) => {
        const d = getSvgPathFromStroke(getStroke(points, options));
        const slotProps: SignaturePathSlotProps = { d, key, points, index };
        const content = pathSlot?.(slotProps);
        return content
          ? (Array.isArray(content) ? content : [content]).map((node, pathIndex) =>
              cloneVNode(node, { key: node.key ?? `${key}-${pathIndex}` }),
            )
          : h("path", { d, key });
      });
      const defaultNodes = slots.default?.() ?? [];

      return h(
        "svg",
        {
          ...attrs,
          ref: svg,
          class: ["vue-signature", attrs.class],
          style: [defaultSvgStyle, attrs.style],
          onPointerdown: onPointerDown,
        },
        [...pathNodes.flat(), ...defaultNodes],
      );
    };
  },
});
