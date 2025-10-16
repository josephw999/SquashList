import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { useEffect, useState, useRef } from "react";
import { useSupabase } from "../../../lib/supabase";
import { Post } from "../../../types/types";
import * as Speech from "expo-speech";
import { Ionicons } from "@expo/vector-icons";
import { Svg, Circle } from "react-native-svg";
import { useNavigation } from "@react-navigation/native";

export default function TrainingSession() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const supabase = useSupabase();
  const navigation = useNavigation();

  const [post, setPost] = useState<Post | null>(null);
  const [currentDrillIndex, setCurrentDrillIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(5);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isCountdown, setIsCountdown] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const fetchPost = async () => {
      const { data, error } = await supabase
        .from("posts")
        .select("*, drills(*)")
        .eq("id", id)
        .single();

      if (error) {
        setError(error.message);
      } else {
        setPost(data as Post);
        setCurrentDrillIndex(0);
        setTimeLeft(5);
        setIsCountdown(true);
        setIsPlaying(false);
      }
    };
    fetchPost();
  }, [id]);

  // Timer logic
  useEffect(() => {
    if (!isPlaying || !post) return;

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);

          if (isCountdown) {
            const currentDrill = post.drills[currentDrillIndex];
            const duration = currentDrill.duration || 30;
            setIsCountdown(false);
            setTimeLeft(duration);
            Speech.speak(`${currentDrill.title}`);
          } else {
            const nextIndex = currentDrillIndex + 1;
            if (nextIndex < post.drills.length) {
              setCurrentDrillIndex(nextIndex);
              setIsCountdown(true);
              setTimeLeft(5);
            } else {
              Speech.speak("Training session complete!");
              router.back();
            }
          }

          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current!);
  }, [isPlaying, isCountdown, currentDrillIndex, post]);

  const togglePlayPause = () => {
    if (!post) return;
    setIsPlaying((prev) => !prev);
  };

  const skipForward = () => {
    if (!post) return;
    if (currentDrillIndex + 1 < post.drills.length) {
      setCurrentDrillIndex((i) => i + 1);
      setIsCountdown(true);
      setTimeLeft(5);
      setIsPlaying(false);
    }
  };

  const skipBackward = () => {
    if (!post) return;
    if (currentDrillIndex > 0) {
      setCurrentDrillIndex((i) => i - 1);
      setIsCountdown(true);
      setTimeLeft(5);
      setIsPlaying(false);
    }
  };

  if (error) return <Text style={styles.error}>{error}</Text>;
  if (!post)
    return <ActivityIndicator size="large" style={{ marginTop: 100 }} />;

  const currentDrill = post.drills[currentDrillIndex];
  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const totalTime = isCountdown ? 5 : currentDrill.duration || 30;
  const progress = (timeLeft / totalTime) * circumference;

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: "Training Session" }} />
      {/* Title */}
      <Text style={styles.title}>{currentDrill.title}</Text>

      {/* Circular Timer */}
      <View style={styles.timerContainer}>
        <Svg height="200" width="200">
          <Circle
            stroke="#eee"
            fill="none"
            cx="100"
            cy="100"
            r={radius}
            strokeWidth="10"
          />
          <Circle
            stroke="#000"
            fill="none"
            cx="100"
            cy="100"
            r={radius}
            strokeWidth="10"
            strokeDasharray={circumference}
            strokeDashoffset={circumference - progress}
            strokeLinecap="round"
            rotation="-90"
            origin="100,100"
          />
        </Svg>
        <Text style={styles.timerText}>
          {Math.floor(timeLeft / 60)}:
          {(timeLeft % 60).toString().padStart(2, "0")}
        </Text>
      </View>

      <Text style={styles.progress}>
        Drill {currentDrillIndex + 1} of {post.drills.length}
      </Text>

      {/* Controls */}
      <View style={styles.controls}>
        <Pressable onPress={skipBackward} style={styles.iconButton}>
          <Ionicons name="play-skip-back" size={30} color="white" />
        </Pressable>

        <Pressable onPress={togglePlayPause} style={styles.iconButton}>
          <Ionicons
            name={isPlaying ? "pause" : "play"}
            size={30}
            color="white"
          />
        </Pressable>

        <Pressable onPress={skipForward} style={styles.iconButton}>
          <Ionicons name="play-skip-forward" size={30} color="white" />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    padding: 20,
    justifyContent: "center",
  },
  header: {
    position: "absolute",
    top: 60,
    left: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    marginBottom: 20,
    textAlign: "center",
    marginTop: 40,
  },
  timerContainer: {
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 40,
  },
  timerText: {
    position: "absolute",
    fontSize: 48,
    fontWeight: "bold",
  },
  progress: {
    fontSize: 18,
    color: "#666",
    marginBottom: 30,
  },
  controls: {
    flexDirection: "row",
    gap: 20,
  },
  iconButton: {
    backgroundColor: "#000",
    padding: 14,
    borderRadius: 10,
  },
  error: {
    color: "red",
    padding: 20,
    textAlign: "center",
  },
});
