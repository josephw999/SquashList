export type Post = {
  id: string;
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
  id: string;
  name: string;
  image: string | undefined;
};

export type Drill = {
  id: string;
  title: string;
  description: string;
  duration: number;
  steps: string[];
};
