import React, { useEffect, useState } from "react";
import { getTasks, addTask, toggleTask, deleteTask } from "./api";
import "./App.css";

function App() {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState("");
  const [priority, setPriority] = useState("medium");

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const { data } = await getTasks();
      setTasks(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      setTasks([]);
    }
  };

  const handleAddTask = async () => {
    if (newTask.trim() === "") return;
    await addTask({ title: newTask, priority });
    setNewTask("");
    setPriority("medium");
    fetchTasks();
  };

  const handleToggleTask = async (id) => {
    await toggleTask(id);
    fetchTasks();
  };

  const handleDeleteTask = async (id) => {
    await deleteTask(id);
    fetchTasks();
  };

  const priorities = ["high", "medium", "low"];

  return (
    <div className="app-container">
      <h1 className="app-title">🔥 Task Manager 🔥</h1>

      <div className="task-input">
        <input
          type="text"
          placeholder="Enter a task..."
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
        />
        <select value={priority} onChange={(e) => setPriority(e.target.value)}>
          {priorities.map((p) => (
            <option key={p} value={p}>
              {p.toUpperCase()}
            </option>
          ))}
        </select>
        <button onClick={handleAddTask}>➕ Add Task</button>
      </div>

      <div className="task-grid">
        {priorities.map((p) => (
          <div key={p} className="task-column">
            <h2>{p.toUpperCase()} PRIORITY</h2>
            <ul>
              {tasks
                .filter((task) => task.priority === p)
                .map((task) => (
                  <li key={task.id} className={`task-item ${task.completed ? "completed" : ""}`}>
                    {task.title}
                    <div className="task-buttons">
                      <button className="complete" onClick={() => handleToggleTask(task.id)}>
                        ✔️
                      </button>
                      <button className="delete" onClick={() => handleDeleteTask(task.id)}>
                        🗑
                      </button>
                    </div>
                  </li>
                ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
