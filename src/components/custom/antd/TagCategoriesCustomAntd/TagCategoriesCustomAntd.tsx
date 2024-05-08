import {
  ICategory,
} from '../../../../shared/business/categories/categories.interface';
import {
  TagCategoryCustomAntd,
} from '../TagCategoryCustomAntd/TagCategoryCustomAntd';

interface Props {
  categories: ICategory[];
  categoriesIds: string[];
  useTag?: boolean;
}

export const TagCategoriesCustomAntd: React.FC<Props> = ({
  categories,
  categoriesIds,
  useTag = true,
}) => {
  return categoriesIds.map((categoryId: string) => {
    const category: ICategory | undefined = categories.find(
      (category: ICategory) => category._id === categoryId
    );

    if (!category) {
      return null;
    }

    return (
      <TagCategoryCustomAntd
        key={category._id}
        category={category}
        useTag={useTag}
      />
    );
  });
};
