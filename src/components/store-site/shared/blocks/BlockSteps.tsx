import { IStoreSiteBlockItem } from "../../../../shared/business/store-sites/store-site-blocks";
import styles from "./SiteBlocks.module.css";
import { IBlockProps } from "./blockTypes";

/** How it works: numbered steps joined by a line. */
const BlockSteps = ({ block, step }: IBlockProps) => (
  <ol className={styles.steps}>
    {block.items.map((item: IStoreSiteBlockItem, index: number) => (
      <li key={item.key} className={`${styles.stepItem} ${styles.item}`} style={step(index)}>
        <span className={styles.stepNumber}>
          {String(index + 1).padStart(2, "0")}
        </span>
        <div>
          {item.title && <h3 className={styles.itemTitle}>{item.title}</h3>}
          {item.text && <p className={styles.itemText}>{item.text}</p>}
        </div>
      </li>
    ))}
  </ol>
);

export default BlockSteps;
