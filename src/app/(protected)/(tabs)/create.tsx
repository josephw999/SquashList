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
                }}
              >
                {drill.collapsed ? (
                  <View>
                    <Text style={{ fontWeight: "600" }}>
                      {drill.name || "Untitled Drill"}
                    </Text>
                    <Text>
                      {drill.minutes}m {drill.seconds}s
                    </Text>
                  </View>
                ) : (
                  <>
                    <Text style={{ fontWeight: "600", marginBottom: 5 }}>
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

                    {/* Minute/Second Pickers */}
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
                  </>
                )}
              </View>
            ))}

            <Pressable
              onPress={addDrill}
              style={{
                backgroundColor: "black",
                padding: 15,
                borderRadius: 10,
                marginBottom: 40,
                alignItems: "center",
              }}
            >
              <Text style={{ color: "white", fontWeight: "bold" }}>
                + Add Drill
              </Text>
            </Pressable>

            {/* Create Session Button */}
            <Pressable
              style={{
                backgroundColor: "#7A7A7A",
                padding: 16,
                borderRadius: 10,
                alignItems: "center",
                marginBottom: 20,
              }}
            >
              <Text
                style={{ color: "white", fontWeight: "bold", fontSize: 16 }}
              >
                Create Session
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
