<script setup lang="ts">
import {ref} from "vue";
import Editor from "./components/Editor.vue";
import {Editor as EditorClass} from "@tiptap/core";
import {defaultEditorContent} from "./lib/default-content";

const editor = ref<{ editor: EditorClass }>();

const content = ref(defaultEditorContent);
const contentHTML = ref('');
</script>

<template>
  <div>
    {{ content }}
    {{ contentHTML }}
    <Editor ref="editor" v-model:content="content" v-model:content-html="contentHTML" />
  </div>
</template>

<style scoped></style>
