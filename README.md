# Vue Signature

A Vue 3 signature board with SVG and Canvas renderers.

[Live playground](https://rareformlabs.github.io/vue-signature/) · [npm package](https://www.npmjs.com/package/@rareformlabs/vue-signature)

## Install

```sh
npm install @rareformlabs/vue-signature
```

Vue `^3.5.0` is a peer dependency.

## SVG signature

```vue
<script setup lang="ts">
import { ref } from "vue";
import Signature from "@rareformlabs/vue-signature";
import type { Point, SignatureExposed } from "@rareformlabs/vue-signature";

const signature = ref<SignatureExposed | null>(null);

function saveStroke(points: Point[]) {
  console.log(points);
}
</script>

<template>
  <Signature
    ref="signature"
    :options="{ size: 6, thinning: 0.7 }"
    :style="{ height: '220px' }"
    aria-label="Signature drawing area"
    @stroke="saveStroke"
  />
  <button @click="signature?.clear()">Clear</button>
</template>
```

The template ref exposes the native SVG element as `svg` and a `clear()` method. Standard SVG attributes, classes, and styles are forwarded to the element.

## Props and events

| Name            | Type                      | Default            | Description                                                                       |
| --------------- | ------------------------- | ------------------ | --------------------------------------------------------------------------------- |
| `options`       | `StrokeOptions`           | Signature defaults | Stroke shaping options from `perfect-freehand`.                                   |
| `readonly`      | `boolean`                 | `false`            | Displays the signature without accepting new input.                               |
| `defaultPoints` | `Record<string, Point[]>` | `{}`               | Initial strokes, keyed by an identifier. Read once when the component is created. |

The `stroke` event fires once when a pointer gesture ends and carries that stroke's `Point[]`. Each point is a `[x, y]` tuple in element coordinates.

Use the `path` scoped slot to customize SVG strokes. Without the slot, the component renders a filled `<path>` for each stroke.

```vue
<Signature :default-points="savedPoints">
  <template #path="{ d, key, points, index }">
    <path :d="d" :data-key="key" :data-index="index" :data-point-count="points.length" fill="rebeccapurple" />
  </template>
</Signature>
```

## Canvas signature

```vue
<script setup lang="ts">
import { ref } from "vue";
import CanvasSignature from "@rareformlabs/vue-signature/canvas";
import type { CanvasSignatureExposed, Point } from "@rareformlabs/vue-signature/canvas";

const signature = ref<CanvasSignatureExposed | null>(null);
const saveStroke = (points: Point[]) => console.log(points);
</script>

<template>
  <CanvasSignature
    ref="signature"
    width="720"
    height="240"
    :style="{ height: '240px' }"
    aria-label="Canvas signature drawing area"
    @stroke="saveStroke"
  />
  <button @click="signature?.clear()">Clear</button>
</template>
```

The Canvas entry point accepts the same `options`, `readonly`, and `defaultPoints` props and emits the same `stroke` event. Its template ref exposes the native Canvas element as `canvas` and `clear()`.

## Development

```sh
npm install
npm run dev          # interactive demo
npm test             # types, lint, formatting, and unit tests
npm run build        # ESM, CommonJS, and declarations
npm run build:demo   # GitHub Pages site
```

## License

MIT
