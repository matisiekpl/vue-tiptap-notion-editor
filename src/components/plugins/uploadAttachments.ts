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
                    const { id, pos, filename } = action.add;

                    const placeholder = document.createElement("div");
                    placeholder.setAttribute("class", "attachment-placeholder");
                    const container = document.createElement("div");
                    container.setAttribute(
                        "class",
                        "rounded-md border border-stone-200 px-3 py-2 text-sm text-stone-700 bg-white inline-flex items-center gap-2"
                    );
                    const icon = document.createElement("span");
                    icon.textContent = "📎";
                    const text = document.createElement("span");
                    text.textContent = filename || "Uploading file...";
                    container.appendChild(icon);
                    container.appendChild(text);
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
        },
    });
    view.dispatch(tr);

    handleAttachmentUpload(context, file).then((url) => {
        const { schema } = view.state;

        let fromPos = findPlaceholder(view.state, id);
        if (fromPos == null) return;

        const node = schema.nodes.attachment.create({ href: url, title: file.name });
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


