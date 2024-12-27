export enum UserRole {
  STUDENT = 'STUDENT',
  INSTRUCTOR = 'INSTRUCTOR',
  ADMIN = 'ADMIN'
}

export interface CognitoUser {
  username: string;
  attributes: {
    email: string;
    'custom:role': UserRole;
  };
} 