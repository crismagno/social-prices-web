import { useState } from "react";

import { Button, Modal, Popover, Tag } from "antd";

import useLanguageData from "../../../../data/context/language/useLanguageData";

import { QuestionCircleTwoTone } from "@ant-design/icons";

import handleClientError from "../../../../components/common/HandleClientError/HandleClientError";
import { serviceMethodsInstance } from "../../../../services/social-prices-api/service-methods";
import { ISale } from "../../../../shared/business/sales/sale.interface";

interface Props {
  sale: ISale;
  allowEvents?: boolean;
  onRemoveSale?: (sale: ISale) => void;
  onActivateSale?: (sale: ISale) => void;
}

export const SaleActiveOrDeletedTag: React.FC<Props> = ({
  sale,
  allowEvents,
  onActivateSale,
  onRemoveSale,
}) => {
  const [isVisibleDeleteSaleModal, setIsVisibleDeleteSaleModal] =
    useState<boolean>(false);
  const [isDeletingSale, setIsDeletingSale] = useState<boolean>(false);

  const [isVisibleActivateSaleModal, setIsVisibleActivateSaleModal] =
    useState<boolean>(false);

  const [isActivatingSale, setIsIsActivatingSale] = useState<boolean>(false);

  const { t } = useLanguageData();

  const isSaleDeleted: boolean = !!sale.softDelete;

  const handleDeleteSale = async () => {
    try {
      setIsDeletingSale(true);

      const response: ISale =
        await serviceMethodsInstance.salesServiceMethods.deleteManual(sale._id);

      onRemoveSale?.(response);
    } catch (error: any) {
      handleClientError(error);
    } finally {
      setIsDeletingSale(false);
      setIsVisibleDeleteSaleModal(false);
    }
  };

  const handleActivateSale = async () => {
    try {
      setIsIsActivatingSale(true);

      const response: ISale =
        await serviceMethodsInstance.salesServiceMethods.activateManual(
          sale._id
        );
      onActivateSale?.(response);
    } catch (error: any) {
      handleClientError(error);
    } finally {
      setIsIsActivatingSale(false);
      setIsVisibleActivateSaleModal(false);
    }
  };

  if (isSaleDeleted) {
    return (
      <>
        <Popover
          open={allowEvents ? undefined : false}
          title={t("sales.activateSale")}
          content={
            <div className="flex flex-col gap-4">
              <p>
                This sale is currently deleted. Do you want to activate it
                again?
              </p>

              <Button
                type="success"
                onClick={() => setIsVisibleActivateSaleModal(true)}
              >
                {t("sales.activateSale")}
              </Button>
            </div>
          }
        >
          <Tag
            color="red"
            className="mb-2 h-fit w-fit"
            icon={allowEvents && <QuestionCircleTwoTone />}
          >
            <label>{t("sales.deleteSale")}</label>
          </Tag>
        </Popover>

        <Modal
          open={isVisibleActivateSaleModal}
          title={t("sales.activateManualSale")}
          destroyOnHidden
          onCancel={() => setIsVisibleActivateSaleModal(false)}
          onOk={async () => {
            await handleActivateSale();
          }}
          okText={t("common.yes")}
          cancelText={t("common.no")}
          closable={!isActivatingSale}
          okButtonProps={{ loading: isActivatingSale, type: "success" }}
          cancelButtonProps={{ disabled: isActivatingSale }}
        >
          {t("sales.areYouSureActivateSale")}{" "}
          <strong>{sale.number}</strong>
        </Modal>
      </>
    );
  }

  return (
    <>
      <Popover
        open={allowEvents ? undefined : false}
        title={t("sales.deleteSale")}
        content={
          <div className="flex flex-col gap-4">
            <p>This sale is currently active. Do you want to delete it?</p>

            <Button
              type="danger"
              onClick={() => setIsVisibleDeleteSaleModal(true)}
            >
              {t("sales.deleteSale")}
            </Button>
          </div>
        }
      >
        <Tag
          color="green"
          className="mb-2 h-fit w-fit"
          icon={allowEvents && <QuestionCircleTwoTone />}
        >
          <label>{t("sales.activateSale")}</label>
        </Tag>

        <Modal
          open={isVisibleDeleteSaleModal}
          title={t("sales.deleteManualSale")}
          destroyOnHidden
          onCancel={() => setIsVisibleDeleteSaleModal(false)}
          onOk={async () => {
            await handleDeleteSale();
          }}
          closable={!isDeletingSale}
          okText={t("common.yes")}
          cancelText={t("common.no")}
          okButtonProps={{ loading: isDeletingSale, type: "danger" }}
          cancelButtonProps={{ disabled: isDeletingSale }}
        >
          {t("sales.areYouSureDeleteSale")} <strong>{sale.number}</strong>
        </Modal>
      </Popover>
    </>
  );
};
