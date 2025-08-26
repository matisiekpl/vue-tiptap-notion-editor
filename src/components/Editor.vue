<script setup lang="ts">
import {type PropType, watchEffect, ref} from "vue";
import {EditorContent, Extension, useEditor,} from "@tiptap/vue-3";
import {EditorProps} from "@tiptap/pm/view";
import {defaultExtensions} from "./extensions";
import {defaultEditorProps} from "../lib/props";
import BubbleMenu from "../components/BubbleMenu/index.vue";
import {Toaster} from "sonner";

const props = defineProps({
  extensions: {
    type: Array as PropType<Extension[]>,
    default: [],
  },
  editorProps: {
    type: Object as PropType<EditorProps>,
    default: {},
  },
  content: {},
  contentHtml: {},
  modelModifiers: {default: () => ({})}
});
const emit = defineEmits(['update:content', 'update:contentHtml']);

const editor = useEditor({
  extensions: [...defaultExtensions, ...props.extensions] as any,
  editorProps: {
    ...defaultEditorProps,
    ...props.editorProps,
  },
  onUpdate: (e) => {
    emit('update:content', e.editor.getJSON());
    emit('update:contentHtml', e.editor.getHTML());
  },
  autofocus: "end",
});

defineExpose({
  editor,
});

const hydrated = ref(false);
watchEffect(() => {
  if (editor.value && props.content && !hydrated.value) {
    editor.value.commands.setContent(props.content);
    hydrated.value = true;
  }
});
</script>

<template>
  <div @click="editor?.chain().focus().run()">
    <BubbleMenu v-if="editor" :editor="editor"/>
    <EditorContent :editor="editor"/>
  </div>
  <Toaster/>
</template>

<style scoped></style>
