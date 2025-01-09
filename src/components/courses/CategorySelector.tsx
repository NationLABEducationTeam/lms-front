import { useState, useEffect } from 'react';
import { MAIN_CATEGORIES, SUB_CATEGORIES, MainCategory, SubCategory } from '@/types/course';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/common/ui/select';

interface CategorySelectorProps {
  selectedMain: MainCategory | '';
  selectedSub: SubCategory | '';
  onMainChange: (category: MainCategory | '') => void;
  onSubChange: (category: SubCategory | '') => void;
}

export const CategorySelector: React.FC<CategorySelectorProps> = ({
  selectedMain,
  selectedSub,
  onMainChange,
  onSubChange,
}) => {
  // 대분류가 변경될 때 소분류 초기화
  useEffect(() => {
    if (selectedMain === '') {
      onSubChange('');
    }
  }, [selectedMain, onSubChange]);

  // 현재 선택된 대분류에 해당하는 소분류 목록 가져오기
  const getSubCategories = () => {
    if (!selectedMain) return [];
    return Object.entries(SUB_CATEGORIES[selectedMain]);
  };

  return (
    <div className="flex gap-4">
      <Select 
        value={selectedMain} 
        onValueChange={(value: MainCategory) => {
          onMainChange(value);
          onSubChange(''); // 대분류 변경 시 소분류 초기화
        }}
      >
        <SelectTrigger className="w-48">
          <SelectValue placeholder="대분류 선택" />
        </SelectTrigger>
        <SelectContent className="bg-indigo-50">
          {Object.entries(MAIN_CATEGORIES).map(([key, value]) => (
            <SelectItem 
              key={key} 
              value={key}
              className="text-indigo-700 hover:bg-indigo-100 hover:text-indigo-900 focus:bg-indigo-100 focus:text-indigo-900"
            >
              {value}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={selectedSub}
        onValueChange={onSubChange}
        disabled={!selectedMain} // 대분류가 선택되지 않았으면 비활성화
      >
        <SelectTrigger className="w-48">
          <SelectValue placeholder="소분류 선택" />
        </SelectTrigger>
        <SelectContent className="bg-indigo-50">
          {getSubCategories().map(([key, value]) => (
            <SelectItem 
              key={key} 
              value={key}
              className="text-indigo-700 hover:bg-indigo-100 hover:text-indigo-900 focus:bg-indigo-100 focus:text-indigo-900"
            >
              {value}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}; 