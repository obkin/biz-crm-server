export interface UserRegisteredPayload {
  userId: number;
  email: string;
}

export interface UserEmailChangedPayload {
  userId: number;
  oldEmail: string;
  newEmail: string;
}

export interface UserEmailVerifiedPayload {
  userEmail: string;
}
