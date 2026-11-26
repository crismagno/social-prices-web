"use client";

import {
  IStoreSiteFooter,
  IStoreSiteFooterLink,
  siteFooterOf,
  isSafeFooterUrl,
} from "../../../shared/business/store-sites/store-site-footer";
import {
  IStoreSiteFaqItem,
  IStoreSitePage,
} from "../../../shared/business/store-sites/store-site-pages";
import StoreSitesEnum from "../../../shared/business/store-sites/store-sites.enum";
import Reveal from "./Reveal";
import SiteAbout, { TSiteAboutVariant } from "./SiteAbout";
import SiteContactForm from "./SiteContactForm";
import { SiteFooterLink } from "./SiteFooter";
import styles from "./SitePageBody.module.css";
import useSiteT from "./useSiteT";

interface Props {
  page: IStoreSitePage;
  variant: TSiteAboutVariant;
  titleClassName?: string;
  /** Where the ways to talk to the store come from. */
  footer: Partial<IStoreSiteFooter> | null | undefined;
  /** The site the contact form writes to. */
  slug: string;
  /** The editor: the contact form sends nothing. */
  isPreview: boolean;
}

/** The links of the footer that are a way to talk to the store. */
const CONTACT_TYPES: StoreSitesEnum.FooterLinkType[] = [
  StoreSitesEnum.FooterLinkType.WHATSAPP,
  StoreSitesEnum.FooterLinkType.EMAIL,
  StoreSitesEnum.FooterLinkType.PHONE,
  StoreSitesEnum.FooterLinkType.TELEGRAM,
];

/**
 * What a page shows below its top, for the pages that are not a part of the
 * home: the owner's own pages (their texts and an image or a video, in the
 * look of the template), the support page (its words, its questions, and
 * the ways to talk to the store the footer already lists) and the contact
 * page (its words, a form that writes to the store, and those same ways).
 */
const SitePageBody = ({
  page,
  variant,
  titleClassName,
  footer,
  slug,
  isPreview,
}: Props) => {
  const t = useSiteT();

  const isSupport: boolean = page.type === StoreSitesEnum.SitePageType.SUPPORT;

  const isContact: boolean = page.type === StoreSitesEnum.SitePageType.CONTACT;

  if (
    page.type !== StoreSitesEnum.SitePageType.CUSTOM &&
    !isSupport &&
    !isContact
  ) {
    return null;
  }

  const contacts: IStoreSiteFooterLink[] =
    isSupport || isContact
      ? siteFooterOf(footer).links.filter(
          (link: IStoreSiteFooterLink) =>
            CONTACT_TYPES.includes(link.type) && isSafeFooterUrl(link.url),
        )
      : [];

  return (
    <>
      <SiteAbout
        about={{
          isActive: true,
          title: page.content.title ?? null,
          texts: page.content.texts,
          media: page.content.media,
          mediaPosition: page.content.mediaPosition,
        }}
        storeAbout={null}
        defaultTitle={page.title ?? page.label ?? ""}
        variant={variant}
        titleClassName={titleClassName}
        // The top of the page already names it: only the owner's own heading.
        isTitleHidden={!page.content.title?.trim()}
      />

      {isSupport && (page.faq.length > 0 || contacts.length > 0) && (
        <section className={styles.support}>
          {page.faq.length > 0 && (
            <Reveal effect="up">
              <h2 className={`${styles.heading} ${titleClassName ?? ""}`}>
                {t("storeSite.support.faq")}
              </h2>
              <div className={styles.faq}>
                {page.faq.map((item: IStoreSiteFaqItem, index: number) => (
                  <details
                    key={index}
                    className={styles.question}
                    data-part={String(Math.min(index, 4))}
                  >
                    <summary>{item.question}</summary>
                    {item.answer && (
                      <p className={styles.answer}>{item.answer}</p>
                    )}
                  </details>
                ))}
              </div>
            </Reveal>
          )}

          {contacts.length > 0 && (
            <Reveal effect="up">
              <h2 className={`${styles.heading} ${titleClassName ?? ""}`}>
                {t("storeSite.support.contact")}
              </h2>
              <ul className={styles.contacts}>
                {contacts.map((link: IStoreSiteFooterLink) => (
                  <SiteFooterLink key={link.key} link={link} />
                ))}
              </ul>
            </Reveal>
          )}
        </section>
      )}

      {isContact && (
        <section className={styles.support}>
          <Reveal effect="up">
            <h2 className={`${styles.heading} ${titleClassName ?? ""}`}>
              {t("storeSite.contact.formTitle")}
            </h2>
            <SiteContactForm slug={slug} isPreview={isPreview} />
          </Reveal>

          {contacts.length > 0 && (
            <Reveal effect="up">
              <h2 className={`${styles.heading} ${titleClassName ?? ""}`}>
                {t("storeSite.contact.others")}
              </h2>
              <ul className={styles.contacts}>
                {contacts.map((link: IStoreSiteFooterLink) => (
                  <SiteFooterLink key={link.key} link={link} />
                ))}
              </ul>
            </Reveal>
          )}
        </section>
      )}
    </>
  );
};

export default SitePageBody;
