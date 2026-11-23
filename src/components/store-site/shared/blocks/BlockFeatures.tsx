import { IStoreSiteBlockItem } from "../../../../shared/business/store-sites/store-site-blocks";
import FeatureIcon from "./FeatureIcon";
import styles from "./SiteBlocks.module.css";
import { IBlockProps } from "./blockTypes";

/** What makes the company different: an icon, a title and a few words each. */
const BlockFeatures = ({ block, step }: IBlockProps) => (
  <div className={`${styles.grid} ${styles.featureGrid}`}>
    {block.items.map((item: IStoreSiteBlockItem, index: number) => (
      <article
        key={item.key}
        className={`${styles.card} ${styles.feature} ${styles.item}`}
        style={step(index)}
        data-shine
      >
        <span className={styles.featureIcon}>
          <FeatureIcon icon={item.icon} />
        </span>
        {item.title && <h3 className={styles.itemTitle}>{item.title}</h3>}
        {item.text && <p className={styles.itemText}>{item.text}</p>}
      </article>
    ))}
  </div>
);

export default BlockFeatures;
