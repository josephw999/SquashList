import { useLocalSearchParams, useNavigation } from "expo-router";
import { View, Text, ScrollView, Image, Pressable } from "react-native";
import { useEffect, useState } from "react";
import { useSupabase } from "../../../lib/supabase";
import { Post } from "../../../types/types";

export default function PostDetailed() {
  const { id } = useLocalSearchParams();
  const navigation = useNavigation();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);

  const supabase = useSupabase();

  useEffect(() => {
    if (!id) return;

    const postId = Number(id);

    const fetchPost = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("posts")
        .select(
          `
          *,
          drills(*)
        `
        )
        .eq("id", postId)
        .single();

      if (error) {
        console.error("Error fetching post:", error);
        setPost(null);
      } else {
        setPost(data as Post);
        navigation.setOptions({ title: data.title });
      }
      setLoading(false);
    };

    fetchPost();
  }, [id]);

  if (loading) return <Text>Loading...</Text>;
  if (!post) return <Text>Post Not Found!</Text>;

  return (
    <ScrollView style={{ flex: 1, backgroundColor: "white", padding: 10 }}>
      {/* Header Meta */}
      <View
        style={{
          borderWidth: 1,
          borderColor: "#E8E8E8",
          borderRadius: 10,
          padding: 12,
          marginBottom: 20,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 10,
          }}
        >
          <Text style={{ marginRight: 15 }}>⏱ {post.duration}</Text>
          <Text style={{ marginRight: 15 }}>
            👥 {post.player_number} players
          </Text>
          <Text>
            ⭐ {post.rating_avg.toFixed(1)} ({post.rating_count})
          </Text>
        </View>

        {/* Tags */}
        <View
          style={{
            flexDirection: "row",
            flexWrap: "wrap",
            gap: 8,
            marginBottom: 15,
          }}
        >
          {post.tags.map((tag, index) => (
            <View
              key={index}
              style={{
                backgroundColor: "#E8E8E8",
                paddingHorizontal: 10,
                paddingVertical: 5,
                borderRadius: 15,
              }}
            >
              <Text style={{ fontSize: 13 }}>{tag}</Text>
            </View>
          ))}
        </View>
        <Text style={{ color: "gray" }}>{post.description}</Text>
      </View>

      {/* User */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 20,
          borderWidth: 1,
          borderColor: "#E8E8E8",
          borderRadius: 10,
          padding: 12,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Image
            source={{ uri: post.user?.image }}
            style={{ width: 40, height: 40, borderRadius: 20, marginRight: 10 }}
          />
          <View>
            <Text style={{ fontWeight: "bold" }}>{post.user?.name}</Text>
          </View>
        </View>
        <Pressable
          style={{
            backgroundColor: "black",
            paddingHorizontal: 20,
            paddingVertical: 8,
            borderRadius: 20,
          }}
        >
          <Text style={{ color: "white", fontWeight: "bold" }}>Follow</Text>
        </Pressable>
      </View>

      {/* Drills */}
      <View
        style={{
          borderWidth: 1,
          borderColor: "#E8E8E8",
          borderRadius: 10,
          paddingHorizontal: 12,
          paddingTop: 12,
          marginBottom: 20,
        }}
      >
        <Text style={{ fontWeight: "bold", fontSize: 16, marginBottom: 10 }}>
          Drills ({post.drills.length})
        </Text>
        {post.drills.map((drill, index) => (
          <View
            key={index}
            style={{
              borderWidth: 1,
              borderColor: "#E8E8E8",
              borderRadius: 10,
              padding: 12,
              marginBottom: 12,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                marginBottom: 5,
              }}
            >
              <Text style={{ fontWeight: "bold" }}>
                {index + 1}. {drill.title}
              </Text>
              <Text style={{ color: "gray" }}>{drill.duration}</Text>
            </View>
            <Text style={{ color: "gray", marginBottom: 5 }}>
              {drill.description}
            </Text>
            {drill.steps?.map((step, stepIndex) => (
              <Text key={stepIndex} style={{ fontSize: 13, color: "#444" }}>
                • {step}
              </Text>
            ))}
          </View>
        ))}
      </View>

      {/* Rate Session */}
      <View
        style={{
          borderWidth: 1,
          borderColor: "#E8E8E8",
          borderRadius: 10,
          padding: 12,
          marginBottom: 20,
        }}
      >
        <Text style={{ fontWeight: "bold", marginBottom: 10 }}>
          Rate This Session
        </Text>
        <Text>⭐⭐⭐⭐⭐ Tap to rate</Text>
      </View>

      {/* Start Button */}
      <Pressable
        style={{
          backgroundColor: "black",
          borderRadius: 10,
          paddingVertical: 15,
          alignItems: "center",
        }}
      >
        <Text style={{ color: "white", fontWeight: "bold" }}>
          Start Training Session
        </Text>
      </Pressable>
    </ScrollView>
  );
}
