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

  inline: false,
  group: "block",
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
      size: {
        default: null,
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="attachment"]',
        getAttrs: (dom) => {
          if (!(dom instanceof HTMLElement)) return false;
          const anchor = dom.querySelector('a[data-role="download"]') as HTMLAnchorElement | null;
          const href = anchor?.getAttribute("href");
          const title = dom.getAttribute("data-title") || anchor?.getAttribute("title");
          const size = dom.getAttribute("data-size");
          return { href, title, size: size ? Number(size) : null };
        },
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    const sizeBytes: number | null = HTMLAttributes.size ?? null;
    const sizeText = typeof sizeBytes === "number" ? formatBytes(sizeBytes) : undefined;

    const containerAttrs = mergeAttributes(
      {
        "data-type": "attachment",
        "data-title": HTMLAttributes.title || undefined,
        "data-size": sizeBytes ?? undefined,
        class:
          "flex items-center justify-between rounded-xl border border-stone-200 px-4 py-3 bg-white",
      },
    );

    const titleText = HTMLAttributes.title || HTMLAttributes.href || "attachment";

    return [
      "div",
      containerAttrs,
      [
        "div",
        { class: "flex items-center gap-3 min-w-0" },
        [
          "div",
          {
            class:
              "w-10 h-10 rounded-md bg-stone-100 flex items-center justify-center text-stone-500",
          },
          "📄",
        ],
        [
          "div",
          { class: "min-w-0" },
          [
            "div",
            { class: "text-stone-800 text-sm font-medium truncate max-w-full" },
            titleText,
          ],
          sizeText
            ? [
                "div",
                { class: "text-stone-500 text-xs" },
                sizeText as unknown as string,
              ]
            : ["span", {}],
        ],
      ],
      [
        "a",
        {
          href: HTMLAttributes.href,
          title: titleText,
          download: "",
          target: "_blank",
          rel: "noopener noreferrer",
          "data-role": "download",
          class: "text-stone-400 hover:text-stone-600",
        },
        "⬇︎",
      ],
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

function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes < 0) return "";
  const units = ["B", "KB", "MB", "GB", "TB"];
  let i = 0;
  let num = bytes;
  while (num >= 1024 && i < units.length - 1) {
    num /= 1024;
    i++;
  }
  return `${num % 1 === 0 ? num : num.toFixed(1)} ${units[i]}`;
}


