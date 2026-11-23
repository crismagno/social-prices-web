import { IStoreSiteBlockItem } from "../../../../shared/business/store-sites/store-site-blocks";
import { getImageUrl } from "../../../../shared/utils/images/images-url";
import styles from "./SiteBlocks.module.css";
import { IBlockProps } from "./blockTypes";

const ROW_UP_TO = 5;

const Logo = ({ item }: { item: IStoreSiteBlockItem }) => (
  <div className={styles.logo} title={item.title ?? undefined}>
    {item.imageUrl ? (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={getImageUrl(item.imageUrl)}
        alt={item.title ?? ""}
        loading="lazy"
      />
    ) : (
      <span className={styles.logoName}>{item.title}</span>
    )}
  </div>
);

/**
 * Tools, brands or partners. Up to five in a row; more scroll past without
 * end, the copy that makes the loop hidden from screen readers.
 */
const BlockLogos = ({ block, step }: IBlockProps) => {
  if (block.items.length <= ROW_UP_TO) {
    return (
      <div className={styles.logoRow}>
        {block.items.map((item: IStoreSiteBlockItem, index: number) => (
          <div key={item.key} className={styles.item} style={step(index)}>
            <Logo item={item} />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={`${styles.marquee} ${styles.item}`} style={step(0)}>
      <div className={styles.marqueeTrack}>
        {[0, 1].map((copy: number) => (
          <div
            key={copy}
            className={styles.marqueeGroup}
            aria-hidden={copy === 1 || undefined}
          >
            {block.items.map((item: IStoreSiteBlockItem) => (
              <Logo key={`${copy}-${item.key}`} item={item} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default BlockLogos;
