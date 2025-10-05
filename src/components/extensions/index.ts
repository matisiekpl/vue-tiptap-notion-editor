import StarterKit from "@tiptap/starter-kit";
import HorizontalRule from "@tiptap/extension-horizontal-rule";
import TiptapLink from "@tiptap/extension-link";
import TiptapImage from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import TiptapUnderline from "@tiptap/extension-underline";
import TextStyle from "@tiptap/extension-text-style";
import {Color} from "@tiptap/extension-color";
import TaskItem from "@tiptap/extension-task-item";
import TaskList from "@tiptap/extension-task-list";
import Document from '@tiptap/extension-document';
import {Markdown} from "tiptap-markdown";
import Highlight from "@tiptap/extension-highlight";
import {InputRule} from "@tiptap/core";
import {createSlashCommand} from "./slashExtension";
import UploadImagesPlugin from "../plugins/uploadImages.ts";
import UpdatedImage from "./updatedImage.ts";
import Attachment from "./attachment";
import {createPasteUploads} from "./pasteUploads";
import "@tiptap/extension-list";
import "@tiptap/extension-blockquote";
import "@tiptap/extension-code-block";
import "@tiptap/extension-strike";
import "@tiptap/extension-italic";
import "@tiptap/extension-heading";
import '@tiptap/extension-code';
import '@tiptap/extension-bold';
import {EditorContext} from "../Editor.vue";

const CustomDocument = Document.extend({
    content: 'heading block*',
})

export function createDefaultExtension(context: EditorContext) {
    const extensions = [
        StarterKit.configure({
            bulletList: {
                HTMLAttributes: {
                    class: "list-disc list-outside leading-2 -mt-2",
                },
            },
            orderedList: {
                HTMLAttributes: {
                    class: "list-decimal list-outside leading-2 -mt-2",
                },
            },
            listItem: {
                HTMLAttributes: {
                    class: "leading-2 -mb-2",
                },
            },
            blockquote: {
                HTMLAttributes: {
                    class: "border-l-4 border-stone-700",
                },
            },
            codeBlock: {
                HTMLAttributes: {
                    class:
                        "rounded-lg bg-stone-100 p-5 font-mono font-medium text-stone-800",
                },
            },
            code: {
                HTMLAttributes: {
                    class:
                        "rounded-lg bg-stone-200 px-1.5 py-1 font-mono font-medium text-stone-900",
                    spellcheck: "false",
                },
            },
            horizontalRule: false,
            dropcursor: {
                color: "#DBEAFE",
                width: 4,
            },
            gapcursor: false,
        }),

        HorizontalRule.extend({
            addInputRules() {
                return [
                    new InputRule({
                        find: /^(?:---|—-|___\s|\*\*\*\s)$/,
                        handler: ({state, range}) => {
                            const attributes = {};

                            const {tr} = state;
                            const start = range.from;
                            let end = range.to;

                            tr.insert(start - 1, this.type.create(attributes)).delete(
                                tr.mapping.map(start),
                                tr.mapping.map(end)
                            );
                        },
                    }),
                ];
            },
        }).configure({
            HTMLAttributes: {
                class: "!mt-4 !mb-4 border-t border-stone-300",
            },
        }),
        TiptapLink.configure({
            HTMLAttributes: {
                class:
                    "text-stone-400 underline underline-offset-[3px] hover:text-stone-600 transition-colors cursor-pointer",
            },
        }),
        TiptapImage.extend({
            addProseMirrorPlugins() {
                return [UploadImagesPlugin()];
            },
        }).configure({
            allowBase64: true,
            HTMLAttributes: {
                class: "rounded-lg !my-4",
            },
        }),
        UpdatedImage.configure({
            HTMLAttributes: {
                class: "rounded-lg !my-4",
            },
        }),
        Attachment,
        createPasteUploads(context),
        Placeholder.configure({
            placeholder: ({node}) => {
                if (context.placeholder) {
                    return context.placeholder;
                }
                if (node.type.name === "heading") {
                    return "Enter title";
                }
                return "Press '/' for blocks...";
            },
            includeChildren: true,
        }),
        TiptapUnderline,
        TextStyle,
        Color,
        Highlight.configure({
            multicolor: true,
        }),
        TaskList.configure({
            HTMLAttributes: {
                class: "not-prose pl-2",
            },
        }),
        TaskItem.configure({
            HTMLAttributes: {
                class: "flex items-start my-4",
            },
            nested: true,
        }),
        Markdown.configure({
            html: false,
            transformCopiedText: true,
        }),
        createSlashCommand(context),
    ]
    if (context.structuredDocument) extensions.push(CustomDocument);
    return extensions;
}