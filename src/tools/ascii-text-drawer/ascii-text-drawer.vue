<script setup lang="ts">
import figlet from 'figlet';
import { DEFAULT_FONT, FontLoadError, fontNames, isFontLoaded, loadFont } from './figlet-fonts';
import TextareaCopyable from '@/components/TextareaCopyable.vue';

const input = ref('Ascii ART');
const font = useStorage('ascii-text-drawer:font', DEFAULT_FONT);
const width = useStorage('ascii-text-drawer:width', 80);
const output = ref('');
const error = ref<string | null>(null);
const processing = ref(false);

watchEffect(async (onCleanup) => {
  // Read reactive deps synchronously so the effect tracks them across the await.
  const text = input.value;
  const fontName = font.value;
  const maxWidth = width.value;

  // A newer run supersedes this one: an older font that finishes downloading
  // late must not overwrite the output, error or loading state.
  let stale = false;
  onCleanup(() => {
    stale = true;
  });

  try {
    if (!isFontLoaded(fontName)) {
      processing.value = true;
      await loadFont(fontName);
      if (stale) {
        return;
      }
    }

    output.value = figlet.textSync(text, { font: fontName, width: maxWidth, whitespaceBreak: true });
    error.value = null;
  }
  catch (e) {
    if (stale) {
      return;
    }

    error.value = e instanceof FontLoadError
      ? `Could not download the "${fontName}" font. Fonts are downloaded on first use, so check your connection, or pick a font you have used before.`
      : 'Current settings resulted in error.';
  }
  finally {
    if (!stale) {
      processing.value = false;
    }
  }
});
</script>

<template>
  <c-card style="max-width: 600px;">
    <c-input-text
      v-model:value="input"
      label="Your text:"
      placeholder="Your text to draw"
      raw-text
      multiline
      rows="4"
    />

    <n-divider />

    <n-grid cols="4" x-gap="12" w-full>
      <n-gi span="2">
        <c-select
          v-model:value="font"
          label-position="top"
          label="Font:"
          :options="fontNames"
          searchable
          placeholder="Select font to use"
        />
      </n-gi>
      <n-gi span="2">
        <n-form-item label="Width:" label-placement="top" label-width="100" :show-feedback="false">
          <n-input-number v-model:value="width" min="0" max="10000" w-full placeholder="Width of the text" />
        </n-form-item>
      </n-gi>
    </n-grid>

    <n-divider />

    <div v-if="processing" flex items-center justify-center>
      <n-spin size="medium" />
      <span class="ml-2">Loading font...</span>
    </div>

    <c-alert v-else-if="error" mt-1 text-center type="error">
      {{ error }}
    </c-alert>

    <n-form-item v-else label="Ascii Art text:">
      <TextareaCopyable
        :value="output"
        mb-1 mt-1
        copy-placement="outside"
      />
    </n-form-item>
  </c-card>
</template>
