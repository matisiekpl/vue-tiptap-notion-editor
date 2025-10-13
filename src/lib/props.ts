import { EditorProps } from "@tiptap/pm/view";

export const defaultEditorProps: EditorProps = {
  attributes: {
    class: `prose prose-stone dark:prose-invert prose-headings:font-title font-default focus:outline-none max-w-full`,
  },
  handleDOMEvents: {
    keydown: (_view, event) => {
      // prevent default event listeners from firing when slash command is active
      if (["ArrowUp", "ArrowDown", "Enter"].includes(event.key)) {
        const slashCommand = document.querySelector("#slash-command");
        if (slashCommand) {
          return true;
        }
      }
    },
  },
  transformPastedHTML: (html) => {
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, "text/html");

      const isBlockedColor = (value: string) => {
        const v = value.trim().toLowerCase();
        if (
          v === "white" ||
          v === "#fff" ||
          v === "#ffffff" ||
          /^rgb\(\s*255\s*,\s*255\s*,\s*255\s*\)$/.test(v)
        ) return true;

        if (
          v === "gray" ||
          v === "grey" ||
          v === "#a8a29e" ||
          /^rgb\(\s*168\s*,\s*162\s*,\s*158\s*\)$/.test(v)
        ) return true;

        return false;
      };

      const stripColorDecl = (style: string) => {
        const parts = style
          .split(";")
          .map((p) => p.trim())
          .filter(Boolean);
        const filtered = parts.filter((p) => {
          const [prop, ...rest] = p.split(":");
          if (!prop || rest.length === 0) return true;
          if (prop.trim().toLowerCase() !== "color") return true;
          const val = rest.join(":").trim();
          return !isBlockedColor(val);
        });
        return filtered.length ? filtered.join("; ") + ";" : "";
      };

      const walker = doc.createTreeWalker(doc.body, NodeFilter.SHOW_ELEMENT);
      let node = walker.currentNode as Element | null;
      while (node) {
        const styleAttr = node.getAttribute("style");
        if (styleAttr) {
          const newStyle = stripColorDecl(styleAttr);
          if (newStyle) node.setAttribute("style", newStyle);
          else node.removeAttribute("style");
        }

        if (node.hasAttribute("color")) {
          const colorVal = node.getAttribute("color") || "";
          if (isBlockedColor(colorVal)) node.removeAttribute("color");
        }

        node = walker.nextNode() as Element | null;
      }

      return doc.body.innerHTML;
    } catch (_e) {
      return html
        .replace(/color\s*:\s*(#fff(fff)?|white|rgb\(\s*255\s*,\s*255\s*,\s*255\s*\))\s*;?/gi, "")
        .replace(/color\s*:\s*(gray|grey)\s*;?/gi, "")
        .replace(/color\s*:\s*#?a8a29e\s*;?/gi, "")
        .replace(/color\s*:\s*rgb\(\s*168\s*,\s*162\s*,\s*158\s*\)\s*;?/gi, "")
        .replace(/\scolor=(["'])#?fff(?:fff)?\1/gi, "")
        .replace(/\scolor=(["'])white\1/gi, "")
        .replace(/\scolor=(["'])rgb\(\s*255\s*,\s*255\s*,\s*255\s*\)\1/gi, "")
        .replace(/\scolor=(["'])(?:gray|grey)\1/gi, "")
        .replace(/\scolor=(["'])#?a8a29e\1/gi, "")
        .replace(/\scolor=(["'])rgb\(\s*168\s*,\s*162\s*,\s*158\s*\)\1/gi, "");
    }
  },
};
