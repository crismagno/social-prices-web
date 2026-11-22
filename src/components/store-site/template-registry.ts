import StoreSitesEnum from "../../shared/business/store-sites/store-sites.enum";
import { IStoreSiteTemplateEntry } from "./template.types";
import Atelier from "./templates/Atelier/Atelier";
import Aurora from "./templates/Aurora/Aurora";
import Garden from "./templates/Garden/Garden";
import Impact from "./templates/Impact/Impact";
import Studio from "./templates/Studio/Studio";

/**
 * Every template of the site app. Adding one is a new folder under
 * `templates/` and a new entry here: nothing else knows the templates by name.
 */
export const TEMPLATE_REGISTRY: Record<
  StoreSitesEnum.Template,
  IStoreSiteTemplateEntry
> = {
  [StoreSitesEnum.Template.ATELIER]: {
    Component: Atelier,
    defaultTheme: {
      primary: "#b5838d",
      secondary: "#fde2e4",
      accent: "#dfe7fd",
      background: "#fdf7f2",
      text: "#5a4a52",
    },
    labelKey: "storeSite.templates.ATELIER.name",
    descriptionKey: "storeSite.templates.ATELIER.description",
  },
  [StoreSitesEnum.Template.GARDEN]: {
    Component: Garden,
    defaultTheme: {
      primary: "#6b7a5e",
      secondary: "#c98b72",
      accent: "#dfe8d8",
      background: "#faf6ee",
      text: "#4b5545",
    },
    labelKey: "storeSite.templates.GARDEN.name",
    descriptionKey: "storeSite.templates.GARDEN.description",
  },
  [StoreSitesEnum.Template.STUDIO]: {
    Component: Studio,
    defaultTheme: {
      primary: "#2f5f6e",
      secondary: "#e8785f",
      accent: "#f4b77a",
      background: "#fff8f0",
      text: "#3d4a4f",
    },
    labelKey: "storeSite.templates.STUDIO.name",
    descriptionKey: "storeSite.templates.STUDIO.description",
  },
  [StoreSitesEnum.Template.AURORA]: {
    Component: Aurora,
    defaultTheme: {
      primary: "#6a3dff",
      secondary: "#ff3d9a",
      accent: "#ffb03d",
      background: "#07060f",
      text: "#ffffff",
    },
    labelKey: "storeSite.templates.AURORA.name",
    descriptionKey: "storeSite.templates.AURORA.description",
  },
  [StoreSitesEnum.Template.IMPACT]: {
    Component: Impact,
    defaultTheme: {
      primary: "#c6ff3d",
      secondary: "#1b3bff",
      accent: "#ffffff",
      background: "#0b0b0b",
      text: "#ffffff",
    },
    labelKey: "storeSite.templates.IMPACT.name",
    descriptionKey: "storeSite.templates.IMPACT.description",
  },
};

export const getTemplateEntry = (
  templateId: StoreSitesEnum.Template,
): IStoreSiteTemplateEntry =>
  TEMPLATE_REGISTRY[templateId] ??
  TEMPLATE_REGISTRY[StoreSitesEnum.Template.ATELIER];
