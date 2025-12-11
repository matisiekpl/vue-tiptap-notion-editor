<script setup lang="ts">
import {type PropType, watchEffect, ref} from "vue";
import {EditorContent, Extension, useEditor,} from "@tiptap/vue-3";
import {EditorProps} from "@tiptap/pm/view";
import {createDefaultExtension} from "./extensions";
import {defaultEditorProps} from "../lib/props";
import BubbleMenu from "../components/BubbleMenu/index.vue";
import {Toaster} from "sonner";
import {DragHandle} from '@tiptap/extension-drag-handle-vue-3';
import {GripVertical} from "lucide-vue-next";

export interface EditorContext {
  onUpload: (file: File) => Promise<string>;
  onAttachmentUpload: (file: File) => Promise<string>;
  structuredDocument?: boolean;
  placeholder?: string;
}

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
  title: {},
  modelModifiers: {default: () => ({})},
  upload: {},
  onAttachmentUpload: {},
  structuredDocument: {},
  placeholder: {}
});
const emit = defineEmits(['update:content', 'update:contentHtml', 'hydrated', 'ready', 'update:title']);

const editor = useEditor({
  content: props.content as string,
  extensions: [...createDefaultExtension({
    onUpload: props.upload as any,
    onAttachmentUpload: props.onAttachmentUpload as any,
    structuredDocument: props.structuredDocument as any,
    placeholder: props.placeholder as any,
  }), ...props.extensions] as any,
  editorProps: {
    ...defaultEditorProps,
    ...props.editorProps,
  },
  onUpdate: (e) => {
    emit('update:content', e.editor.getJSON());
    emit('update:contentHtml', e.editor.getHTML());
    if (props.structuredDocument) {
      // @ts-ignore
      const title = e.editor.getJSON()?.content?.[0]?.content?.[0]?.text as string | undefined ?? '';
      emit('update:title', title);
    }
  },
  onCreate: (_) => {
    emit('ready');
  },
});

defineExpose({
  editor,
});

const hydrated = ref(false);
watchEffect(() => {
  if (editor.value && props.content && !hydrated.value) {
    editor.value.commands.setContent(props.content);
    hydrated.value = true;
    emit('hydrated');
  }
});
</script>

<template>
  <div @click="editor?.chain().focus().run()" class="flex-col flex h-full">
    <BubbleMenu v-if="editor" :editor="editor"/>
    <EditorContent :editor="editor" class="cursor-text"/>
    <div class="grow w-full cursor-text"></div>
    <DragHandle v-if="editor" :editor="editor">
      <div class="relative">
        <div class="p-2 bg-white rounded-lg border mr-2 hover:brightness-90 transition-all cursor-pointer">
          <GripVertical size="12"/>
        </div>
      </div>
    </DragHandle>
  </div>
  <div class="hidden md:order-last md:order-first order-first order-last"></div>
  <Toaster/>
</template>

<style scoped></style>
