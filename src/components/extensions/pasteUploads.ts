import { Extension } from "@tiptap/core";
import { Plugin } from "@tiptap/pm/state";
import { EditorContext } from "../Editor.vue";
import { startImageUpload } from "../plugins/uploadImages";
import { startAttachmentUpload } from "../plugins/uploadAttachments";

export function createPasteUploads(context: EditorContext) {
  return Extension.create({
    name: "paste-uploads",
    addProseMirrorPlugins() {
      return [
        new Plugin({
          props: {
            handleDrop: (view, event) => {
              const dataTransfer = event.dataTransfer;
              if (!dataTransfer) return false;

              const files: File[] = Array.from(dataTransfer.files || []);

              if (!files.length && dataTransfer.items) {
                const items: DataTransferItem[] = Array.from(
                  dataTransfer.items as unknown as DataTransferItemList
                );
                for (const item of items) {
                  if (item.kind === "file") {
                    const f = item.getAsFile();
                    if (f) files.push(f);
                  }
                }
              }

              if (!files.length) return false;

              const coords = view.posAtCoords({ left: event.clientX, top: event.clientY });
              const pos = coords ? coords.pos : view.state.selection.from;

              for (const file of files) {
                if (file.type && file.type.includes("image/")) {
                  startImageUpload(context, file, view, pos);
                } else {
                  startAttachmentUpload(context, file, view, pos);
                }
              }

              event.preventDefault();
              return true;
            },
            handlePaste: (view, event) => {
              const clipboard = event.clipboardData || (window as any).clipboardData;
              if (!clipboard) return false;

              const files: File[] = Array.from(clipboard.files || []);

              if (!files.length) {
                // also check items for files (some browsers)
                const items: DataTransferItem[] = clipboard.items
                  ? Array.from(clipboard.items as unknown as DataTransferItemList)
                  : [];
                for (const item of items) {
                  if (item.kind === "file") {
                    const f = item.getAsFile();
                    if (f) files.push(f);
                  }
                }
              }

              if (!files.length) return false;

              const pos = view.state.selection.to;

              for (const file of files) {
                if (file.type && file.type.includes("image/")) {
                  startImageUpload(context, file, view, pos);
                } else {
                  startAttachmentUpload(context, file, view, pos);
                }
              }

              event.preventDefault();
              return true;
            },
          },
        }),
      ];
    },
  });
}

export default createPasteUploads;


