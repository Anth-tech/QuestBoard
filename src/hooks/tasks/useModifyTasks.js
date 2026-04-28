import { createClient } from "@/lib/client";

const supabase = createClient();

export function useModifyTasks(refetch) {

    //updates existing task's fields in the database
    const editTask = async (updateTask) => {
        const { error } = await supabase.from("tasks").
            update({title: updateTask.title, description: updateTask.description, priority: updateTask.priority, 
            deadline: updateTask.deadline, folder_id: updateTask.folder_id ?? null,}).eq("id", updateTask.id);

        if (error) console.error("editTask: ", error.message);
        else refetch();
    };

    //permanent removal of a task from the database by id
    const deleteTask = async (taskID) => {
        const { error } = await supabase.from("tasks").delete().eq("id", taskID);

        if (error) console.error("deleteTask: ", error.message);
        else refetch();
    };

    return { editTask, deleteTask };

}