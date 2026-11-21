// What makes an antd drawer fill the element it is rendered in, instead of
// sliding over the page: no mask, no shadow, the whole width.
export const sidePanelDrawerProps = (
  container: HTMLElement | undefined,
): Record<string, unknown> =>
  container
    ? {
        getContainer: container,
        mask: false,
        width: "100%",
        rootStyle: { position: "absolute" },
        styles: { wrapper: { boxShadow: "none" } },
      }
    : {};
