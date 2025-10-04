import { SupabaseClient } from "@supabase/supabase-js";
import { Database, TablesInsert } from "../types/database.types";

export const fetchPosts = async (supabase: SupabaseClient<Database>) => {
  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  } else {
    return data;
  }
};

type InsertPost = TablesInsert<"posts">;

export const insertPost = async (
  post: InsertPost,
  supabase: SupabaseClient<Database>
) => {
  // use supabase to insert a new post
  const { data, error } = await supabase
    .from("posts")
    .insert(post)
    .select() // specifies which column to retun (eg. id, title)
    .single(); // return a single object not an array

  if (error) {
    throw error;
  } else {
    return data;
  }
};

export const deletePostById = async (
  id: string,
  supabase: SupabaseClient<Database>
) => {
  const { data, error } = await supabase.from("posts").delete().eq("id", id);
  if (error) {
    throw error;
  } else {
    return data;
  }
};
