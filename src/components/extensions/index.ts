import Blockquote from "@tiptap/extension-blockquote";
import Bold from "@tiptap/extension-bold";
import BulletList from "@tiptap/extension-bullet-list";
import Code from "@tiptap/extension-code";
import CodeBlock from "@tiptap/extension-code-block";
import Document from "@tiptap/extension-document";
import HardBreak from "@tiptap/extension-hard-break";
import Heading from "@tiptap/extension-heading";
import Highlight from "@tiptap/extension-highlight";
import {Dropcursor, Gapcursor, UndoRedo} from "@tiptap/extensions";
import HorizontalRule from "@tiptap/extension-horizontal-rule";
import Italic from "@tiptap/extension-italic";
import {Color} from "@tiptap/extension-color";
import ListItem from "@tiptap/extension-list-item";
import {Markdown} from "tiptap-markdown";
import OrderedList from "@tiptap/extension-ordered-list";
import Paragraph from "@tiptap/extension-paragraph";
import TiptapImage from "@tiptap/extension-image";
import {ListKeymap} from "@tiptap/extension-list";
import Placeholder from "@tiptap/extension-placeholder";
import Strike from "@tiptap/extension-strike";
import TaskItem from "@tiptap/extension-task-item";
import TaskList from "@tiptap/extension-task-list";
import Text from "@tiptap/extension-text";
import TextStyle from "@tiptap/extension-text-style";
import TiptapLink from "@tiptap/extension-link";
import TiptapUnderline from "@tiptap/extension-underline";
import Youtube from "@tiptap/extension-youtube";
import YoutubePlaceholder from "./YoutubePlaceholder";
import {InputRule} from "@tiptap/core";
import {createSlashCommand} from "./slashExtension";
import UploadImagesPlugin from "../plugins/uploadImages.ts";
import Attachment from "./attachment";
import {createPasteUploads} from "./pasteUploads";
import {EditorContext} from "../Editor.vue";

const CustomDocument = Document.extend({
    content: "heading block*",
});

export function createDefaultExtension(context: EditorContext) {
    const documentExtension = context.structuredDocument ? CustomDocument : Document;

    return [
        documentExtension,
        Paragraph,
        Text,
        Heading,
        Blockquote.configure({
            HTMLAttributes: {
                class: "border-l-4 border-stone-700",
            },
        }),
        BulletList.configure({
            HTMLAttributes: {
                class: "list-disc list-outside leading-2 -mt-2",
            },
        }),
        OrderedList.configure({
            HTMLAttributes: {
                class: "list-decimal list-outside leading-2 -mt-2",
            },
        }),
        ListItem.configure({
            HTMLAttributes: {
                class: "leading-2 -mb-2",
            },
        }),
        CodeBlock.configure({
            HTMLAttributes: {
                class:
                    "rounded-lg bg-stone-100 p-5 font-mono font-medium text-stone-800",
            },
        }),
        Code.configure({
            HTMLAttributes: {
                class:
                    "rounded-lg bg-stone-200 px-1.5 py-1 font-mono font-medium text-stone-900",
                spellcheck: "false",
            },
        }),
        HardBreak,
        UndoRedo,
        Dropcursor.configure({
            color: "#DBEAFE",
            width: 4,
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
        Bold,
        Italic,
        Strike,
        ListKeymap,
        TiptapLink.configure({
            HTMLAttributes: {
                class:
                    "text-stone-400 underline underline-offset-[3px] hover:text-stone-600 transition-colors cursor-pointer",
            },
        }),
        Gapcursor,
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
        Youtube.configure({
            HTMLAttributes: {
                class: "rounded-lg border border-stone-200 !my-4",
            },
        }),
        YoutubePlaceholder,
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
    ];
}