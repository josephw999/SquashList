export type Post = {
  id: number;
  title: string;
  description: string | null;
  user: User;
  rating: Rating;
  duration: number;
  player_number: number;
  tags: string[];
  drills: Drill[];
  rating_avg: number;
  rating_count: number;
};

export type Rating = {
  score: number;
  count: number;
};

export type User = {
  id: number;
  name: string;
  image: string | undefined;
};

export type Drill = {
  id: number;
  title: string;
  description: string;
  duration: number;
  steps: string[];
};
