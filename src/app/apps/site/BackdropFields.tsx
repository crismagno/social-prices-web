"use client";

import { Form, InputNumber, Segmented, Slider, Space, Switch } from "antd";

import useLanguageData from "../../../data/context/language/useLanguageData";
import { IStoreSiteBackdrop } from "../../../shared/business/store-sites/store-site-backdrop";
import StoreSitesEnum from "../../../shared/business/store-sites/store-sites.enum";
import ImageField from "./ImageField";
import VideoField from "./VideoField";

interface Props {
  storeId: string;
  backdrop: IStoreSiteBackdrop;
  /**
   * The kinds on offer; all of them unless told. Where another control says
   * whether there is a backdrop at all, the plain colour is left out.
   */
  types?: StoreSitesEnum.BackdropType[];
  /** Applied to the backdrop as it is then: an upload may finish later. */
  onChange: (
    change: (current: IStoreSiteBackdrop) => Partial<IStoreSiteBackdrop>,
  ) => void;
}

const KEY = "storeSite.editor.backdrop";

const T = StoreSitesEnum.BackdropType;

const [MIN_VEIL, MAX_VEIL] = StoreSitesEnum.BACKDROP_VEIL_RANGE;

/**
 * What lies behind the site, or behind one page: its colour, images that take
 * turns or a video, with the veil that keeps the words readable, the blur and
 * the slow movement.
 */
const BackdropFields = ({
  storeId,
  backdrop,
  types = Object.values(T),
  onChange,
}: Props) => {
  const { t } = useLanguageData();

  const set = (patch: Partial<IStoreSiteBackdrop>): void =>
    onChange(() => patch);

  // Sets (or, with null, removes) the image at that place.
  const setImage = (index: number, key: string | null): void =>
    onChange((current) => {
      const imageUrls: string[] = [...current.imageUrls];

      if (key === null) {
        imageUrls.splice(index, 1);
      } else {
        imageUrls[index] = key;
      }

      return { imageUrls };
    });

  const isFull: boolean =
    backdrop.imageUrls.length >= StoreSitesEnum.MAX_BACKDROP_IMAGES;

  return (
    <>
      <Form.Item extra={t(`${KEY}.typeHints.${backdrop.type}`)}>
        <Segmented<StoreSitesEnum.BackdropType>
          block
          value={backdrop.type}
          onChange={(type) => set({ type })}
          options={types.map((type: StoreSitesEnum.BackdropType) => ({
            value: type,
            label: t(`${KEY}.types.${type}`),
          }))}
        />
      </Form.Item>

      {backdrop.type === T.IMAGES && (
        <>
          <Form.Item label={t(`${KEY}.images`)} extra={t(`${KEY}.imagesHint`)}>
            <Space direction="vertical" className="w-full">
              {backdrop.imageUrls.map((imageKey: string, index: number) => (
                <ImageField
                  key={`${index}-${imageKey}`}
                  storeId={storeId}
                  value={imageKey}
                  onChange={(next) => setImage(index, next)}
                />
              ))}
              <ImageField
                // A new, empty field each time one is filled.
                key={`new-${backdrop.imageUrls.length}`}
                storeId={storeId}
                value={null}
                disabled={isFull}
                onChange={(next) =>
                  next && setImage(backdrop.imageUrls.length, next)
                }
              />
            </Space>
          </Form.Item>
          {backdrop.imageUrls.length > 1 && (
            <Form.Item label={t("storeSite.editor.hero.slides.seconds")}>
              <InputNumber
                min={StoreSitesEnum.MIN_SLIDE_SECONDS}
                max={StoreSitesEnum.MAX_SLIDE_SECONDS}
                precision={0}
                addonAfter="s"
                value={backdrop.slideSeconds}
                onChange={(value: number | null) =>
                  set({
                    slideSeconds: value ?? StoreSitesEnum.DEFAULT_SLIDE_SECONDS,
                  })
                }
              />
            </Form.Item>
          )}
        </>
      )}

      {backdrop.type === T.VIDEO && (
        <>
          <Form.Item label={t(`${KEY}.video`)} extra={t(`${KEY}.videoHint`)}>
            <VideoField
              storeId={storeId}
              value={backdrop.videoUrl}
              onChange={(videoUrl: string | null) => set({ videoUrl })}
            />
          </Form.Item>
          <Form.Item label={t(`${KEY}.poster`)} extra={t(`${KEY}.posterHint`)}>
            <ImageField
              storeId={storeId}
              value={backdrop.posterUrl}
              onChange={(posterUrl: string | null) => set({ posterUrl })}
            />
          </Form.Item>
        </>
      )}

      {backdrop.type !== T.COLOR && (
        <>
          <Form.Item label={t(`${KEY}.veil`)} extra={t(`${KEY}.veilHint`)}>
            <Slider
              min={MIN_VEIL}
              max={MAX_VEIL}
              step={5}
              value={backdrop.veil}
              tooltip={{ formatter: (value?: number) => `${value ?? 0}%` }}
              onChange={(veil: number) => set({ veil })}
            />
          </Form.Item>

          <Form.Item label={t(`${KEY}.blur`)}>
            <Segmented<StoreSitesEnum.BackdropBlur>
              block
              value={backdrop.blur}
              onChange={(blur) => set({ blur })}
              options={Object.values(StoreSitesEnum.BackdropBlur).map(
                (blur: StoreSitesEnum.BackdropBlur) => ({
                  value: blur,
                  label: t(`${KEY}.blurs.${blur}`),
                }),
              )}
            />
          </Form.Item>

          <Form.Item className="mb-0" extra={t(`${KEY}.animatedHint`)}>
            <label className="flex items-center justify-between gap-3">
              <span>{t(`${KEY}.animated`)}</span>
              <Switch
                checked={backdrop.isAnimated}
                onChange={(isAnimated: boolean) => set({ isAnimated })}
              />
            </label>
          </Form.Item>
        </>
      )}
    </>
  );
};

export default BackdropFields;
