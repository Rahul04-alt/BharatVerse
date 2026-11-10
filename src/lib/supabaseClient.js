import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing Supabase environment variables! Please check your .env.local file"
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Upload a file to the specified path in the 'heritage-uploads' bucket.
 * @param {File | Blob} file - The file to upload.
 * @param {string} path - The storage path for the file.
 * @returns {Promise<{path: string, url: string}>} Object containing uploaded file path and public URL.
 */
export const uploadFileToStorage = async (file, path) => {
  const { data, error } = await supabase.storage
    .from("heritage-uploads")
    .upload(path, file);

  if (error) throw error;

  const { data: urlData, error: urlError } = supabase.storage
    .from("heritage-uploads")
    .getPublicUrl(path);

  if (urlError) throw urlError;

  return {
    path: data.path,
    url: urlData.publicUrl,
  };
};

/**
 * Insert a heritage gem record into the 'hidden_gems' table.
 * Assumes gemData includes a valid submitter_id matching RLS policy.
 * @param {Object} gemData - The data object representing the heritage gem.
 * @returns {Promise<Object>} The inserted heritage gem record.
 */
export const insertHeritageGem = async (gemData) => {
  const { data, error } = await supabase
    .from("hidden_gems")
    .insert([gemData])
    .select();

  if (error) throw error;
  return data[0];
};
