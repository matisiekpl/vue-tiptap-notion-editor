import { Node } from '@tiptap/core'
import { VueNodeViewRenderer } from '@tiptap/vue-3'
import YoutubePlaceholder from './YoutubePlaceholder.vue'

export default Node.create({
  name: 'youtubePlaceholder',

  group: 'block',
  atom: true,

  parseHTML() {
    return [
      {
        tag: 'youtube-placeholder',
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['youtube-placeholder', HTMLAttributes]
  },

  addNodeView() {
    return VueNodeViewRenderer(YoutubePlaceholder)
  },
})
