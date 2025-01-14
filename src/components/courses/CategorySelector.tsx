import { useState, useEffect } from 'react';
import { CATEGORY_MAPPING, MainCategory } from '@/types/course';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/common/ui/select';
import { Input } from '@/components/common/ui/input';

interface CategorySelectorProps {
  selectedMain: MainCategory;
  selectedSub: string;
  onMainChange: (category: MainCategory) => void;
  onSubChange: (category: string) => void;
}

export const CategorySelector: React.FC<CategorySelectorProps> = ({
  selectedMain,
  selectedSub,
  onMainChange,
  onSubChange,
}) => {
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
          {Object.entries(CATEGORY_MAPPING).map(([key, value]) => (
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

      <Input
        value={selectedSub}
        onChange={(e) => onSubChange(e.target.value)}
        placeholder="소분류 입력"
        className="w-48 bg-[#1a232e] border-gray-700"
        disabled={!selectedMain}
      />
    </div>
  );
}; 