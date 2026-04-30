// Frontend/app/types/index.ts
export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface Attendance {
  id: string;
  userId: string;
  date: Date;
  status: 'present' | 'absent' | 'leave';
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}