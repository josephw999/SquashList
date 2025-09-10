import { Stack } from "expo-router";

export default function AppLayout() {
  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen
        name="post/[id]"
        options={{
          animation: "slide_from_bottom",
          headerBackButtonDisplayMode: "minimal",
        }}
      />
    </Stack>
  );
}
