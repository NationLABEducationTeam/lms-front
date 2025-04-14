import { useState } from 'react';
import { CATEGORY_MAPPING, MainCategory, MainCategoryId } from '@/types/course';
import * as SelectPrimitive from "@radix-ui/react-select";
import {
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/common/ui/select';
import { Input } from '@/components/common/ui/input';

interface CategorySelectorProps {
  selectedMain: MainCategory | null;
  selectedSub: string;
  onMainChange: (category: MainCategory | null) => void;
  onSubChange: (category: string) => void;
  className?: string;
}

export const CategorySelector: React.FC<CategorySelectorProps> = ({
  selectedMain,
  selectedSub,
  onMainChange,
  onSubChange,
  className,
}) => {
  const [isCustomMain, setIsCustomMain] = useState(false);
  const [customMainName, setCustomMainName] = useState('');

  const handleMainCategoryChange = (value: string) => {
    if (value === 'all') {
      onMainChange(null);
      setIsCustomMain(false);
    } else if (value === 'custom') {
      setIsCustomMain(true);
      // 커스텀 입력 모드로 전환했을 때 기존에 입력된 값이 있으면 그대로 유지
      if (customMainName) {
        onMainChange({
          id: 'custom' as MainCategoryId,
          name: customMainName,
          sub_categories: []
        });
      } else {
        onMainChange(null);
      }
    } else {
      setIsCustomMain(false);
      const categoryId = value as MainCategoryId;
      onMainChange({
        id: categoryId,
        name: CATEGORY_MAPPING[categoryId],
        sub_categories: []
      });
    }
  };

  const handleCustomMainChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCustomMainName(value);
    onMainChange({
      id: 'custom' as MainCategoryId,
      name: value,
      sub_categories: []
    });
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          대분류
        </label>
        <SelectPrimitive.Root 
          value={isCustomMain ? 'custom' : (selectedMain?.id || 'all')} 
          onValueChange={handleMainCategoryChange}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="대분류 선택" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">전체</SelectItem>
            {Object.entries(CATEGORY_MAPPING).map(([key, value]) => (
              <SelectItem key={key} value={key}>
                {value}
              </SelectItem>
            ))}
            <SelectItem value="custom">직접 입력</SelectItem>
          </SelectContent>
        </SelectPrimitive.Root>
        
        {isCustomMain && (
          <div className="mt-2">
            <Input
              type="text"
              value={customMainName}
              onChange={handleCustomMainChange}
              placeholder="대분류명 직접 입력"
              className="w-full"
            />
          </div>
        )}
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          소분류
        </label>
        <Input
          type="text"
          value={selectedSub}
          onChange={(e) => onSubChange(e.target.value)}
          placeholder="소분류 입력"
          className="w-full"
        />
      </div>
    </div>
  );
}; 