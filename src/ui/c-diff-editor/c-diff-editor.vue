<script setup lang="ts">
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';
import EditorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';
import { useStyleStore } from '@/stores/style.store';

const props = withDefaults(defineProps<{ options?: monaco.editor.IDiffEditorOptions }>(), { options: () => ({}) });
const { options } = toRefs(props);

// The diff editor only renders plain-text models, so we import the core editor
// API (no language contributions) and wire up just the base editor worker.
// This avoids bundling monaco's ts/css/html/json language workers (~9 MB of
// chunks), which the tool never uses. See issue #39 follow-up / CI build trim.
(globalThis as typeof globalThis & { MonacoEnvironment: monaco.Environment }).MonacoEnvironment = {
  getWorker: () => new EditorWorker(),
};

const editorContainer = ref<HTMLElement | null>(null);
let editor: monaco.editor.IStandaloneDiffEditor | null = null;

monaco.editor.defineTheme('it-tools-dark', {
  base: 'vs-dark',
  inherit: true,
  rules: [],
  colors: {
    'editor.background': '#00000000',
  },
});

monaco.editor.defineTheme('it-tools-light', {
  base: 'vs',
  inherit: true,
  rules: [],
  colors: {
    'editor.background': '#00000000',
  },
});

const styleStore = useStyleStore();

watch(
  () => styleStore.isDarkTheme,
  isDarkTheme => monaco.editor.setTheme(isDarkTheme ? 'it-tools-dark' : 'it-tools-light'),
  { immediate: true },
);

watch(
  () => options.value,
  options => editor?.updateOptions(options),
  { immediate: true, deep: true },
);

useResizeObserver(editorContainer, () => {
  editor?.layout();
});

onMounted(() => {
  if (!editorContainer.value) {
    return;
  }

  editor = monaco.editor.createDiffEditor(editorContainer.value, {
    originalEditable: true,
    minimap: {
      enabled: false,
    },
  });

  editor.setModel({
    original: monaco.editor.createModel('original text', 'txt'),
    modified: monaco.editor.createModel('modified text', 'txt'),
  });
});
</script>

<template>
  <div ref="editorContainer" h-600px />
</template>
