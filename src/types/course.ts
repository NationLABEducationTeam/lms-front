export interface Course {
  id: string;
  title: string;
  description: string;
  mainCategory: string;
  subCategory: string;
  instructor: string;
  thumbnail?: string;
  lastModified: string;
  path: string;
}

export interface Category {
  name: string;
  path: string;
}

export interface SubCategory {
  name: string;
  path: string;
}

export interface CourseCreateData {
  mainCategory: string;
  subCategory: string;
  title: string;
  description: string;
  weeks: number;
} 