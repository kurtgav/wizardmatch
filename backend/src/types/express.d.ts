declare global {
  namespace Express {
    interface User {
      id: string;
      email: string;
      username: string | null;
      studentId: string | null;
      firstName: string;
      lastName: string;
      program: string | null;
      yearLevel: number | null;
      gender: string | null;
      seekingGender: string | null;
      dateOfBirth: Date | null;
      profilePhotoUrl: string | null;
      bio: string | null;
      instagramHandle: string | null;
      facebookProfile: string | null;
      socialMediaName: string | null;
      phoneNumber: string | null;
      contactPreference: string | null;
      profileVisibility: string;
      preferences: any;
      createdAt: Date;
      updatedAt: Date;
      lastLogin: Date | null;
      isActive: boolean;
      surveyCompleted: boolean;
    }

    interface Request {
      user?: User;
    }
  }
}

export { };
