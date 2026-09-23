import { getStroke } from "perfect-freehand";
import { defineComponent, h, onBeforeUnmount, onMounted, ref, useId, watch, type PropType } from "vue";
import { defaultCanvasStyle, defaultOptions, getPoint, getSvgPathFromStroke } from "./utils";
import type { CanvasSignatureExposed, Point, SignaturePoints } from "./types";

type ActiveStroke = {
  key: string;
  pointerId: number;
  points: Point[];
};

export default defineComponent({
  name: "CanvasSignature",
  inheritAttrs: false,
  props: {
    options: Object as PropType<Parameters<typeof getStroke>[1]>,
    readonly: Boolean,
    defaultPoints: Object as PropType<SignaturePoints>,
  },
  emits: {
    stroke: (_points: Point[]) => true,
  },
  setup(props, { attrs, emit, expose, slots }) {
    const canvas = ref<HTMLCanvasElement | null>(null);
    const strokes = ref<SignaturePoints>({ ...props.defaultPoints });
    const instanceId = useId();
    let strokeCount = 0;
    let activeStroke: ActiveStroke | null = null;
    let resizeObserver: ResizeObserver | undefined;

    function redraw() {
      const element = canvas.value;
      const context = element?.getContext("2d");
      if (!element || !context) return;

      const bounds = element.getBoundingClientRect();
      const ratio = window.devicePixelRatio || 1;
      const width = bounds.width || Number(attrs.width) || element.width / ratio || 300;
      const height = bounds.height || Number(attrs.height) || element.height / ratio || 150;
      const pixelWidth = Math.max(1, Math.round(width * ratio));
      const pixelHeight = Math.max(1, Math.round(height * ratio));

      if (element.width !== pixelWidth) element.width = pixelWidth;
      if (element.height !== pixelHeight) element.height = pixelHeight;

      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      context.clearRect(0, 0, width, height);
      context.fillStyle = "black";

      for (const points of Object.values(strokes.value)) {
        const outline = getStroke(points, { ...defaultOptions, ...props.options });
        const path = new Path2D(getSvgPathFromStroke(outline));
        context.fill(path);
      }
    }

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
      if (props.readonly || activeStroke || !canvas.value) return;
      event.preventDefault();
      const key = `${instanceId}-${++strokeCount}`;
      const points = [getPoint(event, canvas.value)];
      activeStroke = { key, pointerId: event.pointerId, points };
      updateActiveStroke(points);
    }

    function onPointerMove(event: PointerEvent) {
      if (!activeStroke || activeStroke.pointerId !== event.pointerId || !canvas.value) return;
      updateActiveStroke([...activeStroke.points, getPoint(event, canvas.value)]);
    }

    function onPointerUp(event: PointerEvent) {
      finishStroke(event);
    }

    function clear() {
      activeStroke = null;
      strokes.value = {};
      redraw();
    }

    watch([strokes, () => props.options], redraw, { deep: true, flush: "post" });

    onMounted(() => {
      document.addEventListener("pointermove", onPointerMove);
      document.addEventListener("pointerup", onPointerUp);
      document.addEventListener("pointercancel", onPointerUp);
      redraw();
      if (typeof ResizeObserver !== "undefined" && canvas.value) {
        resizeObserver = new ResizeObserver(redraw);
        resizeObserver.observe(canvas.value);
      }
    });

    onBeforeUnmount(() => {
      document.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("pointerup", onPointerUp);
      document.removeEventListener("pointercancel", onPointerUp);
      resizeObserver?.disconnect();
    });

    expose({ canvas, clear } as unknown as CanvasSignatureExposed);

    return () =>
      h(
        "canvas",
        {
          ...attrs,
          ref: canvas,
          class: ["vue-signature", attrs.class],
          style: [defaultCanvasStyle, attrs.style],
          onPointerdown: onPointerDown,
        },
        slots.default?.(),
      );
  },
});
