<script setup lang="ts">
import { computed, ref } from "vue";
import Signature from "../src";
import CanvasSignature from "../src/canvas";
import type { CanvasSignatureExposed, Point, SignatureExposed, SignaturePoints } from "../src/types";

type Renderer = "svg" | "canvas";

const renderer = ref<Renderer>("svg");
const readonly = ref(false);
const showSample = ref(false);
const size = ref(6);
const smoothing = ref(0.46);
const thinning = ref(0.73);
const streamline = ref(0.5);
const capturedStrokes = ref<Point[][]>([]);
const signature = ref<SignatureExposed | null>(null);
const canvasSignature = ref<CanvasSignatureExposed | null>(null);
const sampleRevision = ref(0);

const options = computed(() => ({
  size: size.value,
  smoothing: smoothing.value,
  thinning: thinning.value,
  streamline: streamline.value,
}));
const samplePoints: SignaturePoints = {
  sample: [
    [46, 117],
    [67, 95],
    [93, 91],
    [119, 102],
    [143, 126],
    [168, 151],
    [194, 160],
    [220, 149],
    [247, 127],
    [276, 112],
    [308, 111],
    [341, 125],
    [374, 145],
    [407, 154],
    [439, 142],
    [466, 120],
    [493, 105],
    [519, 107],
    [545, 126],
  ],
};
const initialPoints = computed(() => (showSample.value ? samplePoints : undefined));

function clearSignature() {
  signature.value?.clear();
  canvasSignature.value?.clear();
  capturedStrokes.value = [];
}

function loadSample() {
  showSample.value = true;
  sampleRevision.value += 1;
  capturedStrokes.value = [];
}

function handleStroke(points: Point[]) {
  capturedStrokes.value = [...capturedStrokes.value, points];
}
</script>

