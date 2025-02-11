import { FC } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/common/ui/button';
import { Input } from '@/components/common/ui/input';
import { Textarea } from '@/components/common/ui/textarea';
import { Select } from '@/components/common/ui/select';
import { useListCategoriesQuery } from '@/services/api/courseApi';
import { CourseLevel, CourseStatus, MainCategory, CourseType } from '@/types/course';
import { CreateCourseRequest } from '@/services/api/courseApi';

const formSchema = z.object({
  title: z.string().min(1, '제목을 입력해주세요.'),
  description: z.string().min(1, '설명을 입력해주세요.'),
  main_category_id: z.string().min(1, '메인 카테고리를 선택해주세요.'),
  sub_category_id: z.string().min(1, '서브 카테고리를 선택해주세요.'),
  level: z.nativeEnum(CourseLevel, {
    required_error: '난이도를 선택해주세요',
  }),
  price: z.number().min(0, '가격은 0 이상이어야 합니다.'),
  status: z.nativeEnum(CourseStatus).optional(),
  zoom_link: z.string().optional(),
  type: z.enum(['ONLINE', 'VOD'], {
    required_error: '강의 유형을 선택해주세요',
  }),
  thumbnail: z.instanceof(File).optional(),
  classmode: z.enum(['ONLINE', 'VOD'], {
    required_error: '강의 유형을 선택해주세요',
  }),
});

type FormValues = z.infer<typeof formSchema>;

interface CourseFormProps {
  initialValues?: Partial<FormValues>;
  onSubmit: (data: FormValues) => void;
  submitButtonText?: string;
}

export const CourseForm: FC<CourseFormProps> = ({
  initialValues,
  onSubmit,
  submitButtonText = '저장하기'
}) => {
  const { data: categories = [], isLoading: isCategoriesLoading } = useListCategoriesQuery();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    setValue
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
      main_category_id: '',
      sub_category_id: '',
      level: CourseLevel.BEGINNER,
      price: 0,
      status: CourseStatus.DRAFT,
      zoom_link: '',
      type: 'ONLINE',
      classmode: 'ONLINE',
      ...initialValues
    }
  });

  const selectedMainCategory = watch('main_category_id');
  const selectedCategory = categories.find(cat => cat.id === selectedMainCategory);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          강의 제목
        </label>
        <Input
          {...register('title')}
          placeholder="강의 제목을 입력하세요"
          error={errors.title?.message}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          강의 설명
        </label>
        <Textarea
          {...register('description')}
          placeholder="강의 설명을 입력하세요"
          error={errors.description?.message}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            메인 카테고리
          </label>
          <Select
            {...register('main_category_id')}
            disabled={isCategoriesLoading}
            error={errors.main_category_id?.message}
          >
            <option value="">카테고리 선택</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </Select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            서브 카테고리
          </label>
          <Input
            {...register('sub_category_id')}
            placeholder="서브 카테고리를 입력하세요"
            disabled={!selectedMainCategory}
            error={errors.sub_category_id?.message}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            난이도
          </label>
          <Select {...register('level')} error={errors.level?.message}>
            {Object.entries(CourseLevel).map(([key, value]) => (
              <option key={key} value={value}>
                {key === 'BEGINNER'
                  ? '초급'
                  : key === 'INTERMEDIATE'
                  ? '중급'
                  : '고급'}
              </option>
            ))}
          </Select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            가격
          </label>
          <Input
            type="number"
            {...register('price', { valueAsNumber: true })}
            placeholder="가격을 입력하세요"
            error={errors.price?.message}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          썸네일 이미지
        </label>
        <Input
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              setValue('thumbnail', file);
            }
          }}
          error={errors.thumbnail?.message}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          강의 유형
        </label>
        <div className="grid grid-cols-2 gap-4">
          <div
            className={`p-4 border rounded-lg cursor-pointer transition-all ${
              watch('classmode') === 'ONLINE'
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-blue-200'
            }`}
            onClick={() => setValue('classmode', 'ONLINE')}
          >
            <div className="flex items-center gap-2">
              <input
                type="radio"
                {...register('classmode')}
                value="ONLINE"
                className="hidden"
              />
              <div className="flex-1">
                <h3 className="font-medium text-gray-900">실시간 온라인</h3>
                <p className="text-sm text-gray-500">
                  Zoom을 통한 실시간 온라인 강의
                </p>
              </div>
            </div>
          </div>
          
          <div
            className={`p-4 border rounded-lg cursor-pointer transition-all ${
              watch('classmode') === 'VOD'
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-blue-200'
            }`}
            onClick={() => setValue('classmode', 'VOD')}
          >
            <div className="flex items-center gap-2">
              <input
                type="radio"
                {...register('classmode')}
                value="VOD"
                className="hidden"
              />
              <div className="flex-1">
                <h3 className="font-medium text-gray-900">VOD</h3>
                <p className="text-sm text-gray-500">
                  녹화된 강의 영상으로 학습
                </p>
              </div>
            </div>
          </div>
        </div>
        {errors.classmode && (
          <p className="mt-1 text-sm text-red-600">{errors.classmode.message}</p>
        )}
      </div>

      {initialValues && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              상태
            </label>
            <Select {...register('status')} error={errors.status?.message}>
              {Object.entries(CourseStatus).map(([key, value]) => (
                <option key={key} value={value}>
                  {key === 'DRAFT'
                    ? '임시저장'
                    : key === 'PUBLISHED'
                    ? '공개'
                    : '비공개'}
                </option>
              ))}
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Zoom 링크
            </label>
            <Input
              {...register('zoom_link')}
              placeholder="Zoom 링크를 입력하세요"
              error={errors.zoom_link?.message}
            />
          </div>
        </div>
      )}

      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={isSubmitting}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {isSubmitting ? '저장 중...' : submitButtonText}
        </Button>
      </div>
    </form>
  );
}; 