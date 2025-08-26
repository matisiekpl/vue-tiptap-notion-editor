import {Editor, Extension, Range} from "@tiptap/core";
import {VueRenderer} from "@tiptap/vue-3";
import tippy from "tippy.js";
import Suggestion from "@tiptap/suggestion";
import {
    CheckSquare,
    Code,
    Heading1,
    Heading2,
    Heading3,
    Image,
    List,
    ListOrdered,
    Text,
    TextQuote,
} from "lucide-vue-next";
import SlashCommandList from "./slashCommandList.vue";
import {startImageUpload} from "../plugins/uploadImages.ts";
import { startAttachmentUpload } from "../plugins/uploadAttachments";
import {EditorContext} from "../Editor.vue";

const Command = Extension.create({
    name: "slash-command",
    addOptions() {
        return {
            suggestion: {
                char: "/",
                command: ({
                              editor,
                              range,
                              props,
                          }: {
                    editor: Editor;
                    range: Range;
                    props: any;
                }) => {
                    props.command({editor, range});
                },
            },
        };
    },
    addProseMirrorPlugins() {
        return [
            Suggestion({
                editor: this.editor,
                ...this.options.suggestion,
            }),
        ];
    },
});

interface CommandProps {
    editor: Editor;
    range: Range;
}

export interface SuggestionItem {
    title: string;
    description: string;
    icon: any;
}


export function createSlashCommand(context: EditorContext) {
    const getSuggestionItems = ({query}: { query: string }) => {
        return [
            {
                title: "Text",
                description: "Just start typing with plain text.",
                searchTerms: ["p", "paragraph"],
                icon: Text,
                command: ({editor, range}: CommandProps) => {
                    editor
                        .chain()
                        .focus()
                        .deleteRange(range)
                        .toggleNode("paragraph", "paragraph")
                        .run();
                },
            },
            {
                title: "To-do List",
                description: "Track tasks with a to-do list.",
                searchTerms: ["todo", "task", "list", "check", "checkbox"],
                icon: CheckSquare,
                command: ({editor, range}: CommandProps) => {
                    editor.chain().focus().deleteRange(range).toggleTaskList().run();
                },
            },
            {
                title: "Heading 1",
                description: "Big section heading.",
                searchTerms: ["title", "big", "large"],
                icon: Heading1,
                command: ({editor, range}: CommandProps) => {
                    editor
                        .chain()
                        .focus()
                        .deleteRange(range)
                        .setNode("heading", {level: 1})
                        .run();
                },
            },
            {
                title: "Heading 2",
                description: "Medium section heading.",
                searchTerms: ["subtitle", "medium"],
                icon: Heading2,
                command: ({editor, range}: CommandProps) => {
                    editor
                        .chain()
                        .focus()
                        .deleteRange(range)
                        .setNode("heading", {level: 2})
                        .run();
                },
            },
            {
                title: "Heading 3",
                description: "Small section heading.",
                searchTerms: ["subtitle", "small"],
                icon: Heading3,
                command: ({editor, range}: CommandProps) => {
                    editor
                        .chain()
                        .focus()
                        .deleteRange(range)
                        .setNode("heading", {level: 3})
                        .run();
                },
            },
            {
                title: "Bullet List",
                description: "Create a simple bullet list.",
                searchTerms: ["unordered", "point"],
                icon: List,
                command: ({editor, range}: CommandProps) => {
                    editor.chain().focus().deleteRange(range).toggleBulletList().run();
                },
            },
            {
                title: "Numbered List",
                description: "Create a list with numbering.",
                searchTerms: ["ordered"],
                icon: ListOrdered,
                command: ({editor, range}: CommandProps) => {
                    editor.chain().focus().deleteRange(range).toggleOrderedList().run();
                },
            },
            {
                title: "Quote",
                description: "Capture a quote.",
                searchTerms: ["blockquote"],
                icon: TextQuote,
                command: ({editor, range}: CommandProps) =>
                    editor
                        .chain()
                        .focus()
                        .deleteRange(range)
                        .toggleNode("paragraph", "paragraph")
                        .toggleBlockquote()
                        .run(),
            },
            {
                title: "Code",
                description: "Capture a code snippet.",
                searchTerms: ["codeblock"],
                icon: Code,
                command: ({editor, range}: CommandProps) =>
                    editor.chain().focus().deleteRange(range).toggleCodeBlock().run(),
            },
            {
                title: "Image",
                description: "Upload an image from your computer.",
                searchTerms: ["photo", "picture", "media"],
                icon: Image,
                command: ({editor, range}: CommandProps) => {
                    editor.chain().focus().deleteRange(range).run();

                    const input = document.createElement("input");
                    input.type = "file";
                    input.accept = "image/*";
                    input.onchange = async () => {
                        if (input.files?.length) {
                            const file = input.files[0];
                            const pos = editor.view.state.selection.from;
                            startImageUpload(context, file, editor.view, pos);
                        }
                    };
                    input.click();
                },
            },
            {
                title: "Attachment",
                description: "Upload a file attachment.",
                searchTerms: ["file", "document", "pdf", "zip"],
                icon: Code,
                command: ({editor, range}: CommandProps) => {
                    editor.chain().focus().deleteRange(range).run();

                    const input = document.createElement("input");
                    input.type = "file";
                    input.onchange = async () => {
                        if (input.files?.length) {
                            const file = input.files[0];
                            const pos = editor.view.state.selection.from;
                            startAttachmentUpload(context, file, editor.view, pos);
                        }
                    };
                    input.click();
                },
            },
        ].filter((item) => {
            if (query.length > 0) {
                const search = query.toLowerCase();
                return (
                    item.title.toLowerCase().includes(search) ||
                    item.description.toLowerCase().includes(search) ||
                    (item.searchTerms &&
                        item.searchTerms.some((term: string) => term.includes(search)))
                );
            }
            return true;
        });
    };

    const renderItems = () => {
        let component: VueRenderer | null = null;
        let popup: any | null = null;

        return {
            onStart: (props: { editor: Editor; clientRect: DOMRect }) => {
                component = new VueRenderer(SlashCommandList, {
                    props,
                    editor: props.editor,
                });

                if (!props.clientRect) {
                    return;
                }

                // @ts-ignore
                popup = tippy("body", {
                    getReferenceClientRect: props.clientRect,
                    appendTo: () => document.body,
                    content: component.element,
                    showOnCreate: true,
                    interactive: true,
                    trigger: "manual",
                    placement: "bottom-start",
                });
            },
            onUpdate: (props: { editor: Editor; clientRect: DOMRect }) => {
                component?.updateProps(props);

                popup &&
                popup[0].setProps({
                    getReferenceClientRect: props.clientRect,
                });
            },
            onKeyDown: (props: { event: KeyboardEvent }) => {
                if (props.event.key === "Escape") {
                    popup?.[0].hide();

                    return true;
                }

                return component?.ref?.onKeyDown(props.event);
            },
            onExit: () => {
                popup?.[0].destroy();
                component?.destroy();
            },
        };
    };


    return Command.configure({
        suggestion: {
            items: getSuggestionItems,
            render: renderItems,
        },
    });
}

export default class SlashCommand {
}