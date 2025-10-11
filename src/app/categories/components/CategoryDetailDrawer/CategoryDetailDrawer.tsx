import { useEffect, useState } from "react";

import { Button, Col, Drawer, message, Row, Select } from "antd";
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
import CreateCategoryDto from "../../../../services/social-prices-api/categories/dto/createCategory.dto";
import UpdateCategoryDto from "../../../../services/social-prices-api/categories/dto/updateCategory.dto";
import { serviceMethodsInstance } from "../../../../services/social-prices-api/service-methods";
import CategoriesEnum from "../../../../shared/business/categories/categories.enum";
import { ICategory } from "../../../../shared/business/categories/categories.interface";
import { parseColorPickerToHexString } from "../../../../shared/utils/antd/color-picker/color-picker";
import { parseToUpperAndUnderline } from "../../../../shared/utils/strings/string";
import { useFindCategoryById } from "../../useFindCategoryById";

const formSchema = z.object({
  name: z.string().trim().nonempty("Name is required"),
  type: z.string().nonempty("Type is required"),
  description: z.string().trim().nullable(),
  color: z.any().nullable(),
});

type TFormSchema = z.infer<typeof formSchema>;

interface Props {
  isOpen: boolean;
  categoryId?: string;
  onClose: () => void;
  onOk: (category: ICategory) => void;
}

export const CategoryDetailDrawer: React.FC<Props> = ({
  isOpen,
  onClose,
  onOk,
  categoryId,
}) => {
  const { user } = useAuthData();

  const { isLoading, category } = useFindCategoryById(categoryId);

  const isEditMode: boolean = !!categoryId && !!category;

  const [formValues, setFormValues] = useState<TFormSchema>();

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

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
      name: category?.name ?? "",
      type: category?.type ?? CategoriesEnum.Type.PRODUCT,
      description: category?.description ?? null,
      color: category?.color ?? null,
    };

    setFormValues(values);
  }, [category]);

  if (categoryId && isLoading) {
    return <LoadingFull />;
  }

  if (categoryId && !category) {
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
      setIsSubmitting(true);

      const createCategoryDto: CreateCategoryDto = {
        code: parseToUpperAndUnderline(data.name),
        name: data.name,
        ownerUserId: user!._id,
        type: data.type as CategoriesEnum.Type,
        description: data.description,
        color: parseColorPickerToHexString(data.color),
      };

      const newCategory: ICategory =
        await serviceMethodsInstance.categoriesServiceMethods.create(
          createCategoryDto
        );

      message.success("Your category has been created successfully!");

      onOk(newCategory);
    } catch (error) {
      handleClientError(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async (data: TFormSchema) => {
    try {
      setIsSubmitting(true);

      const updateCategoryDto: UpdateCategoryDto = {
        code: parseToUpperAndUnderline(data.name),
        name: data.name,
        ownerUserId: user!._id,
        type: data.type as CategoriesEnum.Type,
        categoryId: categoryId!,
        description: data.description,
        color: parseColorPickerToHexString(data.color),
      };

      const categoryUpdated: ICategory =
        await serviceMethodsInstance.categoriesServiceMethods.update(
          updateCategoryDto
        );

      message.success("Your category has been updated successfully!");

      onOk(categoryUpdated);
    } catch (error) {
      handleClientError(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormValues({
      name: "",
      type: CategoriesEnum.Type.PRODUCT,
      description: null,
      color: null,
    });

    onClose();
  };

  return (
    <Drawer
      title={categoryId ? `Edit Category: ${category?.name}` : "New Category"}
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
            <SelectCustomAntd<ICategory>
              controller={{ control, name: "type" }}
              label="Type"
              errorMessage={errors.type?.message}
            >
              {Object.keys(CategoriesEnum.Type).map((type: string) => (
                <Select.Option key={type} value={type}>
                  {CategoriesEnum.TypeLabels[type as CategoriesEnum.Type]}
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
