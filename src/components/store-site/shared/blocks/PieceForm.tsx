"use client";

import StoreSitesEnum from "../../../../shared/business/store-sites/store-sites.enum";
import SiteContactForm from "../SiteContactForm";
import { IBlockProps } from "./blockTypes";
import styles from "./PieceForm.module.css";

/**
 * A form section: what the owner made it ask, its button and its box, sent
 * where the owner chose. Its heading is the section's own.
 */
const PieceForm = ({ block, step, context }: IBlockProps) => {
  if (!block.settings.form) {
    return null;
  }

  return (
    <div
      className={`${styles.piece} ${
        block.settings.align === StoreSitesEnum.SectionAlign.CENTER
          ? styles.center
          : ""
      }`}
      style={step(0)}
    >
      <SiteContactForm
        slug={context.siteSlug}
        contact={block.settings.form}
        formKey={block.key}
        isPreview={context.mode === "preview"}
      />
    </div>
  );
};

export default PieceForm;
