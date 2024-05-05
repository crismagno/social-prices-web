import { useEffect, useState } from "react";

import { Button, Col, Drawer, message, Row, Select } from "antd";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";

import { zodResolver } from "@hookform/resolvers/zod";

import FormInput from "../../../../components/common/FormInput/FormInput";
import FormTextarea from "../../../../components/common/FormTextarea/FormTextarea";
import handleClientError from "../../../../components/common/handleClientError/handleClientError";
import HrCustom from "../../../../components/common/HrCustom/HrCustom";
import LoadingFull from "../../../../components/common/LoadingFull/LoadingFull";
import useAuthData from "../../../../data/context/auth/useAuthData";
import CreateCategoryDto from "../../../../services/social-prices-api/categories/dto/createCategory.dto";
import UpdateCategoryDto from "../../../../services/social-prices-api/categories/dto/updateCategory.dto";
import { serviceMethodsInstance } from "../../../../services/social-prices-api/ServiceMethods";
import CategoriesEnum from "../../../../shared/business/categories/categories.enum";
import { ICategory } from "../../../../shared/business/categories/categories.interface";
import { parseToUpperAndUnderline } from "../../../../shared/utils/string-extensions/string-extensions";
import { useFindCategoryById } from "../../useFindCategoryById";

const formSchema = z.object({
  name: z.string().nonempty("Name is required"),
  type: z.string().nonempty("Type is required"),
  description: z.string().nullable(),
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

  const [isSubmitting, setIsSUbmitting] = useState<boolean>(false);

  const {
    register,
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
    };

    setFormValues(values);
  }, [category]);

  if (categoryId && isLoading) {
    return <LoadingFull />;
  }

  if (categoryId && !category) {
    return <div>Category not found!</div>;
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

      const createCategoryDto: CreateCategoryDto = {
        code: parseToUpperAndUnderline(data.name),
        name: data.name,
        ownerUserId: user!._id,
        type: data.type as CategoriesEnum.Type,
        description: data.description,
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
      setIsSUbmitting(false);
    }
  };

  const handleUpdate = async (data: TFormSchema) => {
    try {
      setIsSUbmitting(true);

      const updateCategoryDto: UpdateCategoryDto = {
        code: parseToUpperAndUnderline(data.name),
        name: data.name,
        ownerUserId: user!._id,
        type: data.type as CategoriesEnum.Type,
        categoryId: categoryId!,
        description: data.description,
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
      setIsSUbmitting(false);
    }
  };

  const handleClose = () => {
    setFormValues({
      name: "",
      type: CategoriesEnum.Type.PRODUCT,
      description: null,
    });
    onClose();
  };

  return (
    <Drawer
      title={categoryId ? `Update Category: ${category?.name}` : "New Category"}
      onClose={handleClose}
      open={isOpen}
    >
      <form onSubmit={handleSubmit(onSubmit)}>
        <Row gutter={[16, 16]} className="mt-10">
          <Col xs={24}>
            <FormInput
              label="Name"
              placeholder={"Enter name"}
              defaultValue={category?.name}
              register={register}
              registerName="name"
              registerOptions={{ required: true }}
              errorMessage={errors.name?.message}
              maxLength={200}
            />
          </Col>

          <Col xs={24}>
            <div className={`flex flex-col mt-4 mr-5`}>
              <label className={`text-sm`}>Stores</label>

              <Controller
                control={control}
                name={`type`}
                render={({ field: { onChange, onBlur, value, name, ref } }) => (
                  <Select
                    onChange={onChange}
                    onBlur={onBlur}
                    name={name}
                    value={value}
                    ref={ref}
                    placeholder={"Select type"}
                  >
                    {Object.keys(CategoriesEnum.Type).map((type: string) => (
                      <Select.Option key={type} value={type}>
                        {CategoriesEnum.TypeLabels[type as CategoriesEnum.Type]}
                      </Select.Option>
                    ))}
                  </Select>
                )}
              ></Controller>
            </div>
          </Col>

          <Col xs={24}>
            <FormTextarea
              label="Description"
              placeholder={"Enter description"}
              defaultValue={category?.description}
              register={register}
              registerName="description"
              rows={2}
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
