import { useState, useEffect } from "react";
import DashboardLayout from "@/components/common/layout/DashboardLayout";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/common/ui/card";
import { Button } from "@/components/common/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/common/ui/tabs";
import { CourseList } from "@/components/courses/CourseList";
import { CategoryList } from "@/components/courses/CategoryList";
import { MainCategory } from "@/types/category";
import { S3Structure } from "@/types/s3";
import { fetchCategories, fetchCoursesByCategory } from "@/store/features/courses/coursesSlice";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";

const InstructorDashboard = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { courses, loading, error } = useSelector((state: RootState) => state.courses);
  const [selectedCategory, setSelectedCategory] = useState<MainCategory | null>(null);
  const [selectedSubCategory, setSelectedSubCategory] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  const handleCategorySelect = async (category: MainCategory, subcategory?: string) => {
    setSelectedCategory(category);
    setSelectedSubCategory(subcategory || null);
    
    try {
      await dispatch(fetchCoursesByCategory({
        mainCategory: category,
        subCategory: subcategory || 'all'
      })).unwrap();
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };

  const handleJoinClass = (coursePath: string) => {
    console.log('Join class:', coursePath);
  };

  const handleEditCourse = (course: S3Structure) => {
    console.log('Edit course:', course);
  };

  const handleDeleteCourse = (course: S3Structure) => {
    console.log('Delete course:', course);
  };

  return (
    <DashboardLayout title="강사 대시보드">
      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                내 강의
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{courses.length}</div>
              <p className="text-xs text-muted-foreground">
                총 강의 수
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                수강생
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">+2350</div>
              <p className="text-xs text-muted-foreground">
                전체 수강생 수
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                평균 만족도
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">+4.8</div>
              <p className="text-xs text-muted-foreground">
                5점 만점
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                수익
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₩573,000</div>
              <p className="text-xs text-muted-foreground">
                이번 달 수익
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="courses" className="space-y-4">
          <TabsList>
            <TabsTrigger value="courses">내 강의</TabsTrigger>
            <TabsTrigger value="categories">카테고리</TabsTrigger>
          </TabsList>
          <TabsContent value="courses" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold tracking-tight">강의 목록</h2>
              <Button>새 강의 만들기</Button>
            </div>
            <CourseList
              courses={courses}
              userRole="INSTRUCTOR"
              onJoinClass={handleJoinClass}
              onEdit={handleEditCourse}
              onDelete={handleDeleteCourse}
            />
          </TabsContent>
          <TabsContent value="categories" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold tracking-tight">카테고리</h2>
            </div>
            <CategoryList onSelectCategory={handleCategorySelect} />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default InstructorDashboard; 