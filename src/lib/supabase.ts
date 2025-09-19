import { AppState } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";
import { Database } from "../types/database.types";
import { useSession } from "@clerk/clerk-expo";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

export const useSupabase = () => {
  const { session } = useSession();

  return createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
    global: {
      // Get the custom Supabase token from Clerk
      fetch: async (url, options = {}) => {
        // The Clerk `session` object has the getToken() method
        const clerkToken = await session?.getToken({
          // Pass the name of the JWT template you created in the Clerk Dashboard
          // For this tutorial, you named it 'supabase'
          template: "supabase",
        });

        // Insert the Clerk Supabase token into the headers
        const headers = new Headers(options?.headers);
        headers.set("Authorization", `Bearer ${clerkToken}`);

        // Call the default fetch
        return fetch(url, {
          ...options,
          headers,
        });
      },
    },
  });
};

const supabaseClient = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  // your config
});

// Now this will work
AppState.addEventListener("change", (state) => {
  if (state === "active") {
    supabaseClient.auth.startAutoRefresh();
  } else {
    supabaseClient.auth.stopAutoRefresh();
  }
});
