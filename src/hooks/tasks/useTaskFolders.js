import { createClient } from "@/lib/client";
 
const supabase = createClient();
 
/** useTaskFolder - assigns or clears the folder_id on a task.
    Requires a `id` uuid column (nullable, FK to folders.id) on the tasks table.
   @param {Function} refetch - refetch callback from useTasks so the UI stays in sync
 */
export function useTaskFolders(refetch) {
  /** Assigns a task to a folder, or clears it (pass null to unfolder).
     @param {string} taskId
     @param {string|null} folderId
   */
  const assignFolder = async (taskId, folderId) => {
    const { error } = await supabase
      .from("tasks")
      .update({ folder_id: folderId ?? null })
      .eq("id", taskId);
 
    if (error) {
      console.error("Failed to assign folder:", error);
      return false;
    }
 
    await refetch();
    return true;
  };
 
  return { assignFolder };
}