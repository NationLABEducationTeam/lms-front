import { FC } from 'react';
import { List, Typography } from 'antd';
import { Category } from '@/types/course';

const { Text } = Typography;

interface CategoryListProps {
  categories: Category[];
  onCategorySelect: (category: Category) => void;
  selectedCategory?: Category;
}

export const CategoryList: FC<CategoryListProps> = ({
  categories,
  onCategorySelect,
  selectedCategory,
}) => {
  return (
    <List
      size="small"
      bordered
      dataSource={categories}
      renderItem={(category) => (
        <List.Item
          onClick={() => onCategorySelect(category)}
          style={{
            cursor: 'pointer',
            backgroundColor:
              selectedCategory?.path === category.path ? '#e6f7ff' : 'transparent',
          }}
        >
          <Text>{category.name}</Text>
        </List.Item>
      )}
    />
  );
}; 