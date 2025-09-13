export type Post = {
  id: string;
  title: string;
  description: string | null;
  user: User;
  rating: Rating;
  duration: string;
  players: string;
  tags: string[];
  drills: Drill[];
};

export type Rating = {
  score: number;
  count: number;
};

export type User = {
  name: string;
  image: string | null;
};

export type Drill = {
  id: string;
  title: string;
  description: string;
  duration: string;
  steps: string[];
};
