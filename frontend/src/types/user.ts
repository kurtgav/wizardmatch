export interface User {
  id: string;
  email: string;
  username?: string;
  firstName: string;
  lastName: string;
  studentId: string;
  program: string;
  yearLevel: number;
  gender: string;
  seekingGender?: string;
  surveyCompleted: boolean;
  profilePhotoUrl?: string;
  bio?: string;
  instagramHandle?: string;
  socialMediaName?: string;
  phoneNumber?: string;
  contactPreference?: string;
  profileVisibility?: string;
  created_at?: string;
  updated_at?: string;
}
