import { FC, useState } from 'react';
import { motion } from 'framer-motion';
import { Brain, Cloud, Award, Code, Briefcase, ChevronRight } from 'lucide-react';
import { Card, CardContent } from '../common/ui/card';
import { Button } from '../common/ui/button';
import { MainCategory, CATEGORY_CONFIG, CategoryConfig } from '@/types/category';

interface CategoryListProps {
  onSelectCategory: (category: MainCategory, subcategory?: string) => void;
}

export const CategoryList: FC<CategoryListProps> = ({ onSelectCategory }) => {
  const [selectedCategory, setSelectedCategory] = useState<MainCategory | null>(null);

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Brain':
        return <Brain className="w-6 h-6" />;
      case 'Cloud':
        return <Cloud className="w-6 h-6" />;
      case 'Award':
        return <Award className="w-6 h-6" />;
      case 'Code':
        return <Code className="w-6 h-6" />;
      case 'Briefcase':
        return <Briefcase className="w-6 h-6" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Object.entries(CATEGORY_CONFIG).map(([key, category]) => (
          <motion.div
            key={category.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            <Card
              className={`cursor-pointer hover:shadow-md transition-all ${
                selectedCategory === category.id ? 'ring-2 ring-blue-500' : ''
              }`}
              onClick={() => {
                setSelectedCategory(
                  selectedCategory === category.id ? null : category.id
                );
                onSelectCategory(category.id);
              }}
            >
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-lg ${
                    selectedCategory === category.id
                      ? 'bg-blue-100 text-blue-600'
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {getIcon(category.icon)}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-2">{category.label}</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      {category.description}
                    </p>
                    <div className="flex items-center text-sm text-gray-500">
                      <span>{category.subcategories.length}개의 하위 카테고리</span>
                    </div>
                  </div>
                  <ChevronRight className={`w-5 h-5 text-gray-400 transition-transform ${
                    selectedCategory === category.id ? 'rotate-90' : ''
                  }`} />
                </div>
              </CardContent>
            </Card>
            {selectedCategory === category.id && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 pl-4 space-y-2"
              >
                {category.subcategories.map((subcategory) => (
                  <Button
                    key={subcategory.id}
                    variant="ghost"
                    className="w-full justify-start text-left hover:bg-gray-100"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectCategory(category.id, subcategory.id);
                    }}
                  >
                    <div>
                      <div className="font-medium">{subcategory.label}</div>
                      <div className="text-sm text-gray-500">
                        {subcategory.description}
                      </div>
                    </div>
                  </Button>
                ))}
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}; 