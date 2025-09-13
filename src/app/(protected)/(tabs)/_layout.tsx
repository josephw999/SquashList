import { AntDesign, Feather, Ionicons } from "@expo/vector-icons";
import { Redirect, Tabs } from "expo-router";
import { useAuth } from "@clerk/clerk-expo";
import { Provider as PaperProvider } from "react-native-paper";

export default function TabLayout() {
  const { isSignedIn } = useAuth();
  const { signOut } = useAuth();

  if (!isSignedIn) {
    return <Redirect href={"/sign-in"} />;
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "black",
        headerRight: () => (
          <Feather
            name="log-out"
            size={22}
            color="black"
            style={{ paddingRight: 10 }}
            onPress={() => signOut()}
          />
        ),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          // headerShown: false,
          title: "Home",
          headerTintColor: "#000000ff",
          tabBarIcon: ({ color }) => (
            <AntDesign name="home" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          // headerShown: false,
          title: "Search",
          tabBarIcon: ({ color }) => (
            <Feather name="search" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="create"
        options={{
          headerShown: false,
          tabBarStyle: { display: "none" },
          title: "Create",
          tabBarIcon: ({ color }) => (
            <AntDesign name="plus" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="saved"
        options={{
          // headerShown: false,
          title: "Saved",
          tabBarIcon: ({ color }) => (
            <Ionicons name="book-outline" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          // headerShown: false,
          title: "Profile",
          tabBarIcon: ({ color }) => (
            <Feather name="user" size={24} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
