<template>
  <node-view-wrapper
    class="youtube-placeholder p-4 rounded-lg flex flex-col gap-2 items-center bg-stone-100 cursor-pointer"
    @click="input?.focus()"
    @mousedown.stop
  >
    <div class="flex items-center gap-2  select-none">
      <Youtube class="w-6 h-6"/>
      <span class="font-medium">Embed YouTube Video</span>
    </div>
    <div class="flex w-full max-w-md gap-2" @click.stop>
      <input
        ref="input"
        v-model="url"
        type="text"
        placeholder="Paste YouTube link here..."
        class="file:text-foreground placeholder:text-muted-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border bg-white px-3 py-1 text-base outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm focus-visible:border-ring focus-visible:ring-ring/100 focus-visible:ring-[2px] shadow/20 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive"
        @keydown.enter="submit"
        @mousedown.stop
      />
      <button
        class="cursor-pointer inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive bg-primary text-primary-foreground shadow/20 hover:bg-primary/90 h-9 px-4 py-2 has-[>svg]:px-3"
        :disabled="!isValidYoutubeUrl"
        @click="submit"
      >
        Embed
      </button>
    </div>
  </node-view-wrapper>
</template>

<script setup lang="ts">
import {ref, computed, onMounted} from 'vue'
import {nodeViewProps, NodeViewWrapper} from '@tiptap/vue-3'
import {Youtube} from 'lucide-vue-next'

const props = defineProps(nodeViewProps)
const url = ref('')
const input = ref<HTMLInputElement | null>(null)

const isValidYoutubeUrl = computed(() => {
  return /^https?:\/\/(?:www\.)?(?:youtube\.com\/(?:watch\?.*v=|embed\/|shorts\/)|youtu\.be\/)[\w-]+/.test(url.value)
})

onMounted(() => {
  input.value?.focus()
})

const submit = () => {
  if (url.value) {
    props.editor.chain().focus().setYoutubeVideo({src: url.value}).run()
  }
}
</script>
