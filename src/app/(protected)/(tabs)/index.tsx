import { View, FlatList } from "react-native";
import PostListItem from "../../../components/PostListItem";
// import posts from "../../../../assets/data/posts.json";

import { supabase } from "../../../lib/supabase";
import { useState, useEffect } from "react";
import { Tables } from "../../../types/database.types";

type Post = Tables<"posts"> & {
  user: Tables<"users">;
};

export default function HomeTab() {
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    const { data, error } = await supabase
      .from("posts")
      .select("*, user:users!posts_user_id_fkey(*)")
      .order("created_at", { ascending: false });

    setPosts(data);
  };

  return (
    <View>
      <FlatList
        data={posts}
        renderItem={({ item }) => <PostListItem post={item} />}
      />
    </View>
  );
}
