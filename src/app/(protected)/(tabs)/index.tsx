import { View, Text, FlatList } from "react-native";
import PostListItem from "../../../components/PostListItem";
import { fetchPosts } from "../../../services/postService";
import { useQuery } from "@tanstack/react-query";
import { useSupabase } from "../../../lib/supabase";

export default function HomeTab() {
  const supabase = useSupabase();

  const {
    data: posts,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["posts"],
    queryFn: () => fetchPosts(supabase),
    staleTime: 1000 * 60 * 5,
  });

  if (isLoading) return <Text>Loading...</Text>;
  if (error) return <Text>Error loading posts</Text>;

  return (
    <View>
      <FlatList
        data={posts}
        renderItem={({ item }) => <PostListItem post={item} />}
      />
    </View>
  );
}
