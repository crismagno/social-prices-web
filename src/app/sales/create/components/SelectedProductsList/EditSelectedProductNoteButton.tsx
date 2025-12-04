import { ChangeEvent, useState } from "react";

import { Modal, Tooltip } from "antd";
import TextArea from "antd/es/input/TextArea";

import ButtonCommon from "../../../../../components/common/ButtonCommon/ButtonCommon";
import { IconPencilSquare } from "../../../../../components/common/icons/icons";
import { TSaleStoreProductFormSchema } from "../../page";

interface Props {
  saleStoreProduct: TSaleStoreProductFormSchema;
  onConfirmNote: (note: string | null) => void;
}

export const EditSelectedProductNoteButton: React.FC<Props> = ({
  saleStoreProduct,
  onConfirmNote,
}) => {
  const [isVisible, setIsVisible] = useState<boolean>(false);

  const [note, setNote] = useState<string | null>(saleStoreProduct.note);

  return (
    <>
      <Tooltip title="Edit note product">
        <ButtonCommon
          onClick={() => setIsVisible(true)}
          color="transparent"
          className="rounded-r-full rounded-l-full shadow-none"
        >
          {IconPencilSquare("w-3 h-3")}
        </ButtonCommon>
      </Tooltip>

      <Modal
        width={600}
        title={
          <div className="flex flex-col">
            <label>Edit Product Note</label>

            <span className="text-sm italic mt-2">
              {saleStoreProduct.name}
              <span className="text-gray-500">
                ({saleStoreProduct.barcode})
              </span>
            </span>
          </div>
        }
        open={isVisible}
        onCancel={() => {
          setIsVisible(false);
          setNote(saleStoreProduct.note);
        }}
        onOk={() => {
          setIsVisible(false);
          onConfirmNote(note);
        }}
        okText="Confirm"
      >
        <div>
          <TextArea
            onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
              setNote(e.target.value)
            }
            value={note ?? ""}
            rows={5}
          />
        </div>
      </Modal>
    </>
  );
};
