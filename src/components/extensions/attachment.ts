import { Node, mergeAttributes } from "@tiptap/core";
import UploadAttachmentsPlugin from "../plugins/uploadAttachments";

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    attachment: {
      insertAttachment: (attrs: { href: string; title?: string }) => ReturnType;
    };
  }
}

const Attachment = Node.create({
  name: "attachment",

  inline: true,
  group: "inline",
  atom: true,
  selectable: true,

  addAttributes() {
    return {
      href: {
        default: null,
      },
      title: {
        default: null,
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'a[data-type="attachment"]',
        getAttrs: (dom) => {
          if (!(dom instanceof HTMLElement)) return false;
          return {
            href: dom.getAttribute("href"),
            title: dom.getAttribute("title"),
          };
        },
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    const attrs = mergeAttributes(HTMLAttributes, {
      "data-type": "attachment",
      class:
        "inline-flex items-center gap-2 rounded-md border border-stone-200 px-2 py-1 text-sm text-stone-700 bg-white",
      target: "_blank",
      rel: "noopener noreferrer",
      download: undefined,
    });

    const titleText = HTMLAttributes.title || HTMLAttributes.href || "attachment";

    return [
      "a",
      attrs,
      ["span", { class: "select-none" }, "📎"],
      ["span", {}, titleText],
    ];
  },

  addCommands() {
    return {
      insertAttachment:
        (attrs) =>
        ({ commands }) => {
          return commands.insertContent({ type: this.name, attrs });
        },
    };
  },

  addProseMirrorPlugins() {
    return [UploadAttachmentsPlugin()];
  },
});

export default Attachment;


