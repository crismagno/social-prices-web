"use client";

import { LoginOutlined } from "@ant-design/icons";

import {
  IStoreSiteSignIn,
  signInDestinationPath,
  siteSignInOf,
} from "../../../shared/business/store-sites/store-site-sign-in";
import { rememberPostLoginRedirect } from "../../../shared/utils/auth/post-login-redirect";
import styles from "./SiteSignIn.module.css";
import useSiteT from "./useSiteT";

interface Props {
  signIn: Partial<IStoreSiteSignIn> | null | undefined;
  /** The store of the site: where "the conversation with the store" is. */
  storeId?: string | null;
  /** The template's own look for the button. */
  className?: string;
  /** At the top: on a narrow phone it shrinks to its icon. */
  isCompact?: boolean;
}

/**
 * The way from the site into the customer's account. It goes straight to the
 * page the owner chose; someone not signed in is asked to sign in first and is
 * then brought back to that same page.
 */
const SiteSignIn = ({ signIn, storeId, className, isCompact }: Props) => {
  const t = useSiteT();

  const { label, destination } = siteSignInOf(signIn);

  const path: string = signInDestinationPath(destination, storeId);

  const text: string = label ?? t("storeSite.signIn.default");

  return (
    <a
      href={path}
      className={`${styles.button} ${isCompact ? styles.compact : ""} ${
        className ?? ""
      }`}
      aria-label={text}
      // The login brings the customer back here only if it was told where.
      onClick={() => rememberPostLoginRedirect(path)}
    >
      <LoginOutlined aria-hidden="true" />
      <span className={styles.label}>{text}</span>
    </a>
  );
};

export default SiteSignIn;
