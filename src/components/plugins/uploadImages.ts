import {EditorState, Plugin, PluginKey, TextSelection} from "@tiptap/pm/state";
import {Decoration, DecorationSet, EditorView} from "@tiptap/pm/view";
import {EditorContext} from "../Editor.vue";
import {Fragment} from "@tiptap/pm/model";

const uploadKey = new PluginKey("upload-image");

const UploadImagesPlugin = () =>
    new Plugin({
        key: uploadKey,
        state: {
            init() {
                return DecorationSet.empty;
            },
            apply(tr, set) {
                set = set.map(tr.mapping, tr.doc);
                // See if the transaction adds or removes any placeholders
                const action = tr.getMeta(this as any);
                if (action && action.add) {
                    const {id, pos, src} = action.add;

                    const placeholder = document.createElement("div");
                    placeholder.setAttribute("class", "img-placeholder bg-white");
                    const image = document.createElement("img");
                    image.setAttribute(
                        "class",
                        "opacity-40 rounded-lg border border-stone-200"
                    );
                    image.src = src;
                    placeholder.appendChild(image);
                    const deco = Decoration.widget(pos, placeholder, {
                        id,
                    });
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

export default UploadImagesPlugin;

function findPlaceholder(state: EditorState, id: {}) {
    const decos = uploadKey.getState(state);
    const found = decos.find(null, null, (spec: any) => spec.id == id);
    return found.length ? found[0].from : null;
}

export function startImageUpload(context: EditorContext, file: File, view: EditorView, pos: number) {
    // check if the file is an image
    if (!file.type.includes("image/")) {
        return;

        // check if the file size is less than 20MB
    } else if (file.size / 1024 / 1024 > 20) {
        return;
    }

    // A fresh object to act as the ID for this upload
    const id = {};

    // Replace the selection with a placeholder
    const tr = view.state.tr;
    if (!tr.selection.empty) tr.deleteSelection();

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
        tr.setMeta(uploadKey, {
            add: {
                id,
                pos,
                src: reader.result,
            },
        });
        view.dispatch(tr);
    };

    handleImageUpload(context, file).then((src) => {
        const {schema} = view.state;

        let pos = findPlaceholder(view.state, id);
        if (pos == null) return;

        // If upload result is null/undefined, remove placeholder and do not insert image
        if (src == null) {
            const tr = view.state.tr.setMeta(uploadKey, {remove: {id}}).scrollIntoView();
            view.dispatch(tr);
            view.focus();
            return;
        }

        const imageSrc = typeof src === "object" ? reader.result : src;

        const imageNode = schema.nodes.image.create({src: imageSrc});
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

        // After potential deletions above, re-resolve position to decide if we need a trailing paragraph
        const $afterCleanupPos = tr.doc.resolve(pos);
        const shouldAddParagraph = !$afterCleanupPos.nodeAfter;

        const fragment = Fragment.fromArray(
            shouldAddParagraph ? [imageNode, paragraphNode] : [imageNode]
        );

        let transaction = tr
            .replaceWith(pos, pos, fragment)
            .setMeta(uploadKey, {remove: {id}});

        if (shouldAddParagraph) {
            const paragraphPos = pos + imageNode.nodeSize + 1;
            transaction = transaction.setSelection(
                TextSelection.create(transaction.doc, paragraphPos)
            );
        }

        transaction = transaction.scrollIntoView();
        view.dispatch(transaction);
        view.focus();
    }).catch(() => {
        // On failure, ensure the placeholder is removed
        const pos = findPlaceholder(view.state, id);
        if (pos == null) return;
        const tr = view.state.tr.setMeta(uploadKey, {remove: {id}}).scrollIntoView();
        view.dispatch(tr);
        view.focus();
    });
}

export const handleImageUpload = (context: EditorContext, file: File) => {
    return new Promise((resolve) => {
        context.onUpload(file).then(async (url) => {
            if (url == null) {
                resolve(null);
                return;
            }
            const image = new Image();
            image.src = url;
            image.onload = () => {
                resolve(url);
            };
            image.onerror = () => {
                resolve(null);
            };
        }).catch(() => resolve(null));
    });
};