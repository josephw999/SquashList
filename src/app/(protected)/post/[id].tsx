import { useLocalSearchParams } from "expo-router";
import {
  View,
  Text,
  ScrollView,
  Image,
  Pressable,
  FlatList,
} from "react-native";
import posts from "../../../../assets/data/posts.json"; // adapt your JSON structure

export default function PostDetailed() {
  const { id } = useLocalSearchParams();

  const detailedPost = posts.find((post) => post.id === id);

  if (!detailedPost) {
    return <Text>Post Not Found!</Text>;
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: "white", padding: 10 }}>
      {/* Header Meta */}
      <View
        style={{ flexDirection: "row", alignItems: "center", marginBottom: 10 }}
      >
        <Text style={{ marginRight: 15 }}>⏱ {detailedPost.duration}</Text>
        <Text style={{ marginRight: 15 }}>
          👥 {detailedPost.players} players
        </Text>
        <Text>
          ⭐ {detailedPost.rating.score} ({detailedPost.rating.count})
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
        {detailedPost.tags.map((tag: string, index: number) => (
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

      {/* Coach */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 20,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Image
            source={{ uri: detailedPost.user.image }}
            style={{ width: 40, height: 40, borderRadius: 20, marginRight: 10 }}
          />
          <View>
            <Text style={{ fontWeight: "bold" }}>{detailedPost.user.name}</Text>
            <Text style={{ color: "gray" }}>{detailedPost.user.name}</Text>
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
      <Text style={{ fontWeight: "bold", fontSize: 16, marginBottom: 10 }}>
        Drills ({detailedPost.drills.length})
      </Text>
      {detailedPost.drills.map((drill, index) => (
        <View
          key={index}
          style={{
            borderWidth: 1,
            borderColor: "#E8E8E8",
            borderRadius: 10,
            padding: 12,
            marginBottom: 10,
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
          {drill.steps.map((step, stepIndex) => (
            <Text key={stepIndex} style={{ fontSize: 13, color: "#444" }}>
              • {step}
            </Text>
          ))}
        </View>
      ))}

      {/* Rate Session */}
      <View style={{ marginVertical: 20 }}>
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
