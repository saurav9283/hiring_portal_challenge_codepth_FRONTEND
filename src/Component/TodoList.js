import React, { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./style.css";
import axios from "axios";
import todoImage from "../image/todo.png";

const TodoList = () => {
  // State variables
  const [tasks, setTasks] = useState([]); // Holds the list of tasks
  const [inputValue, setInputValue] = useState(""); // Holds the value of the input field
  const [filter, setFilter] = useState("all"); // Holds the current filter type
  const [isLoading, setIsLoading] = useState(true); // Indicates whether the data is being loaded
  const [editTaskId, setEditTaskId] = useState(null); // Holds the ID of the task being edited

  // Fetch initial data
  useEffect(() => {
    fetchTodos();
  }, []);

  // Fetch todos from an API
  const fetchTodos = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/getAllTask?_limit=4"
      );
      console.log(response.data);
      const { allTasks } = response.data;
      setTasks(allTasks);
      setIsLoading(false);
    } catch (error) {
      console.log("Error fetching todos:", error);
      setIsLoading(false);
    }
  };

  // Handle input change
  const handleInputChange = (event) => {
    console.log(event.target.value);
    setInputValue(event.target.value);
  };

  // Add a new task
  const handleAddTask = async () => {
    if (inputValue.trim() === "") {
      return;
    }

    const newTask = {
      task: inputValue,
      completed: false,
    };

    try {
      const response = await axios.post(
        "http://localhost:5000/addingTask",
        newTask
      );
      console.log(response.data);
      const addedTask = response.data;
      setTasks((prevTasks) => [...prevTasks, addedTask.savedNewtask]);
      setInputValue("");
      toast.success("Task added successfully");
    } catch (error) {
      console.log("Error adding task:", error);
      toast.error("Error adding task");
    }
  };

  // Handle checkbox change for a task
  const handleTaskCheckboxChange = (taskId) => {
    // console.log(taskId)
    const filtered = tasks.map((task) =>
      task._id === taskId ? { ...task, completed: !task.completed } : task
    );
    setTasks([...filtered]);
    
    // setTasks((prevTasks) =>
    // prevTasks.map((task) =>
    //   task._id === taskId ? { ...task, completed: !task.completed } : task
    // )
    // );
  };

  // Delete a task
  const handleDeleteTask = async (taskId) => {
    try {
        const response = await axios.delete(`http://localhost:5000/deleteTask/${taskId}`)

        if (response.data.msg === "Task deleted successfully") {
            setTasks(prevTasks => prevTasks.filter(task => task._id !== taskId));
            toast.success("Task deleted successfully");
        } else {
            toast.error("Error deleting task");
            console.error("Server responded with status:", response.status);
        }
    } catch (error) {
        toast.error("An error occurred while deleting the task");
        console.error("Error deleting task:", error);
    }
};


  // Edit a task
  const handleEditTask = (taskId) => {
    setEditTaskId(taskId);
    const taskToEdit = tasks.find((task) => task._id === taskId);
    setInputValue(taskToEdit.task);
  };

  // Update a task
  const handleUpdateTask = async () => {
    if (inputValue.trim() === "") {
      return;
    }
  
    const updatedTask = {
      task: inputValue,
      completed: false, 
    };
  
    try {
      const response = await axios.put(
        `http://localhost:5000/editTask/${editTaskId}`,
        updatedTask
      );
  
      const updatedTaskData = response.data.editOneTask;
  
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task._id === editTaskId
            ? { ...task, ...updatedTaskData }
            : task
        )
      );
      setInputValue("");
      setEditTaskId(null);
      toast.success("Task updated successfully");
    } catch (error) {
      console.log("Error updating task:", error);
      toast.error("Error updating task");
    }
  };
  

  // Mark all tasks as completed
  const handleCompleteAll = () => {
    setTasks((prevTasks) =>
      prevTasks.map((task) => ({ ...task, completed: true }))
    );
  };

  // Clear completed tasks
  const handleClearCompleted = () => {
    setTasks((prevTasks) => prevTasks.filter((task) => !task.completed));
  };

  // Handle filter change
  const handleFilterChange = (filterType) => {
    setFilter(filterType);
  };


  // Display loading message while data is being fetched
  if (isLoading) {
    return <div>Loading...</div>;
  }

  // Render the todo list
  return (
    <div className="container">
      <ToastContainer />
      <div className="todo-app">
        <h2>
          <img src={todoImage} alt="todo-image" /> Todo List
        </h2>
        <div className="row">
          <i className="fas fa-list-check"></i>
          <input
            type="text"
            className="add-task"
            id="add"
            placeholder="Add your todo"
            autoFocus
            value={inputValue}
            onChange={handleInputChange}
          />
          <button
            id="btn"
            onClick={editTaskId ? handleUpdateTask : handleAddTask}
          >
            {editTaskId ? "Update" : "Add"}
          </button>
        </div>

        <div className="mid">
          <i className="fas fa-check-double"></i>
          <p id="complete-all" onClick={handleCompleteAll} title="mark complet all task">
            Complete all tasks
          </p>
          <p id="clear-all" onClick={handleClearCompleted} title="Delete the selected Task">
            Delete tasks
          </p>
        </div>

        <ul id="list">
          {tasks.map((task) => (
            <li key={task._id}>
              <input
                type="checkbox"
                id={task._id}
                name={task._id}
                value={task.task}
                data-id={task._id}
                className="custom-checkbox"
                checked={task.completed}
                onClick={() => handleTaskCheckboxChange(task._id)}
              />
              <label htmlFor={task._id}>{task.task}</label>
              <div>
                <img
                  src="https://cdn-icons-png.flaticon.com/128/1159/1159633.png"
                  className="edit"
                  data-id={task._id}
                  onClick={() => handleEditTask(task._id)}
                  title="edit"
                />
                <img
                  src="https://cdn-icons-png.flaticon.com/128/3096/3096673.png"
                  className="delete"
                  onClick={() => handleDeleteTask(task._id)}
                  title="Delete"
                />
              </div>
            </li>
          ))}
        </ul>

        <div className="filters">
          <div className="dropdown">
            <button className="dropbtn">Filter</button>
            <div className="dropdown-content">
              <a href="#" id="all" onClick={() => handleFilterChange("all")}>
                All
              </a>
              <a
                href="#"
                id="rem"
                onClick={() => handleFilterChange("uncompleted")}
              >
                Uncompleted
              </a>
              <a
                href="#"
                id="com"
                onClick={() => handleFilterChange("completed")}
              >
                Completed
              </a>
            </div>
          </div>

          <div className="completed-task">
            <p>
              Completed:{" "}
              <span id="c-count">
                {tasks.filter((task) => task.completed).length}
              </span>
            </p>
          </div>
          <div className="remaining-task">
            <p>
              <span id="total-tasks">
                Total Tasks: <span id="tasks-counter">{tasks.length}</span>
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TodoList;
