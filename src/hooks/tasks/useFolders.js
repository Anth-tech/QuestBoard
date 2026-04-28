import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/client";
 
const supabase = createClient();
 
/** useFolders - fetches, creates, and deletes task folders for a given project.
    Folders are stored in the `folders` table with columns: id, project_uid, name.
   @param {string|null} projectId - the current project UUID
  */
export function useFolders(projectId) {
  const [folders, setFolders] = useState([]);
  const [loading, setLoading] = useState(false);
 
  const fetchFolders = useCallback(async () => {
    if (!projectId) return;
    setLoading(true);
 
    const { data, error } = await supabase
      .from("folders")
      .select("*")
      .eq("project_uid", projectId)
      .order("name");
 
    if (!error) setFolders(data ?? []);
    setLoading(false);
  }, [projectId]);
 
  useEffect(() => {
    fetchFolders();
  }, [fetchFolders]);
 
  /* Creates a new folder and returns it. */
  const createFolder = async (name) => {
    const trimmed = name.trim();
    if (!trimmed || !projectId) return null;
 
    const { data, error } = await supabase
      .from("folders")
      .insert({ project_uid: projectId, name: trimmed })
      .select()
      .single();
 
    if (error) {
      console.error("Failed to create folder:", error);
      return null;
    }
 
    setFolders((prev) => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)));
    return data;
  };
 
  /* Deletes a folder by id. Tasks in that folder become unfoldered. */
  const deleteFolder = async (folderId) => {
    const { error } = await supabase
      .from("folders")
      .delete()
      .eq("id", folderId);
 
    if (error) {
      console.error("Failed to delete folder:", error);
      return false;
    }
 
    setFolders((prev) => prev.filter((f) => f.id !== folderId));
    return true;
  };
 
  return { folders, loading, createFolder, deleteFolder, refetchFolders: fetchFolders };
}