import { getImageUrl } from "../../../../shared/utils/images/images-url";
import { IStoreSiteBlockItem } from "../../../../shared/business/store-sites/store-site-blocks";
import styles from "./SiteBlocks.module.css";
import { IBlockProps } from "./blockTypes";

const initialsOf = (name: string | null): string =>
  (name ?? "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word: string) => word[0].toUpperCase())
    .join("");

/** The people of the company: a photo (or their initials), name and role. */
const BlockTeam = ({ block, step }: IBlockProps) => (
  <div className={`${styles.grid} ${styles.teamGrid}`}>
    {block.items.map((item: IStoreSiteBlockItem, index: number) => (
      <article
        key={item.key}
        className={`${styles.card} ${styles.person} ${styles.item}`}
        style={step(index)}
      >
        <div className={styles.photo}>
          {item.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={getImageUrl(item.imageUrl)} alt="" loading="lazy" />
          ) : (
            <span className={styles.initials}>{initialsOf(item.title)}</span>
          )}
        </div>
        {item.title && <h3 className={styles.itemTitle}>{item.title}</h3>}
        {item.subtitle && <p className={styles.role}>{item.subtitle}</p>}
        {item.text && <p className={styles.itemText}>{item.text}</p>}
      </article>
    ))}
  </div>
);

export default BlockTeam;