<template>
  <main class="mx-auto min-h-screen max-w-6xl px-5 py-8 sm:px-8 sm:py-12">
    <header
      class="mb-8 flex flex-col gap-5 border-b border-slate-200 pb-7 sm:flex-row sm:items-end sm:justify-between"
    >
      <div>
        <a
          class="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-indigo-700"
          href="https://github.com/RareFormLabs/vue-signature"
        >
          <span
            class="grid size-7 place-items-center rounded-lg bg-indigo-100 text-indigo-700"
            aria-hidden="true"
            >✳</span
          >
          RareFormLabs
        </a>
        <h1 class="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">Vue Signature</h1>
        <p class="mt-2 max-w-2xl text-base leading-7 text-slate-600">
          A responsive signature board for Vue 3, rendered as SVG or Canvas.
        </p>
      </div>
      <a
        class="inline-flex w-fit items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-400 hover:bg-slate-50"
        href="https://github.com/RareFormLabs/vue-signature"
      >
        View source <span aria-hidden="true">↗</span>
      </a>
    </header>

    <div class="grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
      <section class="min-w-0 rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div
          class="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 px-5 py-4 sm:px-6"
        >
          <div>
            <h2 class="font-semibold text-slate-900">Try it out</h2>
            <p class="mt-1 text-sm text-slate-500">Draw with a mouse, touch screen, or stylus.</p>
          </div>
          <div class="inline-flex rounded-lg bg-slate-100 p-1" role="tablist" aria-label="Renderer">
            <button
              class="rounded-md px-3 py-1.5 text-sm font-medium transition"
              :class="
                renderer === 'svg'
                  ? 'bg-white text-indigo-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              "
              role="tab"
              :aria-selected="renderer === 'svg'"
              @click="renderer = 'svg'"
            >
              SVG
            </button>
            <button
              class="rounded-md px-3 py-1.5 text-sm font-medium transition"
              :class="
                renderer === 'canvas'
                  ? 'bg-white text-indigo-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              "
              role="tab"
              :aria-selected="renderer === 'canvas'"
              @click="renderer = 'canvas'"
            >
              Canvas
            </button>
          </div>
        </div>

        <div class="p-4 sm:p-6">
          <div class="overflow-hidden rounded-xl border border-dashed border-slate-300 bg-slate-50">
            <Signature
              :key="`svg-${sampleRevision}`"
              ref="signature"
              v-show="renderer === 'svg'"
              :options="options"
              :readonly="readonly"
              :default-points="initialPoints"
              aria-label="Signature drawing area"
              :style="{ height: '220px', backgroundColor: 'transparent' }"
              @stroke="handleStroke"
            >
              <template #path="{ d, key }">
                <path :d="d" :data-stroke="key" fill="#4f46e5" />
              </template>
            </Signature>
            <CanvasSignature
              :key="`canvas-${sampleRevision}`"
              ref="canvasSignature"
              v-show="renderer === 'canvas'"
              :options="options"
              :readonly="readonly"
              :default-points="initialPoints"
              width="720"
              height="220"
              aria-label="Signature drawing area"
              :style="{ height: '220px', backgroundColor: 'transparent' }"
              @stroke="handleStroke"
            />
          </div>
          <p class="mt-3 text-xs text-slate-500">Your strokes stay in this browser and are not uploaded.</p>
        </div>

        <div class="flex flex-wrap gap-2 border-t border-slate-200 px-4 py-4 sm:px-6">
          <button
            class="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            @click="clearSignature"
          >
            Clear
          </button>
          <button
            class="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            @click="loadSample"
          >
            Load sample
          </button>
          <button
            class="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            :aria-pressed="readonly"
            @click="readonly = !readonly"
          >
            {{ readonly ? "Enable drawing" : "Make read-only" }}
          </button>
        </div>
      </section>

      <aside class="flex flex-col gap-6">
        <section class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 class="font-semibold text-slate-900">Stroke options</h2>
          <label class="mt-5 block text-sm font-medium text-slate-700" for="stroke-size">
            Size <span class="float-right tabular-nums text-slate-500">{{ size }}</span>
          </label>
          <input
            id="stroke-size"
            v-model.number="size"
            class="mt-3 w-full accent-indigo-600"
            type="range"
            min="1"
            max="18"
            step="1"
          />
          <label class="mt-6 block text-sm font-medium text-slate-700" for="stroke-smoothing">
            Smoothing <span class="float-right tabular-nums text-slate-500">{{ smoothing.toFixed(2) }}</span>
          </label>
          <input
            id="stroke-smoothing"
            v-model.number="smoothing"
            class="mt-3 w-full accent-indigo-600"
            type="range"
            min="0"
            max="1"
            step="0.01"
          />
          <label class="mt-6 block text-sm font-medium text-slate-700" for="stroke-thinning">
            Thinning <span class="float-right tabular-nums text-slate-500">{{ thinning.toFixed(2) }}</span>
          </label>
          <input
            id="stroke-thinning"
            v-model.number="thinning"
            class="mt-3 w-full accent-indigo-600"
            type="range"
            min="-1"
            max="1"
            step="0.01"
          />
          <label class="mt-6 block text-sm font-medium text-slate-700" for="stroke-streamline">
            Streamline
            <span class="float-right tabular-nums text-slate-500">{{ streamline.toFixed(2) }}</span>
          </label>
          <input
            id="stroke-streamline"
            v-model.number="streamline"
            class="mt-3 w-full accent-indigo-600"
            type="range"
            min="0"
            max="1"
            step="0.01"
          />
        </section>

        <section class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div class="flex items-center justify-between gap-3">
            <h2 class="font-semibold text-slate-900">Captured points</h2>
            <span class="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
              {{ capturedStrokes.length }} {{ capturedStrokes.length === 1 ? "stroke" : "strokes" }}
            </span>
          </div>
          <pre
            class="mt-4 max-h-64 overflow-auto rounded-lg bg-slate-950 p-3 text-xs leading-5 text-emerald-200"
            >{{ JSON.stringify(capturedStrokes, null, 2) }}</pre>
          <p v-if="capturedStrokes.length === 0" class="mt-3 text-xs leading-5 text-slate-500">
            Finish a stroke to see its coordinate points here.
          </p>
        </section>
      </aside>
    </div>

    <footer
      class="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-5 text-sm text-slate-500"
    >
      <span>Vue Signature · MIT License</span>
      <a
        class="font-medium text-slate-600 underline decoration-slate-300 underline-offset-4 hover:text-indigo-700"
        href="https://www.npmjs.com/package/@rareformlabs/vue-signature"
      >
        @rareformlabs/vue-signature
      </a>
    </footer>
  </main>
</template>
