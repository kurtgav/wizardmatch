declare global {
  namespace Express {
    interface User {
      id: string;
      email: string;
      firstName: string;
      lastName: string;
      program: string;
      yearLevel: number;
      surveyCompleted: boolean;
      profilePhotoUrl?: string;
      bio?: string;
    }

    interface Request {
      user?: User;
    }
  }
}

export { };
