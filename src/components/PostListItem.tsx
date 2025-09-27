import { View, Text, StyleSheet, Pressable } from "react-native";
import { Post } from "../types/types";
import { Link } from "expo-router";
import { AntDesign } from "@expo/vector-icons";
import { MaterialIcons } from "@expo/vector-icons";

type PostListItemProps = {
  post: Post;
};

export default function PostListItem({ post }: PostListItemProps) {
  return (
    <View style={styles.card}>
      {/* TITLE + SUBTITLE */}
      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        <View>
          <Text style={styles.title}>{post.title}</Text>
          <Text style={styles.subtitle}>by {post.user?.name}</Text>
        </View>
        <View style={{ flexDirection: "row", gap: 5, alignItems: "center" }}>
          <MaterialIcons name="bookmark-outline" size={20} />
        </View>
      </View>

      {/* META INFO */}
      <View style={styles.metaRow}>
        <Text style={styles.meta}>⏱ {post.duration}min</Text>
        <Text style={styles.meta}>👥 {post.player_number} players </Text>
        <Text style={styles.meta}>
          ⭐ {post.rating_avg} ({post.rating_count})
        </Text>
      </View>

      {/* TAGS */}
      <View style={styles.tagsRow}>
        {post.tags.map((tag, idx) => (
          <View key={idx} style={styles.tag}>
            <Text style={styles.tagText}>{tag}</Text>
          </View>
        ))}
      </View>

      {/* DESCRIPTION */}
      <Text style={styles.description}>{post.description}</Text>

      {/* BUTTON */}

      <Link href={`/post/${post.id}`} asChild>
        <Pressable style={styles.button}>
          <Text style={styles.buttonText}>Open Session</Text>
        </Pressable>
      </Link>
    </View>
  );
}

{
  {
  }
}

const styles = StyleSheet.create({
  card: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    gap: 7,
    borderBottomColor: "lightgrey",
    borderBottomWidth: 0.5,
    backgroundColor: "white",
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
  },
  subtitle: {
    fontSize: 13,
    color: "grey",
    marginBottom: 8,
  },
  metaRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 8,
  },
  meta: {
    fontSize: 12,
    color: "#444",
  },
  tagsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginBottom: 8,
  },
  tag: {
    backgroundColor: "#F3F3F3",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  tagText: {
    fontSize: 12,
    color: "#333",
  },
  description: {
    fontSize: 13,
    color: "#555",
    marginBottom: 12,
  },
  button: {
    backgroundColor: "#000",
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontWeight: "600",
  },
});
