"use client";

import { MouseEvent } from "react";

import {
  IStoreSiteBlockButton,
  blockButtonHref,
} from "../../../../shared/business/store-sites/store-site-blocks";
import StoreSitesEnum from "../../../../shared/business/store-sites/store-sites.enum";
import { readableOver } from "../SiteThemeVars";
import useSiteT from "../useSiteT";
import FeatureIcon from "./FeatureIcon";
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

  const label: string | null = button.label?.trim() || null;

  // With nothing to say and nothing to show, there is no button.
  if (hasNoDefaultLabel && !label && !button.icon) {
    return null;
  }

  // An icon alone is a button: it says where it goes to who cannot see it.
  const isIconOnly: boolean = !!button.icon && !label && !!hasNoDefaultLabel;

  const isExternal: boolean = /^https?:/.test(href);
  const isOutline: boolean =
    button.variant === StoreSitesEnum.ButtonVariant.OUTLINE;

  return (
    <a
      className={`${styles.siteButton} ${isOutline ? styles.outline : ""} ${
        className ?? ""
      }`}
      style={
        // Its own colour takes the place of the site's main one, here only.
        button.color
          ? ({
              ...style,
              "--site-primary": button.color,
              "--site-on-primary": readableOver(button.color),
            } as React.CSSProperties)
          : style
      }
      href={href}
      data-shine={isOutline ? undefined : true}
      data-icon-only={isIconOnly || undefined}
      aria-label={isIconOnly ? href : undefined}
      {...(isExternal ? { target: "_blank", rel: "noreferrer" } : {})}
      onClick={(event: MouseEvent<HTMLAnchorElement>) => {
        if (context.mode === "preview") {
          event.preventDefault();
        }
      }}
    >
      {button.icon && <FeatureIcon icon={button.icon} />}
      {!isIconOnly && (button.label ?? t("storeSite.blocks.ctaButton"))}
    </a>
  );
};

export default SiteButton;
