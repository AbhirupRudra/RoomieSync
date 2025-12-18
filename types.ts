
export enum PreferenceType {
  SLEEP = 'sleep',
  CLEANLINESS = 'cleanliness',
  NOISE = 'noise',
  GUESTS = 'guests',
  SMOKING = 'smoking',
  PETS = 'pets',
  COOKING = 'cooking'
}

export type Gender = 'male' | 'female' | 'non-binary';

export enum RequestStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected'
}

export interface LifestyleData {
  sleep: number; // 0: Night Owl, 100: Early Bird
  cleanliness: number; // 0: Messy, 100: Tidy
  noise: number; // 0: Social/Loud, 100: Quiet
  guests: number; // 0: Frequent, 100: Rarely
  smoking: boolean;
  pets: boolean;
  cooking: number; // 0: Takeout, 100: Home Cook
}

export interface RoommateRequest {
  id: string;
  fromId: string;
  toId: string;
  status: RequestStatus;
  timestamp: string;
  fromName?: string;
  fromAvatar?: string;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  avatar: string;
  bio: string;
  lifestyle: LifestyleData;
  occupation: string;
  age: number;
  gender: Gender;
  allowOppositeGender: boolean;
  // Tracking relationships locally on the user's document
  sentRequests?: string[];      // IDs of users I requested
  acceptedRequests?: string[];  // IDs of users I accepted
  rejectedRequests?: string[];  // IDs of users I rejected
}

export interface MatchResult extends UserProfile {
  score: number;
  aiInsight?: string;
}
