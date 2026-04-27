import { useState, useRef, useEffect } from "react";

const SORT_OPTIONS = [
  { label: "Deadline", value: "deadline" },
  { label: "Priority", value: "priority" },
  { label: "Status", value: "status" },
  { label: "Title", value: "title" },
];

export default function SortTasksDropdown({ sortBy, setSortBy }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  // creates a dropdown to allow a user to sort tasks by their chosen filter
  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const active = SORT_OPTIONS.find((o) => o.value === sortBy);

  return (
    <div ref={ref} style={styles.sortWrap}>
      <button style={styles.sortBtn} onClick={() => setOpen((o) => !o)}>
        Sort By{active ? `: ${active.label}` : ""} ▾
      </button>
      {open && (
        <div style={styles.dropdown}>
          {SORT_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              style={{
                ...styles.dropdownItem,
                ...(sortBy === opt.value ? styles.dropdownItemActive : {}),
              }}
              onClick={() => {
                setSortBy(sortBy === opt.value ? null : opt.value);
                setOpen(false);
              }}
            >
              {opt.label}
              {sortBy === opt.value && <span style={styles.checkmark}>✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

const styles = {
  sortWrap: { position: "relative" },
  sortBtn: {
    background: "none",
    border: "none",
    color: "#374151",
    fontSize: "14px",
    cursor: "pointer",
    fontWeight: 500,
    padding: "8px 4px",
  },
  dropdown: {
    position: "absolute",
    right: 0,
    top: "calc(100% + 4px)",
    backgroundColor: "#fff",
    border: "1px solid #e5e7eb",
    borderRadius: "8px",
    boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
    minWidth: "160px",
    zIndex: 100,
    overflow: "hidden",
  },
  dropdownItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    padding: "10px 14px",
    background: "none",
    border: "none",
    fontSize: "14px",
    color: "#374151",
    cursor: "pointer",
    textAlign: "left",
  },
  dropdownItemActive: {
    backgroundColor: "#eff6ff",
    color: "#2563eb",
    fontWeight: 600,
  },
  checkmark: { fontSize: "13px", color: "#2563eb" },
};
