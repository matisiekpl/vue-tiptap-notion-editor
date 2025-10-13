<script setup lang="ts">
import {provide, ref} from "vue";
import Editor from "./components/Editor.vue";
import {Editor as EditorClass} from "@tiptap/core";
import {defaultEditorContent} from "./lib/default-content";

const editor = ref<{ editor: EditorClass }>();

function wait(ms, value) {
  return new Promise(resolve => setTimeout(resolve, ms, value));
}

async function onUpload(_file: File) {
  await wait(1000, 0);
  return null;
  return 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e2/Patinhas_esteve_aqui_-_Estadio_do_Cerecamp_4_-_panoramio.jpg/120px-Patinhas_esteve_aqui_-_Estadio_do_Cerecamp_4_-_panoramio.jpg';
}

async function onAttachmentUpload(_file: File) {
  await wait(1000, 0);
  return 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf';
}

const content = ref(defaultEditorContent);
const contentHTML = ref('');
const title = ref('');
</script>

<template>
  <div class="m-12">
    <div class="p-4 border-t border-r border-l">
      {{ content }}
    </div>
    <div class="p-4 border">
      {{ contentHTML }}
    </div>
    <div class="p-4 border">
      {{ title }}
    </div>
    <div class="border-b border-l border-r p-4">
      <Editor ref="editor" v-model:content="content" v-model:content-html="contentHTML" v-model:title="title" :upload="onUpload"
              :on-attachment-upload="onAttachmentUpload" :structured-document="true"/>
    </div>
  </div>
</template>

<style scoped></style>
