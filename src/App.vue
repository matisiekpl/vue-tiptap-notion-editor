<script setup lang="ts">
import {provide, ref} from "vue";
import Editor from "./components/Editor.vue";
import {Editor as EditorClass} from "@tiptap/core";
import {defaultEditorContent} from "./lib/default-content";

const editor = ref<{ editor: EditorClass }>();

function wait(ms, value) {
  return new Promise(resolve => setTimeout(resolve, ms, value));
}

async function onUpload() {
  await wait(1000, 0);
  return 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e2/Patinhas_esteve_aqui_-_Estadio_do_Cerecamp_4_-_panoramio.jpg/120px-Patinhas_esteve_aqui_-_Estadio_do_Cerecamp_4_-_panoramio.jpg';
}

const content = ref(defaultEditorContent);
const contentHTML = ref('');
</script>

<template>
  <div class="m-4">
    <div class="p-4 border">
      {{ content }}
    </div>
    <div class="p-4 border">
      {{ contentHTML }}
    </div>
    <div class="border p-4">
      <Editor ref="editor" v-model:content="content" v-model:content-html="contentHTML" :upload="onUpload"/>
    </div>
  </div>
</template>

<style scoped></style>
