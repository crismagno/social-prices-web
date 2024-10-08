import { useEffect, useState } from "react";

import { Button, Col, Drawer, message, Row, Select } from "antd";
import { sortBy } from "lodash";
import { SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";

import { zodResolver } from "@hookform/resolvers/zod";

import handleClientError from "../../../../components/common/handleClientError/handleClientError";
import HrCustom from "../../../../components/common/HrCustom/HrCustom";
import LoadingFull from "../../../../components/common/LoadingFull/LoadingFull";
import { ColorPickerCustomAntd } from "../../../../components/custom/antd/ColorPickerCustomAntd/ColorPickerCustomAntd";
import { InputCustomAntd } from "../../../../components/custom/antd/InputCustomAntd/InputCustomAntd";
import { SelectCustomAntd } from "../../../../components/custom/antd/SelectCustomAntd/SelectCustomAntd";
import { TextareaCustomAntd } from "../../../../components/custom/antd/TextareaCustomAntd/TextareaCustomAntd";
import useAuthData from "../../../../data/context/auth/useAuthData";
import { serviceMethodsInstance } from "../../../../services/social-prices-api/ServiceMethods";
import CreateTagDto from "../../../../services/social-prices-api/tags/dto/createTag.dto";
import UpdateTagDto from "../../../../services/social-prices-api/tags/dto/updateTag.dto";
import TagsEnum from "../../../../shared/business/tags/tags.enum";
import { ITag } from "../../../../shared/business/tags/tags.interface";
import { parseColorPickerToHexString } from "../../../../shared/utils/antd/color-picker/color-picker";
import { useFindTagById } from "../../useFindTagById";

const formSchema = z.object({
  name: z.string().trim().nonempty("Name is required"),
  type: z.string().nonempty("Type is required"),
  description: z.string().trim().nullable(),
  color: z.any().nullable(),
});

type TFormSchema = z.infer<typeof formSchema>;

interface Props {
  isOpen: boolean;
  tagId?: string;
  onClose: () => void;
  onOk: (tag: ITag) => void;
}

const initialTag = (): TFormSchema => ({
  name: "",
  type: TagsEnum.Type.ANY,
  description: null,
  color: null,
});

export const TagDetailDrawer: React.FC<Props> = ({
  isOpen,
  onClose,
  onOk,
  tagId,
}) => {
  const { user } = useAuthData();

  const { isLoading, tag } = useFindTagById(tagId);

  const isEditMode: boolean = !!tagId && !!tag;

  const [formValues, setFormValues] = useState<TFormSchema>();

  const [isSubmitting, setIsSUbmitting] = useState<boolean>(false);

  const {
    handleSubmit,
    formState: { errors },
    control,
  } = useForm<TFormSchema>({
    values: formValues,
    resolver: zodResolver(formSchema),
  });

  useEffect(() => {
    const values: TFormSchema = {
      name: tag?.name ?? "",
      type: tag?.type ?? TagsEnum.Type.ANY,
      description: tag?.description ?? null,
      color: tag?.color ?? null,
    };

    setFormValues(values);
  }, [tag]);

  if (tagId && isLoading) {
    return <LoadingFull />;
  }

  if (tagId && !tag) {
    return null;
  }

  const onSubmit: SubmitHandler<TFormSchema> = async (data: TFormSchema) => {
    if (isEditMode) {
      await handleUpdate(data);
    } else {
      await handleCreate(data);
    }
  };

  const handleCreate = async (data: TFormSchema) => {
    try {
      setIsSUbmitting(true);

      const createTagDto: CreateTagDto = {
        name: data.name,
        userId: user!._id,
        type: data.type as TagsEnum.Type,
        description: data.description,
        color: parseColorPickerToHexString(data.color),
      };

      const newTag: ITag =
        await serviceMethodsInstance.tagsServiceMethods.create(createTagDto);

      message.success("Your tag has been created successfully!");

      setFormValues(initialTag());

      onOk(newTag);
    } catch (error) {
      handleClientError(error);
    } finally {
      setIsSUbmitting(false);
    }
  };

  const handleUpdate = async (data: TFormSchema) => {
    try {
      setIsSUbmitting(true);

      const updateTagDto: UpdateTagDto = {
        name: data.name,
        type: data.type as TagsEnum.Type,
        tagId: tagId!,
        description: data.description,
        color: parseColorPickerToHexString(data.color),
      };

      const tagUpdated: ITag =
        await serviceMethodsInstance.tagsServiceMethods.update(updateTagDto);

      message.success("Your tag has been updated successfully!");

      setFormValues(initialTag());

      onOk(tagUpdated);
    } catch (error) {
      handleClientError(error);
    } finally {
      setIsSUbmitting(false);
    }
  };

  const handleClose = () => {
    setFormValues({
      name: "",
      type: TagsEnum.Type.ANY,
      description: null,
      color: null,
    });

    onClose();
  };

  return (
    <Drawer
      title={tagId ? `Edit Tag: ${tag?.name}` : "New Tag"}
      onClose={handleClose}
      open={isOpen}
    >
      <form onSubmit={handleSubmit(onSubmit)}>
        <Row gutter={[16, 16]} className="mt-10">
          <Col xs={24}>
            <InputCustomAntd
              controller={{ control, name: "name" }}
              label="Name"
              placeholder={"Enter name"}
              errorMessage={errors.name?.message}
              maxLength={200}
            />
          </Col>

          <Col xs={24}>
            <SelectCustomAntd<ITag>
              controller={{ control, name: "type" }}
              label="Type"
              errorMessage={errors.type?.message}
            >
              {sortBy(Object.keys(TagsEnum.Type)).map((type: string) => (
                <Select.Option key={type} value={type}>
                  {TagsEnum.TypeLabels[type as TagsEnum.Type]}
                </Select.Option>
              ))}
            </SelectCustomAntd>
          </Col>

          <Col xs={24}>
            <TextareaCustomAntd
              controller={{ control, name: "description" }}
              label="Description"
              placeholder={"Enter description"}
              rows={2}
            />
          </Col>

          <Col xs={24}>
            <ColorPickerCustomAntd
              controller={{ control, name: "color" }}
              label="Color"
              defaultValue="#1677ff"
              showText
              allowClear
              size="large"
              style={{ width: 120 }}
            />
          </Col>
        </Row>

        <HrCustom className="my-7" />

        <div className="flex justify-center my-5">
          <Button
            type="default"
            className="mr-2"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>

          <Button
            type="primary"
            onClick={handleSubmit(onSubmit)}
            loading={isSubmitting}
            disabled={isSubmitting}
          >
            {isEditMode ? "Save" : "Create"}
          </Button>
        </div>
      </form>
    </Drawer>
  );
};
