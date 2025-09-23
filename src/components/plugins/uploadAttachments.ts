import { toast } from "sonner";
import { EditorState, Plugin, PluginKey, TextSelection } from "@tiptap/pm/state";
import { Decoration, DecorationSet, EditorView } from "@tiptap/pm/view";
import { EditorContext } from "../Editor.vue";
import { Fragment } from "@tiptap/pm/model";

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
                    const deco = Decoration.widget(pos, placeholder, { id });
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

        let pos = findPlaceholder(view.state, id);
        if (pos == null) return;

        const attachmentNode = schema.nodes.attachment.create({ href: url, title: file.name });
        const paragraphNode = schema.nodes.paragraph.create();

        let tr = view.state.tr;

        const $pos = tr.doc.resolve(pos);
        const paragraphType = schema.nodes.paragraph;

        if ($pos.parent.type === paragraphType && $pos.parent.content.size === 0) {
            const from = $pos.before();
            const to = $pos.after();
            tr = tr.delete(from, to);
            pos = from;
        } else {
            const before = $pos.nodeBefore;
            if (before && before.type === paragraphType && before.content.size === 0) {
                const from = pos - before.nodeSize;
                tr = tr.delete(from, pos);
                pos = from;
            }
        }

        const $afterCleanupPos = tr.doc.resolve(pos);
        const shouldAddParagraph = !$afterCleanupPos.nodeAfter;

        const fragment = Fragment.fromArray(
            shouldAddParagraph ? [attachmentNode, paragraphNode] : [attachmentNode]
        );

        let transaction = tr
            .replaceWith(pos, pos, fragment)
            .setMeta(uploadAttachmentKey, { remove: { id } });

        if (shouldAddParagraph) {
            const paragraphPos = pos + attachmentNode.nodeSize + 1;
            transaction = transaction.setSelection(
                TextSelection.create(transaction.doc, paragraphPos)
            );
        }

        transaction = transaction.scrollIntoView();
        view.dispatch(transaction);
        view.focus();
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


