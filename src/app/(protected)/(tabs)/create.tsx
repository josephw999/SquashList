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
  FlatList,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AntDesign from "@expo/vector-icons/AntDesign";
import { router } from "expo-router";

export default function CreateScreen() {
  const [sessionTitle, setSessionTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedPlayer, setSelectedPlayer] = useState("1 player");
  const [selectedBall, setSelectedBall] = useState("Any");
  const [selectedFocus, setSelectedFocus] = useState<string[]>([]);
  const [drillName, setDrillName] = useState("");
  const [drillDuration, setDrillDuration] = useState("180");
  const [drillDesc, setDrillDesc] = useState("");
  const [drillSteps, setDrillSteps] = useState([""]);
  const [intensity, setIntensity] = useState("5");

  const toggleFocus = (item: string) => {
    setSelectedFocus((prev) =>
      prev.includes(item) ? prev.filter((f) => f !== item) : [...prev, item]
    );
  };

  const [playerDropdownVisible, setPlayerDropdownVisible] = useState(false);
  const [ballDropdownVisible, setBallDropdownVisible] = useState(false);

  const playerOptions = [
    "1 player",
    "2 players",
    "3 players",
    "4 players",
    "5+ players",
  ];

  const ballOptions = ["Any", "Double Yellow", "Single Yellow", "Red", "Blue"];

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
            <Text
              style={{
                fontSize: 20,
                fontWeight: "bold",
                marginLeft: 10,
              }}
            >
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
              placeholder="Describe what this session focuses on and who it's for..."
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

            {/* Player & Ball Type */}
            {/* Players Dropdown */}

            <View style={{ flexDirection: "row", gap: 10, marginBottom: 15 }}>
              {/* Players Dropdown */}
              <View style={{ flex: 1 }}>
                <Text style={{ fontWeight: "600", marginBottom: 5 }}>
                  Players
                </Text>
                <TouchableOpacity
                  onPress={() => setPlayerDropdownVisible(true)}
                  style={{
                    backgroundColor: "#F0F0F0",
                    padding: 10,
                    borderRadius: 8,
                    justifyContent: "center",
                  }}
                >
                  <Text>{selectedPlayer || "Select Player Count"}</Text>
                </TouchableOpacity>
              </View>

              {/* Ball Type Dropdown */}
              <View style={{ flex: 1 }}>
                <Text style={{ fontWeight: "600", marginBottom: 5 }}>
                  Ball Type
                </Text>
                <TouchableOpacity
                  onPress={() => setBallDropdownVisible(true)}
                  style={{
                    backgroundColor: "#F0F0F0",
                    padding: 10,
                    borderRadius: 8,
                    justifyContent: "center",
                  }}
                >
                  <Text>{selectedBall || "Select Ball Type"}</Text>
                </TouchableOpacity>
              </View>
            </View>

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
                      style={{
                        paddingVertical: 10,
                        paddingHorizontal: 5,
                      }}
                    >
                      <Text>{item}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </TouchableOpacity>
            </Modal>

            {/* Ball Type Dropdown */}
            <Modal
              transparent
              visible={ballDropdownVisible}
              animationType="fade"
              onRequestClose={() => setBallDropdownVisible(false)}
            >
              <TouchableOpacity
                style={{
                  flex: 1,
                  backgroundColor: "rgba(0,0,0,0.3)",
                  justifyContent: "center",
                  paddingHorizontal: 40,
                }}
                onPress={() => setBallDropdownVisible(false)}
                activeOpacity={1}
              >
                <View
                  style={{
                    backgroundColor: "white",
                    borderRadius: 10,
                    padding: 10,
                  }}
                >
                  {ballOptions.map((item) => (
                    <TouchableOpacity
                      key={item}
                      onPress={() => {
                        setSelectedBall(item);
                        setBallDropdownVisible(false);
                      }}
                      style={{
                        paddingVertical: 10,
                        paddingHorizontal: 5,
                      }}
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
                marginBottom: 15,
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

            {/* Intensity */}
            <Text style={{ fontWeight: "600", marginBottom: 5 }}>
              Intensity (1–10)
            </Text>
            <TextInput
              keyboardType="numeric"
              value={intensity}
              onChangeText={(val) => {
                // Ensure only values between 1–10
                if (/^\d{0,2}$/.test(val)) {
                  const num = parseInt(val);
                  if (!isNaN(num) && num >= 1 && num <= 10) {
                    setIntensity(val);
                  } else if (val === "") {
                    setIntensity(""); // allow clearing
                  }
                }
              }}
              placeholder="1-10"
              style={{
                backgroundColor: "#F0F0F0",
                padding: 10,
                borderRadius: 8,
                marginBottom: 15,
              }}
            />

            {/* Add Drill */}
            <Text
              style={{ fontSize: 18, fontWeight: "bold", marginBottom: 10 }}
            >
              Add Drill
            </Text>

            <Text style={{ fontWeight: "600", marginBottom: 5 }}>
              Drill Name *
            </Text>
            <TextInput
              placeholder="e.g., Court Sprints"
              value={drillName}
              onChangeText={setDrillName}
              style={{
                backgroundColor: "#F0F0F0",
                padding: 10,
                borderRadius: 8,
                marginBottom: 10,
              }}
            />

            <Text style={{ fontWeight: "600", marginBottom: 5 }}>
              Duration (seconds)
            </Text>
            <TextInput
              keyboardType="numeric"
              value={drillDuration}
              onChangeText={setDrillDuration}
              style={{
                backgroundColor: "#F0F0F0",
                padding: 10,
                borderRadius: 8,
                marginBottom: 10,
              }}
            />

            <Text style={{ fontWeight: "600", marginBottom: 5 }}>
              Description *
            </Text>
            <TextInput
              placeholder="Brief description of the drill..."
              value={drillDesc}
              onChangeText={setDrillDesc}
              multiline
              style={{
                backgroundColor: "#F0F0F0",
                padding: 10,
                borderRadius: 8,
                marginBottom: 10,
                height: 60,
                textAlignVertical: "top",
              }}
            />

            <Text style={{ fontWeight: "600", marginBottom: 5 }}>
              Instructions
            </Text>
            {drillSteps.map((step, index) => (
              <TextInput
                key={index}
                placeholder={`Step ${index + 1}...`}
                value={step}
                onChangeText={(text) => {
                  const newSteps = [...drillSteps];
                  newSteps[index] = text;
                  setDrillSteps(newSteps);
                }}
                style={{
                  backgroundColor: "#F0F0F0",
                  padding: 10,
                  borderRadius: 8,
                  marginBottom: 8,
                }}
              />
            ))}
            <Pressable
              onPress={() => setDrillSteps([...drillSteps, ""])}
              style={{
                backgroundColor: "#DCDCDC",
                padding: 10,
                borderRadius: 8,
                marginBottom: 20,
                alignItems: "center",
              }}
            >
              <Text style={{ fontWeight: "600" }}>+ Add Step</Text>
            </Pressable>

            <Pressable
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

            {/* Final Create Button */}
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
