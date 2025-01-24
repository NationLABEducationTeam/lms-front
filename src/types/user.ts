export interface DBUser {
  cognito_user_id: string;
  email: string;
  name?: string;
  given_name: string;
  role: 'ADMIN' | 'INSTRUCTOR' | 'STUDENT';
  created_at: string;
  updated_at?: string;
  enrolled_courses?: string[];
  last_login?: string;
}

export interface UserProfile extends DBUser {
  avatar_url?: string;
  phone_number?: string;
  bio?: string;
} 