"use client";

import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

import { theme } from "antd";

// The room the conversation and a panel need to stand side by side. With less
// than this the panel opens over the page, as a drawer, like everywhere else.
const MIN_WIDTH_BESIDE_PX: number = 820;

// The panel takes a little more than half, within what its forms need.
const PANEL_WIDTH: string = "clamp(440px, 55%, 600px)";

interface IChatsSidePanelContext {
  // Where a panel is rendered when it fits beside the conversation.
  slot: HTMLElement | null;
  setHasPanel: (hasPanel: boolean) => void;
}

const ChatsSidePanelContext = createContext<IChatsSidePanelContext | null>(
  null,
);

interface Props {
  // The open conversation.
  children: ReactNode;
}

// The conversation with room at its right for a panel (the fast sale, the
// customer's data): the user keeps reading and answering while filling it in.
// The panel itself is whatever the conversation opens with `useChatsSidePanel`.
export default function ChatsSidePanelLayout({ children }: Props) {
  const { token } = theme.useToken();

  const wrapper = useRef<HTMLDivElement | null>(null);

  const [slot, setSlot] = useState<HTMLDivElement | null>(null);

  const [hasPanel, setHasPanel] = useState<boolean>(false);

  const [fitsBeside, setFitsBeside] = useState<boolean>(false);

  useLayoutEffect(() => {
    const element: HTMLDivElement | null = wrapper.current;

    if (!element) {
      return;
    }

    const measure = (): void =>
      setFitsBeside(element.clientWidth >= MIN_WIDTH_BESIDE_PX);

    measure();

    const observer: ResizeObserver = new ResizeObserver(measure);

    observer.observe(element);

    return () => observer.disconnect();
  }, []);

  const isBeside: boolean = hasPanel && fitsBeside;

  return (
    <ChatsSidePanelContext.Provider
      value={{ slot: fitsBeside ? slot : null, setHasPanel }}
    >
      <div ref={wrapper} className="flex h-full min-w-0 flex-1">
        <div className="h-full min-w-0 flex-1">{children}</div>

        {/* Always there, with no width until a panel is open in it. */}
        <div
          ref={setSlot}
          className="relative h-full shrink-0 overflow-hidden"
          style={{
            width: isBeside ? PANEL_WIDTH : 0,
            borderLeft: isBeside
              ? `1px solid ${token.colorBorderSecondary}`
              : undefined,
          }}
        />
      </div>
    </ChatsSidePanelContext.Provider>
  );
}

// For the conversation: says a panel is open and gives where to render it.
// `undefined` means "over the page, as a drawer": there is no room beside the
// conversation, or this screen has no such layout.
export const useChatsSidePanel = (isOpen: boolean): HTMLElement | undefined => {
  const context: IChatsSidePanelContext | null = useContext(
    ChatsSidePanelContext,
  );

  const setHasPanel = context?.setHasPanel;

  useEffect(() => {
    setHasPanel?.(isOpen);

    return () => setHasPanel?.(false);
  }, [isOpen, setHasPanel]);

  return context?.slot ?? undefined;
};
