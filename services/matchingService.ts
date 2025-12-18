
import { LifestyleData, UserProfile, MatchResult, Gender } from '../types';

export const isGenderCompatible = (userA: UserProfile, userB: UserProfile): boolean => {
  // If same gender, they are compatible by default
  if (userA.gender === userB.gender) return true;
  
  // If different gender, both must explicitly allow opposite gender sharing
  return userA.allowOppositeGender && userB.allowOppositeGender;
};

export const calculateCompatibility = (userA: UserProfile, userB: UserProfile): number => {
  let totalScore = 0;
  const weights = {
    sleep: 10,
    cleanliness: 20,
    noise: 15,
    guests: 10,
    smoking: 15,
    pets: 10,
    cooking: 5,
    age: 15 
  };

  const lifestyleA = userA.lifestyle;
  const lifestyleB = userB.lifestyle;

  const diffs = {
    sleep: Math.abs(lifestyleA.sleep - lifestyleB.sleep),
    cleanliness: Math.abs(lifestyleA.cleanliness - lifestyleB.cleanliness),
    noise: Math.abs(lifestyleA.noise - lifestyleB.noise),
    guests: Math.abs(lifestyleA.guests - lifestyleB.guests),
    cooking: Math.abs(lifestyleA.cooking - lifestyleB.cooking)
  };

  totalScore += (1 - diffs.sleep / 100) * weights.sleep;
  totalScore += (1 - diffs.cleanliness / 100) * weights.cleanliness;
  totalScore += (1 - diffs.noise / 100) * weights.noise;
  totalScore += (1 - diffs.guests / 100) * weights.guests;
  totalScore += (1 - diffs.cooking / 100) * weights.cooking;

  if (lifestyleA.smoking === lifestyleB.smoking) {
    totalScore += weights.smoking;
  } else if (!lifestyleA.smoking && lifestyleB.smoking) {
    totalScore -= 15; 
  }

  if (lifestyleA.pets === lifestyleB.pets) {
    totalScore += weights.pets;
  }

  const ageDiff = Math.abs(userA.age - userB.age);
  const ageProximity = Math.max(0, 1 - (ageDiff / 15)); 
  totalScore += ageProximity * weights.age;

  const maxPossible = Object.values(weights).reduce((a, b) => a + b, 0);
  const percentage = Math.max(0, Math.min(100, (totalScore / maxPossible) * 100));
  
  return Math.round(percentage);
};

export const findMatches = (currentUser: UserProfile, others: UserProfile[]): MatchResult[] => {
  return others
    .filter(other => isGenderCompatible(currentUser, other))
    .map(other => ({
      ...other,
      score: calculateCompatibility(currentUser, other)
    }))
    .sort((a, b) => b.score - a.score);
};
