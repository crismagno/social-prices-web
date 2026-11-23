"use client";

import { useId, useState } from "react";

import { PlusOutlined } from "@ant-design/icons";

import { IStoreSiteBlockItem } from "../../../../shared/business/store-sites/store-site-blocks";
import styles from "./SiteBlocks.module.css";
import { IBlockProps } from "./blockTypes";

/** Questions and answers: one open at a time, the first one to begin with. */
const BlockFaq = ({ block, step }: IBlockProps) => {
  const baseId: string = useId();
  const [openKey, setOpenKey] = useState<string | null>(
    block.items[0]?.key ?? null,
  );

  return (
    <div className={styles.faq}>
      {block.items.map((item: IStoreSiteBlockItem, index: number) => {
        const isOpen: boolean = openKey === item.key;
        const panelId: string = `${baseId}-${item.key}`;

        return (
          <div
            key={item.key}
            className={`${styles.faqItem} ${styles.item}`}
            data-open={isOpen}
            style={step(index)}
          >
            <button
              type="button"
              className={styles.faqQuestion}
              aria-expanded={isOpen}
              aria-controls={panelId}
              onClick={() => setOpenKey(isOpen ? null : item.key)}
            >
              <span>{item.title}</span>
              <PlusOutlined className={styles.faqIcon} />
            </button>
            <div id={panelId} className={styles.faqAnswer} role="region">
              <div>
                <p>{item.text}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default BlockFaq;
