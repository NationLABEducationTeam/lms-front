import { useState } from 'react';
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
  return (
    <div className={`space-y-4 ${className}`}>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          대분류
        </label>
        <Select 
          value={selectedMain || 'all'} 
          onValueChange={(value: string) => {
            if (value === 'all') {
              onMainChange(null);
            } else {
              onMainChange(value as MainCategory);
            }
          }}
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
          </SelectContent>
        </Select>
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