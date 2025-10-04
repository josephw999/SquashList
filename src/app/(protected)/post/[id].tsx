import { useLocalSearchParams, useNavigation, Stack } from "expo-router";
import { View, Text, ScrollView, Image, Pressable } from "react-native";
import { useEffect, useState } from "react";
import { useSupabase } from "../../../lib/supabase";
import { Post } from "../../../types/types";
import { AntDesign } from "@expo/vector-icons";
import { ActivityIndicator } from "react-native";
import { useMutation } from "@tanstack/react-query";
import { deletePostById } from "../../../services/postService";
import { Alert } from "react-native";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useAuth } from "@clerk/clerk-expo";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function PostDetailed() {
  const { id } = useLocalSearchParams();
  const navigation = useNavigation();
  const [post, setPost] = useState<Post | null>(null);
  const [user, setUser] = useState<any>(null); // Separate state for user details
  const [ratingAvg, setRatingAvg] = useState(0); // Separate state for avg to avoid full re-render
  const [ratingCount, setRatingCount] = useState(0); // Separate state for count
  const [loading, setLoading] = useState(true);
  const [ratingLoading, setRatingLoading] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [userRating, setUserRating] = useState<number | null>(null);

  const queryClient = useQueryClient();
  const router = useRouter();

  const supabase = useSupabase();
  const postId = id as string;

  const { isLoaded, isSignedIn, userId } = useAuth(); // Get Clerk's auth state

  // Function to fetch user's rating (with AsyncStorage persistence)
  const fetchUserRating = async () => {
    if (!currentUserId || !postId) {
      setUserRating(null);
      return;
    }
    setRatingLoading(true);

    try {
      // Load from AsyncStorage first (instant, persists across sessions)
      const storageKey = `userRating_${postId}`;
      const storedRating = await AsyncStorage.getItem(storageKey);
      if (storedRating !== null) {
        const parsedRating = JSON.parse(storedRating);
        // Check TTL (e.g., 1 hour = 3600000ms)
        if (Date.now() - parsedRating.timestamp < 3600000) {
          console.log("Loaded from storage:", parsedRating.rating);
          setUserRating(parsedRating.rating);
          setRatingLoading(false);
          return; // Skip DB if fresh
        }
      }

      // Fallback: Fetch from Supabase and cache
      const { data: ratingData, error: ratingError } = await supabase
        .from("ratings")
        .select("rating")
        .eq("post_id", postId)
        .eq("user_id", currentUserId)
        .single();

      if (ratingError && ratingError.code !== "PGRST116") {
        console.error("Error fetching user rating:", ratingError);
      } else {
        const rating = ratingData?.rating || null;
        setUserRating(rating);

        // Cache in storage with timestamp
        if (rating !== null) {
          await AsyncStorage.setItem(
            storageKey,
            JSON.stringify({ rating, timestamp: Date.now() })
          );
        } else {
          await AsyncStorage.removeItem(storageKey);
        }
      }
    } catch (err) {
      console.error("Error with storage or fetch:", err);
    } finally {
      setRatingLoading(false);
    }
  };

  // Mutation for rating submission (upsert)
  const { mutate: submitRating } = useMutation({
    mutationFn: async ({
      rating,
      oldRating,
    }: {
      rating: number;
      oldRating: number | null;
    }) => {
      const { error } = await supabase
        .from("ratings")
        .upsert(
          { user_id: currentUserId, post_id: postId, rating },
          { onConflict: "user_id,post_id" }
        );
      if (error) throw error;
    },
    onSuccess: async (_, { rating: newRating, oldRating }) => {
      queryClient.invalidateQueries({ queryKey: ["posts"] }); // Refresh post data elsewhere

      // Optimistically update only rating states (no full post refetch)
      const isUpdate = oldRating !== null;
      let newCount = ratingCount;
      let newSum = ratingAvg * ratingCount;
      if (isUpdate) {
        // Update: adjust sum by delta
        newSum = newSum - oldRating + newRating;
      } else {
        // New: increment count and add
        newCount = ratingCount + 1;
        newSum = newSum + newRating;
      }
      const newAvg = newCount > 0 ? newSum / newCount : 0;
      setRatingAvg(newAvg);
      setRatingCount(newCount);

      // Update AsyncStorage with the new rating for persistence
      const storageKey = `userRating_${postId}`;
      await AsyncStorage.setItem(
        storageKey,
        JSON.stringify({ rating: newRating, timestamp: Date.now() })
      );
    },
    onError: async (error) => {
      Alert.alert("Error", "Failed to submit rating");
      setUserRating(null);
      // Clear stale storage on error
      const storageKey = `userRating_${postId}`;
      await AsyncStorage.removeItem(storageKey);
    },
  });

  // Mutation for rating deletion
  const { mutate: deleteRating } = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("ratings")
        .delete()
        .eq("post_id", postId)
        .eq("user_id", currentUserId);
      if (error) throw error;
    },
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] }); // Refresh post data elsewhere

      // Optimistically update only rating states for deletion
      let newCount = ratingCount - 1;
      let newSum = ratingAvg * ratingCount - (userRating || 0);
      const newAvg = newCount > 0 ? newSum / newCount : 0;
      setRatingAvg(newAvg);
      setRatingCount(newCount);
      setUserRating(null);

      // Remove from AsyncStorage
      const storageKey = `userRating_${postId}`;
      await AsyncStorage.removeItem(storageKey);
    },
    onError: async (error) => {
      Alert.alert("Error", "Failed to remove rating");
      // Revert optimistic if error (but since we set null before, refetch might be better; for now, alert)
    },
  });

  // Handle rating selection
  const handleRating = (rating: number) => {
    if (!currentUserId) {
      Alert.alert("Error", "Please log in to rate this post");
      return;
    }
    if (rating === userRating && userRating !== null) {
      // Same rating: remove it
      deleteRating();
    } else {
      // Different or new: set and submit
      const oldRating = userRating;
      setUserRating(rating);
      submitRating({ rating, oldRating });
    }
  };

  // Function to fetch post (no join)
  const fetchPost = async () => {
    if (!postId) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("posts")
        .select(`*, drills(*)`) // No user join - fetch user separately
        .eq("id", postId)
        .single();

      if (error) {
        console.error("Error fetching post:", error);
        setPost(null);
      } else {
        console.log("Fetched post data:", data); // Debug fetched post
        setPost(data as Post);
        navigation.setOptions({ title: data.title });

        // Set rating states from fetched data
        setRatingAvg(data.rating_avg || 0);
        setRatingCount(data.rating_count || 0);

        // Fetch user separately if user_id exists
        if (data.user_id) {
          const { data: userData, error: userError } = await supabase
            .from("users") // Assuming your users table name
            .select("*")
            .eq("id", data.user_id)
            .single();

          if (userError) {
            console.error("Error fetching user:", userError);
            setUser(null);
          } else {
            setUser(userData);
          }
        } else {
          setUser(null);
        }
      }
    } catch (err) {
      console.error("Unexpected error fetching post:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isLoaded) {
      if (!isSignedIn || !userId) {
        console.log("No user signed in, redirecting to login");
        setError("Please log in to view this page.");
        if (router) router.replace("/login");
        return;
      }
      setCurrentUserId(userId);
      console.log("Current User ID from Clerk:", userId); // Debug user ID
    }
  }, [isLoaded, isSignedIn, userId, router]); // Depend on Clerk's auth state

  // Fetch post on ID change
  useEffect(() => {
    fetchPost();
  }, [id]);

  // Fetch user rating on userId or postId ready
  useEffect(() => {
    fetchUserRating();
  }, [postId, currentUserId]);

  const { mutate: deletePost } = useMutation({
    mutationFn: () => deletePostById(postId, supabase),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      router.back();
    },
    onError: (error) => {
      Alert.alert("Error", error.message);
    },
  });

  // Function to handle delete with confirmation
  const handleDelete = () => {
    Alert.alert(
      "Confirm Delete",
      "Are you sure you want to delete this post?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Yes",
          style: "destructive",
          onPress: () => deletePost(), // Proceed with deletion if confirmed
        },
      ],
      { cancelable: true }
    );
  };

  if (loading) return <ActivityIndicator />;
  if (!post) return <Text>Post Not Found!</Text>;

  return (
    <ScrollView style={{ flex: 1, backgroundColor: "white", padding: 10 }}>
      {/* Header Meta */}
      <Stack.Screen
        options={{
          headerRight: () =>
            currentUserId === post.user_id ? (
              <View style={{ flexDirection: "row", gap: 10 }}>
                <AntDesign
                  onPress={handleDelete}
                  name="delete"
                  size={24}
                  color="black"
                />
              </View>
            ) : null,
        }}
      />
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
            ⭐ {ratingAvg.toFixed(1)} ({ratingCount})
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
            source={{ uri: user?.image || "" }} // Empty fallback to prevent invalid URI
            style={{ width: 40, height: 40, borderRadius: 20, marginRight: 10 }}
          />
          <View>
            <Text style={{ fontWeight: "bold" }}>
              {user ? user.name : "Unknown User"}
            </Text>
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
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Text style={{ fontWeight: "bold" }}>Rate This Session:</Text>
        {ratingLoading ? (
          <ActivityIndicator size="small" color="gold" />
        ) : (
          [1, 2, 3, 4, 5].map((star) => (
            <AntDesign
              key={star}
              name={star <= (userRating || 0) ? "star" : "staro"}
              size={24}
              color="gold"
              onPress={() => handleRating(star)}
            />
          ))
        )}
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
