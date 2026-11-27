"use client";

import {
  ReactNode,
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";

import { Button, Divider, Input, Popover, Select, Tooltip, theme } from "antd";

import {
  AlignCenterOutlined,
  AlignLeftOutlined,
  AlignRightOutlined,
  BoldOutlined,
  ClearOutlined,
  CodeOutlined,
  HighlightOutlined,
  ItalicOutlined,
  LineOutlined,
  LinkOutlined,
  MenuOutlined,
  OrderedListOutlined,
  RedoOutlined,
  SmileOutlined,
  StrikethroughOutlined,
  UnderlineOutlined,
  UndoOutlined,
  UnorderedListOutlined,
} from "@ant-design/icons";
import Highlight from "@tiptap/extension-highlight";
import TextAlign from "@tiptap/extension-text-align";
import { Placeholder } from "@tiptap/extensions";
import { Editor, EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

import useLanguageData from "../../../data/context/language/useLanguageData";
import {
  richTextToPlain,
  toRichHtml,
} from "../../../shared/utils/rich-text/rich-text";
import EmojiPanel from "../EmojiPicker/EmojiPanel";
import styles from "./RichText.module.css";

interface Props {
  value: string | null | undefined;
  /** The HTML of the editor; empty when nothing was written. */
  onChange: (html: string) => void;
  placeholder?: string;
  disabled?: boolean;
  /**
   * "chat" leaves out what no chat shows (headings, alignment, underline,
   * highlight): for texts sent through the channels.
   */
  variant?: "full" | "chat";
  /** Shows how many characters the words take, against this limit. */
  maxLength?: number;
}

/** What a form can do in the editor from outside it. */
export interface IRichTextEditorHandle {
  /** Puts the text where the cursor is (a field of a quick message). */
  insert: (text: string) => void;
}

type TBlock = "p" | "h2" | "h3" | "h4";

/** The kind of block the cursor is in, for the picker of the toolbar. */
const blockOf = (editor: Editor): TBlock =>
  editor.isActive("heading", { level: 2 })
    ? "h2"
    : editor.isActive("heading", { level: 3 })
      ? "h3"
      : editor.isActive("heading", { level: 4 })
        ? "h4"
        : "p";

/**
 * A text editor for descriptions and details: headings, bold, italic,
 * underline, strikethrough, highlight, lists, quotes, alignment, links and
 * emojis. It writes HTML, which the API cleans when it is saved. A text typed
 * before the editor existed opens with its paragraphs and line breaks.
 */
const RichTextEditor = forwardRef<IRichTextEditorHandle, Props>(
  function RichTextEditor(
    {
      value,
      onChange,
      placeholder,
      disabled = false,
      variant = "full",
      maxLength,
    }: Props,
    ref,
  ) {
    const isChat: boolean = variant === "chat";

    const { t } = useLanguageData();

    const { token } = theme.useToken();

    // What the editor sent last: a value coming back the same is not reloaded,
    // so the cursor stays where it is while typing.
    const lastSent = useRef<string>(toRichHtml(value));

    const [linkUrl, setLinkUrl] = useState<string>("");
    const [isLinkOpen, setIsLinkOpen] = useState<boolean>(false);

    const editor: Editor | null = useEditor({
      // Drawn only in the browser: the page may be rendered on the server.
      immediatelyRender: false,
      // The toolbar shows what is on where the cursor is.
      shouldRerenderOnTransaction: true,
      editable: !disabled,
      content: toRichHtml(value),
      extensions: [
        StarterKit.configure({
          heading: { levels: [2, 3, 4] },
          codeBlock: false,
          link: {
            openOnClick: false,
            autolink: true,
            defaultProtocol: "https",
            protocols: ["http", "https", "mailto", "tel"],
          },
        }),
        Highlight,
        TextAlign.configure({ types: ["heading", "paragraph"] }),
        Placeholder.configure({ placeholder: placeholder ?? "" }),
      ],
      editorProps: {
        attributes: { class: `${styles.rich} ${styles.editable}` },
      },
      onUpdate: ({ editor: current }) => {
        const html: string = current.isEmpty ? "" : current.getHTML();

        lastSent.current = html;
        onChange(html);
      },
    });

    // A value set from outside (the form loaded the product) replaces what is
    // shown; the editor's own changes coming back do not.
    useEffect(() => {
      const next: string = toRichHtml(value);

      if (!editor || next === lastSent.current) {
        return;
      }

      lastSent.current = next;
      editor.commands.setContent(next, { emitUpdate: false });
    }, [editor, value]);

    useEffect(() => {
      editor?.setEditable(!disabled);
    }, [editor, disabled]);

    useImperativeHandle(
      ref,
      () => ({
        insert: (text: string) =>
          editor?.chain().focus().insertContent(text).run(),
      }),
      [editor],
    );

    if (!editor) {
      return (
        <div
          className="min-h-[148px] rounded-md"
          style={{ border: `1px solid ${token.colorBorder}` }}
        />
      );
    }

    const tool = (
      key: string,
      icon: ReactNode,
      isActive: boolean,
      run: () => void,
      canRun: boolean = true,
    ) => (
      <Tooltip key={key} title={t(`richText.${key}`)}>
        <Button
          type={isActive ? "primary" : "text"}
          size="small"
          icon={icon}
          aria-label={t(`richText.${key}`)}
          aria-pressed={isActive}
          disabled={disabled || !canRun}
          // The selection stays in the text while the button is pressed.
          onMouseDown={(event) => event.preventDefault()}
          onClick={run}
        />
      </Tooltip>
    );

    const chain = () => editor.chain().focus();

    const applyLink = (): void => {
      const url: string = linkUrl.trim();

      if (url) {
        chain().extendMarkRange("link").setLink({ href: url }).run();
      } else {
        chain().extendMarkRange("link").unsetLink().run();
      }

      setIsLinkOpen(false);
    };

    const separator = <Divider type="vertical" className="!mx-0.5 !h-5" />;

    return (
      <div
        className="rounded-md overflow-hidden"
        style={{
          border: `1px solid ${token.colorBorder}`,
          background: disabled
            ? token.colorBgContainerDisabled
            : token.colorBgContainer,
        }}
      >
        <div
          role="toolbar"
          aria-label={t("richText.toolbar")}
          className="flex flex-wrap items-center gap-0.5 px-1.5 py-1"
          style={{ borderBottom: `1px solid ${token.colorBorderSecondary}` }}
        >
          {tool(
            "undo",
            <UndoOutlined />,
            false,
            () => chain().undo().run(),
            editor.can().undo(),
          )}
          {tool(
            "redo",
            <RedoOutlined />,
            false,
            () => chain().redo().run(),
            editor.can().redo(),
          )}
          {separator}

          {!isChat && (
            <Select<TBlock>
              size="small"
              variant="borderless"
              className="w-[118px]"
              popupMatchSelectWidth={false}
              disabled={disabled}
              value={blockOf(editor)}
              aria-label={t("richText.block")}
              onChange={(block: TBlock) =>
                block === "p"
                  ? chain().setParagraph().run()
                  : chain()
                      .setHeading({ level: Number(block[1]) as 2 | 3 | 4 })
                      .run()
              }
              options={[
                { value: "p", label: t("richText.paragraph") },
                { value: "h2", label: t("richText.heading2") },
                { value: "h3", label: t("richText.heading3") },
                { value: "h4", label: t("richText.heading4") },
              ]}
            />
          )}
          {!isChat && separator}

          {tool("bold", <BoldOutlined />, editor.isActive("bold"), () =>
            chain().toggleBold().run(),
          )}
          {tool("italic", <ItalicOutlined />, editor.isActive("italic"), () =>
            chain().toggleItalic().run(),
          )}
          {!isChat &&
            tool(
              "underline",
              <UnderlineOutlined />,
              editor.isActive("underline"),
              () => chain().toggleUnderline().run(),
            )}
          {tool(
            "strike",
            <StrikethroughOutlined />,
            editor.isActive("strike"),
            () => chain().toggleStrike().run(),
          )}
          {!isChat &&
            tool(
              "highlight",
              <HighlightOutlined />,
              editor.isActive("highlight"),
              () => chain().toggleHighlight().run(),
            )}
          {tool("code", <CodeOutlined />, editor.isActive("code"), () =>
            chain().toggleCode().run(),
          )}
          {separator}

          {tool(
            "bulletList",
            <UnorderedListOutlined />,
            editor.isActive("bulletList"),
            () => chain().toggleBulletList().run(),
          )}
          {tool(
            "orderedList",
            <OrderedListOutlined />,
            editor.isActive("orderedList"),
            () => chain().toggleOrderedList().run(),
          )}
          {tool(
            "quote",
            <span className="font-serif text-base leading-none">❝</span>,
            editor.isActive("blockquote"),
            () => chain().toggleBlockquote().run(),
          )}
          {tool("divider", <LineOutlined />, false, () =>
            chain().setHorizontalRule().run(),
          )}
          {separator}

          {!isChat && (
            <>
              {tool(
                "alignLeft",
                <AlignLeftOutlined />,
                editor.isActive({ textAlign: "left" }),
                () => chain().setTextAlign("left").run(),
              )}
              {tool(
                "alignCenter",
                <AlignCenterOutlined />,
                editor.isActive({ textAlign: "center" }),
                () => chain().setTextAlign("center").run(),
              )}
              {tool(
                "alignRight",
                <AlignRightOutlined />,
                editor.isActive({ textAlign: "right" }),
                () => chain().setTextAlign("right").run(),
              )}
              {tool(
                "alignJustify",
                <MenuOutlined />,
                editor.isActive({ textAlign: "justify" }),
                () => chain().setTextAlign("justify").run(),
              )}
              {separator}
            </>
          )}

          <Popover
            trigger="click"
            open={isLinkOpen}
            onOpenChange={(open: boolean) => {
              setIsLinkOpen(open);

              if (open) {
                setLinkUrl(editor.getAttributes("link").href ?? "");
              }
            }}
            content={
              <div className="flex w-72 flex-col gap-2">
                <Input
                  autoFocus
                  size="small"
                  placeholder={t("richText.linkPlaceholder")}
                  value={linkUrl}
                  onChange={(event) => setLinkUrl(event.target.value)}
                  onPressEnter={applyLink}
                />
                <div className="flex justify-end gap-2">
                  {editor.isActive("link") && (
                    <Button
                      size="small"
                      danger
                      onClick={() => {
                        chain().extendMarkRange("link").unsetLink().run();
                        setIsLinkOpen(false);
                      }}
                    >
                      {t("richText.removeLink")}
                    </Button>
                  )}
                  <Button size="small" type="primary" onClick={applyLink}>
                    {t("richText.apply")}
                  </Button>
                </div>
              </div>
            }
          >
            <Tooltip title={t("richText.link")}>
              <Button
                type={editor.isActive("link") ? "primary" : "text"}
                size="small"
                icon={<LinkOutlined />}
                aria-label={t("richText.link")}
                disabled={disabled}
                onMouseDown={(event) => event.preventDefault()}
              />
            </Tooltip>
          </Popover>

          <Popover
            trigger="click"
            placement="bottomLeft"
            content={
              <EmojiPanel
                onPick={(emoji: string) => chain().insertContent(emoji).run()}
              />
            }
          >
            <Tooltip title={t("richText.emoji")}>
              <Button
                type="text"
                size="small"
                icon={<SmileOutlined />}
                aria-label={t("richText.emoji")}
                disabled={disabled}
                onMouseDown={(event) => event.preventDefault()}
              />
            </Tooltip>
          </Popover>

          {tool("clear", <ClearOutlined />, false, () =>
            chain().unsetAllMarks().clearNodes().run(),
          )}
        </div>

        <EditorContent editor={editor} />

        {maxLength !== undefined && (
          <div
            className="px-3 pb-1 text-right text-xs"
            style={{
              color:
                richTextToPlain(editor.getHTML()).length > maxLength
                  ? token.colorError
                  : token.colorTextTertiary,
            }}
          >
            {editor.isEmpty ? 0 : richTextToPlain(editor.getHTML()).length} /{" "}
            {maxLength}
          </div>
        )}
      </div>
    );
  },
);

export default RichTextEditor;
