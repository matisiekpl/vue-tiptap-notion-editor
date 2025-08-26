import { toast } from "sonner";
import { EditorState, Plugin, PluginKey } from "@tiptap/pm/state";
import { Decoration, DecorationSet, EditorView } from "@tiptap/pm/view";
import { EditorContext } from "../Editor.vue";

const uploadAttachmentKey = new PluginKey("upload-attachment");

const UploadAttachmentsPlugin = () =>
    new Plugin({
        key: uploadAttachmentKey,
        state: {
            init() {
                return DecorationSet.empty;
            },
            apply(tr, set) {
                set = set.map(tr.mapping, tr.doc);
                const action = tr.getMeta(this as any);
                if (action && action.add) {
                    const { id, pos, filename, size } = action.add;

                    const placeholder = document.createElement("div");
                    placeholder.setAttribute("class", "attachment-placeholder");
                    const container = document.createElement("div");
                    container.setAttribute(
                        "class",
                        "flex items-center justify-between rounded-xl border border-stone-200 px-4 py-3 bg-white"
                    );

                    const left = document.createElement("div");
                    left.setAttribute("class", "flex items-center gap-3 min-w-0");

                    const iconWrap = document.createElement("div");
                    iconWrap.setAttribute(
                        "class",
                        "w-10 h-10 rounded-md bg-stone-100 flex items-center justify-center text-stone-500"
                    );
                    iconWrap.textContent = "📄";

                    const meta = document.createElement("div");
                    meta.setAttribute("class", "min-w-0");

                    const titleEl = document.createElement("div");
                    titleEl.setAttribute(
                        "class",
                        "text-stone-800 text-sm font-medium truncate max-w-full"
                    );
                    titleEl.textContent = filename || "Uploading file...";

                    const sizeEl = document.createElement("div");
                    sizeEl.setAttribute("class", "text-stone-500 text-xs");
                    if (size) sizeEl.textContent = formatBytes(size);

                    meta.appendChild(titleEl);
                    if (size) meta.appendChild(sizeEl);

                    left.appendChild(iconWrap);
                    left.appendChild(meta);

                    const right = document.createElement("div");
                    right.setAttribute("class", "text-stone-400");
                    right.textContent = "…";

                    container.appendChild(left);
                    container.appendChild(right);

                    placeholder.appendChild(container);
                    const deco = Decoration.widget(pos + 1, placeholder, { id });
                    set = set.add(tr.doc, [deco]);
                } else if (action && action.remove) {
                    set = set.remove(
                        set.find(undefined, undefined, (spec) => spec.id == action.remove.id)
                    );
                }
                return set;
            },
        },
        props: {
            decorations(state) {
                return this.getState(state);
            },
        },
    });

export default UploadAttachmentsPlugin;

function findPlaceholder(state: EditorState, id: {}) {
    const decos = uploadAttachmentKey.getState(state);
    const found = decos.find(null, null, (spec: any) => spec.id == id);
    return found.length ? found[0].from : null;
}

export function startAttachmentUpload(
    context: EditorContext,
    file: File,
    view: EditorView,
    pos: number
) {
    if (file.size / 1024 / 1024 > 100) {
        toast.error("File size too big (max 100MB).");
        return;
    }

    const id = {};

    const tr = view.state.tr;
    if (!tr.selection.empty) tr.deleteSelection();

    tr.setMeta(uploadAttachmentKey, {
        add: {
            id,
            pos,
            filename: file.name,
            size: file.size,
        },
    });
    view.dispatch(tr);

    handleAttachmentUpload(context, file).then((url) => {
        const { schema } = view.state;

        let fromPos = findPlaceholder(view.state, id);
        if (fromPos == null) return;

        const node = schema.nodes.attachment.create({ href: url, title: file.name, size: file.size });
        const transaction = view.state.tr
            .replaceWith(fromPos, fromPos, node)
            .setMeta(uploadAttachmentKey, { remove: { id } });
        view.dispatch(transaction);
    });
}

export const handleAttachmentUpload = (context: EditorContext, file: File) => {
    return new Promise<string>((resolve) => {
        toast.promise(
            context.onAttachmentUpload(file).then(async (url) => {
                resolve(url);
            }),
            {
                loading: "Uploading attachment...",
                success: () => "Attachment uploaded successfully.",
                error: () => "Attachment upload failed.",
            }
        );
    });
};

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


