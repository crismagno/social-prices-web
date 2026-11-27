"use client";

import { MouseEvent } from "react";

import {
  IStoreSiteBlockButton,
  blockButtonHref,
} from "../../../../shared/business/store-sites/store-site-blocks";
import StoreSitesEnum from "../../../../shared/business/store-sites/store-sites.enum";
import useSiteT from "../useSiteT";
import styles from "./SiteBlocks.module.css";
import { IBlockContext } from "./blockTypes";

interface Props {
  button: IStoreSiteBlockButton | null;
  context: IBlockContext;
  className?: string;
  style?: React.CSSProperties;
  /**
   * Without words of its own the button says nothing, instead of the usual
   * "learn more": with nothing to say, it is not drawn.
   */
  hasNoDefaultLabel?: boolean;
}

/**
 * One button of a section, in the template's main or outline style. A button
 * that goes nowhere safe is not drawn; in the editor's preview none navigates.
 */
const SiteButton = ({
  button,
  context,
  className,
  style,
  hasNoDefaultLabel,
}: Props) => {
  const t = useSiteT();

  const href: string | null = blockButtonHref(
    button,
    context.siteSlug,
    context.pages,
  );

  if (!button || href === null) {
    return null;
  }

  if (hasNoDefaultLabel && !button.label?.trim()) {
    return null;
  }

  const isExternal: boolean = /^https?:/.test(href);
  const isOutline: boolean =
    button.variant === StoreSitesEnum.ButtonVariant.OUTLINE;

  return (
    <a
      className={`${styles.siteButton} ${isOutline ? styles.outline : ""} ${
        className ?? ""
      }`}
      style={style}
      href={href}
      data-shine={isOutline ? undefined : true}
      {...(isExternal ? { target: "_blank", rel: "noreferrer" } : {})}
      onClick={(event: MouseEvent<HTMLAnchorElement>) => {
        if (context.mode === "preview") {
          event.preventDefault();
        }
      }}
    >
      {button.label ?? t("storeSite.blocks.ctaButton")}
    </a>
  );
};

export default SiteButton;
