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
  selectedMain: MainCategory | '';
  selectedSub: string;
  onMainChange: (category: MainCategory) => void;
  onSubChange: (category: string) => void;
  className?: string;
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
        <SelectTrigger className="w-48 bg-white/70 border-slate-200 hover:border-blue-200 focus:border-blue-500 ring-offset-white focus:ring-blue-500/20 transition-all">
          <SelectValue placeholder="대분류 선택" />
        </SelectTrigger>
        <SelectContent className="bg-white border border-slate-200">
          {Object.entries(CATEGORY_MAPPING).map(([key, value]) => (
            <SelectItem 
              key={key} 
              value={key}
              className="hover:bg-blue-50 focus:bg-blue-50 cursor-pointer data-[state=checked]:bg-blue-50 data-[state=checked]:text-blue-700"
            >
              {value}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Input
        value={selectedSub}
        onChange={(e) => onSubChange(e.target.value)}
        placeholder="소분류를 입력하세요"
        className="w-48 bg-white/70 border-slate-200 hover:border-blue-200 focus:border-blue-500 focus:ring-blue-500/20 placeholder:text-slate-400 transition-all"
        disabled={!selectedMain}
      />
    </div>
  );
}; 