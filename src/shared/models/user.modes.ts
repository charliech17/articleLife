export interface IUserAuthInfo {
  id: number;
  loginId: string | null;
  email: string;
  emailVerified: boolean;
  displayName: string | null;
  profileImage: string | null;
  lastLogin: string | null;
  isActive: boolean;
  createdAt: string;
  isAdmin: boolean;
}
