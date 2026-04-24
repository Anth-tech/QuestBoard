"use client";
import { createClient } from "@/lib/client";
import { useEffect, useState } from "react";


/**
 * This comonent is intended to replace the "current project" placeholder in the navbar.
 * It must access the db to retrieve any items from the projects table by matching the  
 * "project_members" table using the user_id and project_id to the projects table id.
 * It will display the name of the currently selected project and will act as a dropdown box
 * to display other options.
 */

export default function ProjectSelect({userId,currentProject}){

    const supabase = createClient();

    const [projects, setProjects] = useState([]);
    const [selected, setSelected] = useState(currentProject || "");
    const [open, setOpen] = useState(false);

    useEffect(() => {
        async function fetchProjects() {
        const { data, error } = await supabase
            .from("projects")
            .select("id, name");
            

        if (!error) setProjects(data);
        }

        fetchProjects();
    }, []);

    return(
        <div style={styles.projectBox}>
          <span style={styles.projectLabel}>Current Project</span>
          <h3 style={styles.projectName}>{projectName}</h3>
        </div>
    )
}

const styles ={
    projectBox: {
    marginBottom: "25px",
    padding: "10px",
    backgroundColor: "#1f2937",
    borderRadius: "8px",
  },
  projectLabel: {
    fontSize: "12px",
    color: "#9ca3af",
  },
  projectName: {
    margin: 0,
    fontSize: "16px",
  }
}