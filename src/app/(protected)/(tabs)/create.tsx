import React, { useState } from "react";
import {
  ScrollView,
  Text,
  TextInput,
  View,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  TouchableOpacity,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AntDesign from "@expo/vector-icons/AntDesign";
import { Picker } from "@react-native-picker/picker";
import { router } from "expo-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Alert } from "react-native";
import { useSupabase } from "../../../lib/supabase";
import { useAuth } from "@clerk/clerk-expo";

type Drill = {
  name: string;
  minutes: number;
  seconds: number;
  description: string;
  collapsed: boolean;
};

export default function CreateScreen() {
  const [sessionTitle, setSessionTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedPlayer, setSelectedPlayer] = useState("1 player");
  const [selectedFocus, setSelectedFocus] = useState<string[]>([]);
  const [playerDropdownVisible, setPlayerDropdownVisible] = useState(false);
  const [drills, setDrills] = useState<Drill[]>([
    { name: "", minutes: 0, seconds: 0, description: "", collapsed: false },
  ]);

  const queryClient = useQueryClient();
  const supabase = useSupabase();
  const { userId, user } = useAuth(); // Get Clerk user details

  const { mutate, isPending } = useMutation({
    mutationFn: async () => {
      if (!userId) {
        throw new Error("You must be logged in to create a post");
      }

      // Calculate total session duration in seconds
      const totalDuration = drills.reduce(
        (sum, d) => sum + d.minutes * 60 + d.seconds,
        0
      );

      // Insert the post first to get its ID
      const { data: newPost, error: postError } = await supabase
        .from("posts")
        .insert({
          title: sessionTitle,
          description,
          tags: selectedFocus,
          player_number: parseInt(selectedPlayer.split(" ")[0]), // e.g., 1 from "1 player"
          duration: totalDuration, // Total seconds
          user_id: userId,
        })
        .select()
        .single();

      if (postError) {
        console.error("Post insert error:", postError); // Debug in console
        throw postError;
      }

      // Insert drills (if any valid ones)
      const validDrills = drills.filter((d) => d.name.trim()); // Skip empty
      if (validDrills.length > 0) {
        const drillsData = validDrills.map((d) => ({
          post_id: newPost.id,
          title: d.name,
          duration: d.minutes * 60 + d.seconds, // Drill duration in seconds
          description: d.description,
          // Removed steps to avoid schema error
        }));

        const { error: drillsError } = await supabase
          .from("drills")
          .insert(drillsData);

        if (drillsError) {
          console.error("Drills insert error:", drillsError); // Debug in console
          throw drillsError;
        }
      }

      return newPost;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] }); // Refresh lists
      Alert.alert("Success", "Training session created");
      router.back();
    },
    onError: (error: any) => {
      console.error("Mutation error:", error); // Debug full error
      Alert.alert("Error", error.message || "Failed to create session");
    },
  });

  const toggleFocus = (item: string) => {
    setSelectedFocus((prev) =>
      prev.includes(item) ? prev.filter((f) => f !== item) : [...prev, item]
    );
  };

  const addDrill = () => {
    setDrills((prev) =>
      prev
        .map((d, i) => (i === prev.length - 1 ? { ...d, collapsed: true } : d))
        .concat({
          name: "",
          minutes: 0,
          seconds: 0,
          description: "",
          collapsed: false,
        })
    );
  };

  const updateDrill = (i: number, field: Partial<Drill>) => {
    setDrills((prev) =>
      prev.map((d, idx) => (idx === i ? { ...d, ...field } : d))
    );
  };

  const playerOptions = [
    "1 player",
    "2 players",
    "3 players",
    "4 players",
    "5+ players",
  ];
  const focusAreas = [
    "Drop",
    "Lob",
    "Drive",
    "Boast",
    "Volley",
    "Footwork",
    "Movement",
    "Technique",
    "Deception",
    "Strategy",
    "Fitness",
    "Pressure",
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "white" }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
      >
        <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
          {/* Header */}
          <View
            style={{ flexDirection: "row", alignItems: "center", padding: 15 }}
          >
            <TouchableOpacity onPress={() => router.back()}>
              <AntDesign name="close" size={28} color="black" />
            </TouchableOpacity>
            <Text style={{ fontSize: 20, fontWeight: "bold", marginLeft: 10 }}>
              Create Training Session
            </Text>
          </View>

          <View style={{ padding: 20 }}>
            {/* Session Title */}
            <Text style={{ fontWeight: "600", marginBottom: 5 }}>
              Session Title *
            </Text>
            <TextInput
              placeholder="Title your session..."
              value={sessionTitle}
              onChangeText={setSessionTitle}
              style={{
                backgroundColor: "#F0F0F0",
                padding: 10,
                borderRadius: 8,
                marginBottom: 15,
              }}
            />

            {/* Description */}
            <Text style={{ fontWeight: "600", marginBottom: 5 }}>
              Description *
            </Text>
            <TextInput
              placeholder="Describe the session..."
              value={description}
              onChangeText={setDescription}
              multiline
              style={{
                backgroundColor: "#F0F0F0",
                padding: 10,
                borderRadius: 8,
                height: 80,
                marginBottom: 15,
                textAlignVertical: "top",
              }}
            />

            {/* Players */}
            <Text style={{ fontWeight: "600", marginBottom: 5 }}>Players</Text>
            <TouchableOpacity
              onPress={() => setPlayerDropdownVisible(true)}
              style={{
                backgroundColor: "#F0F0F0",
                padding: 10,
                borderRadius: 8,
                marginBottom: 15,
              }}
            >
              <Text>{selectedPlayer}</Text>
            </TouchableOpacity>

            <Modal
              transparent
              visible={playerDropdownVisible}
              animationType="fade"
              onRequestClose={() => setPlayerDropdownVisible(false)}
            >
              <TouchableOpacity
                style={{
                  flex: 1,
                  backgroundColor: "rgba(0,0,0,0.3)",
                  justifyContent: "center",
                  paddingHorizontal: 40,
                }}
                onPress={() => setPlayerDropdownVisible(false)}
                activeOpacity={1}
              >
                <View
                  style={{
                    backgroundColor: "white",
                    borderRadius: 10,
                    padding: 10,
                  }}
                >
                  {playerOptions.map((item) => (
                    <TouchableOpacity
                      key={item}
                      onPress={() => {
                        setSelectedPlayer(item);
                        setPlayerDropdownVisible(false);
                      }}
                      style={{ paddingVertical: 10 }}
                    >
                      <Text>{item}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </TouchableOpacity>
            </Modal>

            {/* Focus Areas */}
            <Text style={{ fontWeight: "600", marginBottom: 5 }}>
              Focus Areas
            </Text>
            <View
              style={{
                flexDirection: "row",
                flexWrap: "wrap",
                gap: 8,
                marginBottom: 20,
              }}
            >
              {focusAreas.map((item) => (
                <TouchableOpacity
                  key={item}
                  onPress={() => toggleFocus(item)}
                  style={{
                    backgroundColor: selectedFocus.includes(item)
                      ? "#000"
                      : "#F0F0F0",
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    borderRadius: 20,
                  }}
                >
                  <Text
                    style={{
                      color: selectedFocus.includes(item) ? "#fff" : "#000",
                      fontWeight: "500",
                    }}
                  >
                    {item}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Drills */}
            <Text
              style={{ fontSize: 18, fontWeight: "bold", marginBottom: 10 }}
            >
              Drills
            </Text>
            {drills.map((drill, i) => (
              <View
                key={i}
                style={{
                  borderWidth: 1,
                  borderColor: "#ccc",
                  borderRadius: 10,
                  padding: 15,
                  marginBottom: 15,
                  backgroundColor: "#fff",
                }}
              >
                {drill.collapsed ? (
                  // Collapsed view
                  <TouchableOpacity
                    onPress={() =>
                      setDrills((prev) =>
                        prev.map((d, idx) =>
                          idx === i
                            ? { ...d, collapsed: false }
                            : { ...d, collapsed: true }
                        )
                      )
                    }
                  >
                    <Text style={{ fontWeight: "600", fontSize: 16 }}>
                      {i + 1}. {drill.name || "Untitled Drill"}
                    </Text>
                    <Text style={{ color: "#555", marginVertical: 2 }}>
                      {drill.minutes}:
                      {drill.seconds.toString().padStart(2, "0")}
                    </Text>
                    {drill.description ? (
                      <Text
                        style={{ color: "#555" }}
                        numberOfLines={2}
                        ellipsizeMode="tail"
                      >
                        {drill.description}
                      </Text>
                    ) : null}
                  </TouchableOpacity>
                ) : (
                  // Expanded view
                  <View>
                    {/* Top bar (tappable area to collapse) */}
                    <TouchableOpacity
                      onPress={() =>
                        setDrills((prev) =>
                          prev.map((d, idx) =>
                            idx === i
                              ? { ...d, collapsed: true }
                              : { ...d, collapsed: true }
                          )
                        )
                      }
                      style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                      }}
                    >
                      <Text style={{ fontWeight: "600", fontSize: 16 }}>
                        {i + 1}. {drill.name || "Untitled Drill"}
                      </Text>
                      {/* Trash button */}
                      <TouchableOpacity
                        onPress={(e) => {
                          e.stopPropagation(); // prevent collapsing
                          setDrills((prev) =>
                            prev.filter((_, idx) => idx !== i)
                          );
                        }}
                        style={{ paddingHorizontal: 8 }}
                      >
                        <AntDesign name="delete" size={22} color="black" />
                      </TouchableOpacity>
                    </TouchableOpacity>

                    {/* Inputs (not collapsible area) */}
                    <Text
                      style={{
                        fontWeight: "600",
                        marginTop: 10,
                        marginBottom: 5,
                      }}
                    >
                      Drill Name *
                    </Text>
                    <TextInput
                      placeholder="e.g., Court Sprints"
                      value={drill.name}
                      onChangeText={(t) => updateDrill(i, { name: t })}
                      style={{
                        backgroundColor: "#F0F0F0",
                        padding: 10,
                        borderRadius: 8,
                        marginBottom: 10,
                      }}
                    />

                    <Text style={{ fontWeight: "600", marginBottom: 5 }}>
                      Duration
                    </Text>
                    <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                      }}
                    >
                      <Picker
                        selectedValue={drill.minutes}
                        style={{ flex: 1 }}
                        onValueChange={(v) => updateDrill(i, { minutes: v })}
                      >
                        {Array.from({ length: 61 }).map((_, m) => (
                          <Picker.Item key={m} label={`${m} min`} value={m} />
                        ))}
                      </Picker>
                      <Picker
                        selectedValue={drill.seconds}
                        style={{ flex: 1 }}
                        onValueChange={(v) => updateDrill(i, { seconds: v })}
                      >
                        {Array.from({ length: 60 }).map((_, s) => (
                          <Picker.Item key={s} label={`${s} sec`} value={s} />
                        ))}
                      </Picker>
                    </View>

                    <Text
                      style={{
                        fontWeight: "600",
                        marginBottom: 5,
                        marginTop: 10,
                      }}
                    >
                      Description
                    </Text>
                    <TextInput
                      placeholder="Brief description..."
                      value={drill.description}
                      onChangeText={(t) => updateDrill(i, { description: t })}
                      multiline
                      style={{
                        backgroundColor: "#F0F0F0",
                        padding: 10,
                        borderRadius: 8,
                        height: 60,
                        textAlignVertical: "top",
                      }}
                    />
                  </View>
                )}
              </View>
            ))}

            {/* Add Drill Button (big grey plus) */}
            <TouchableOpacity
              onPress={addDrill}
              style={{
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 30,
              }}
            >
              <AntDesign name="pluscircleo" size={40} color="#A9A9A9" />
            </TouchableOpacity>

            {/* Create Session Button */}
            <Pressable
              onPress={() => mutate()}
              disabled={isPending || !sessionTitle || !description}
              style={{
                backgroundColor: isPending ? "#ccc" : "#7A7A7A",
                padding: 16,
                borderRadius: 10,
                alignItems: "center",
                marginBottom: 20,
              }}
            >
              <Text
                style={{ color: "white", fontWeight: "bold", fontSize: 16 }}
              >
                {isPending ? "Creating..." : "Create Session"}
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
