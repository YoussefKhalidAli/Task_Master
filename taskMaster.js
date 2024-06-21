// Loads the home page
const loadHomePage = () => {
  const pageContent = document.getElementById("pageContent");
  pageContent.innerHTML = `
    <div class="welcome-message">
      <h1>Welcome to TaskMaster</h1>
      <p>We are thrilled to have you here! TaskMaster is designed to help you organize your tasks efficiently and effortlessly. Whether you are managing personal projects or professional commitments, our application provides the best tools to keep you on track and productive.</p>
      <p>Explore the features, stay ahead of your deadlines, and achieve your goals with ease. Let's get started!</p>
    </div>
  `;
};

// Loads the about page
const loadAboutPage = () => {
  const pageContent = document.getElementById("pageContent");
  pageContent.innerHTML = `
  <div class="about">
  <h1>About Us</h1>
  <p>Welcome to our Task Management Application!</p>
  <p>
  Our application is designed to help you manage your tasks efficiently.
  Whether you're organizing personal to-dos or coordinating team projects,
  our intuitive interface and powerful features make task management a breeze.
  </p>
  <div>
  <span>
  <label>With features like</label> 
  <ul>
  <li>task sorting</li>
  <li>filtering</li>
  <li>real-time updates</li>
  <li>task cheking</li>
  </ul> 
  </span>
  <span>
  <label>We are committed to</label>
  <ul>
  <li>providing you with the best tools</li>
  <li>maintaining quality</li>
  <li>staying ahead of the competetion</li>
  <li>supporting our users with excellent customer service</li>
  </ul> 
  </span>
  </div>
  <p>
  providing you with the best tools to enhance your productivity
  and achieve your goals. Thank you for choosing our Task Management Application!
  </p>
  </div>
  `;
};

// Loads the contact page
const loadContactPage = () => {
  const pageContent = document.getElementById("pageContent");
  pageContent.innerHTML = `
      <h1>Contact Us</h1>
      <form class="contactForm">
      <label for="name">name</label>
      <input type="text" id="name" />
      <label for="email">email</label>
      <input type="email" id="email" />
      <label for="message">message</label>
      <textarea for="message" id="message"></textarea>
      <button type="submit">send</button>
      </form>
    `;

  const submitFormButton = document.querySelector(".contactForm button");
  submitFormButton.addEventListener("click", (event) => {
    event.preventDefault();
    const name = document.querySelector(".contactForm #name");
    const email = document.querySelector(".contactForm #email");
    const message = document.querySelector(".contactForm #message");
    let prompt = "We recieved your message";
    if (name.value === "") prompt = "don't forget to tell us yourname";
    if (
      email.value === "" ||
      !email.value.includes("@") ||
      !email.value.includes(".")
    )
      prompt = "give us your email so we can reach out";
    if (message.value === "") {
      prompt = "don't be shy, tell us of all your problems";
    }
    alert(prompt);
    if (prompt === "We recieved your message") loadContactPage();
  });
};

// Firebase imports and config
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getDatabase,
  ref,
  child,
  get,
  set,
  update,
  remove,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyDtoTmBmL9xEUs4NTsMBv0_f2xk0scuomo",
  authDomain: "taskmaster-cd29c.firebaseapp.com",
  databaseURL: "https://taskmaster-cd29c-default-rtdb.firebaseio.com",
  projectId: "taskmaster-cd29c",
  storageBucket: "taskmaster-cd29c.appspot.com",
  messagingSenderId: "590734953629",
  appId: "1:590734953629:web:8f649491d0e10d048f1874",
  measurementId: "G-45KTF455DJ",
};

const app = initializeApp(firebaseConfig);
const db = getDatabase();

let tasks = [],
  isFetched = false,
  isEditing = -1,
  editTaskIndex = -1;

// Fetch tasks from firebase backend
const fetchTasks = async () => {
  const dbRef = ref(db);
  const snapShot = await get(child(dbRef, "tasks/"));
  if (snapShot.exists()) {
    tasks = Object.values(snapShot.val());
    tasks = tasks.sort((a, b) => new Date(a.dateAdded) - new Date(b.dateAdded));
  }
  isFetched = true;
};

// function to sort tasks
const sortTasks = (tasks, criteria) => {
  switch (criteria) {
    case "dateAsc":
      return tasks.sort(
        (a, b) => new Date(a.dateAdded) - new Date(b.dateAdded)
      );
    case "dateDesc":
      return tasks.sort(
        (a, b) => new Date(b.dateAdded) - new Date(a.dateAdded)
      );
    case "alphaAsc":
      return tasks.sort((a, b) => a.title.localeCompare(b.title));
    case "alphaDesc":
      return tasks.sort((a, b) => b.title.localeCompare(a.title));
    default:
      return tasks;
  }
};

// Function to generate the tasks and add them to the tasks page
const generateTasks = (tasksToDisplay) => {
  const day = (date) => {
    return date.getDate();
  };
  const month = (date) => {
    return date.getMonth() + 1;
  };
  const year = (date) => {
    return date.getFullYear();
  };
  const taskContainer = document.querySelector(".taskContainer");
  taskContainer.innerHTML = tasksToDisplay
    .map(
      (task, index) =>
        `              <div class="task" key="${index}"> <div> <h2 contenteditable="${
          isEditing === index
        }" class="${
          isEditing === index ? "editable" : ""
        }" index="${index}" data-field="title">${
          task.title
        }</h2> <p contenteditable="${isEditing === index}" class="${
          isEditing === index ? "editable" : ""
        }" index="${index}" data-field="description">${
          task.description
        }</p> <h5>${
          day(new Date(task.dateAdded)) < 10
            ? "0" + day(new Date(task.dateAdded))
            : day(new Date(task.dateAdded))
        }-${
          month(new Date(task.dateAdded)) < 10
            ? "0" + month(new Date(task.dateAdded))
            : month(new Date(task.dateAdded))
        }-${year(new Date(task.dateAdded))}</h5> <span class="${
          task.completed ? "completed" : "notCompleted"
        }">${
          task.completed ? "completed" : "not completed"
        }</span> </div> <div class="icons"> <i class="fa fa-trash" data-index="${index}"></i> <i class="fa fa-edit" data-index="${index}"></i> ${
          !task.completed
            ? `<i class="fa fa-check" data-index=${index}></i>`
            : ""
        } </div> </div>
      `
    )
    .join("");

  bindDelete();
  bindCheck();
  bindEdit();
  bindEditable();
};

// Function to load the page after every change
const load = () => {
  const sortCriteria = document.getElementById("sortTasks").value;
  const showCompletedOnly = document.getElementById("filterCompleted").checked;
  let tasksToDisplay = [...tasks];

  if (showCompletedOnly) {
    tasksToDisplay = tasksToDisplay.filter((task) => task.completed);
  }

  tasksToDisplay = sortTasks(tasksToDisplay, sortCriteria);
  generateTasks(tasksToDisplay);
};

// Function to delete a task
const deleteHandler = (index) => {
  remove(ref(db, "tasks/" + tasks[index].title + tasks[index].dateAdded));
  tasks.splice(index, 1);
  load();
};

// Function to bind the delete function to the delete button and then the generateTasks function
const bindDelete = () => {
  const deleteButtons = document.querySelectorAll(".fa-trash");
  deleteButtons.forEach((button) => {
    const index = button.getAttribute("data-index");
    button.addEventListener("click", () => deleteHandler(index));
  });
};

// Function to edit a task
const editHandler = (index) => {
  editTaskIndex = index;
  const task = tasks[index];
  const modal = document.querySelector(".modal");
  const backGround = document.querySelector(".backGround");

  document.querySelector("#title").value = task.title;
  document.querySelector("#description").value = task.description;
  modal.classList.remove("hide");
  backGround.classList.remove("hide");
  document.querySelector("#addTask").textContent = "Save";
};

// Function to bind the edit function to the edit button and then the generateTasks function
const bindEdit = () => {
  const editButtons = document.querySelectorAll(".fa-edit");
  editButtons.forEach((button) => {
    const index = button.getAttribute("data-index");
    button.addEventListener("click", () => editHandler(index));
  });
};

// Function to update tasks
const updateTask = (index, field, value) => {
  tasks[index][field] = value;
};

// Function to bind the edit editable characteristic to task element
const bindEditable = () => {
  const editableElements = document.querySelectorAll("[contenteditable=true]");
  editableElements.forEach((element) => {
    element.addEventListener("blur", (event) => {
      const index = element.getAttribute("data-index");
      const field = element.getAttribute("data-field");
      const value = event.target.innerText;
      updateTask(index, field, value);
      isEditing = -1;
      load();
    });
  });
};

// Function to check task as completed
const checkHandler = (index) => {
  tasks[index].completed = true;
  update(ref(db, "tasks/" + tasks[index].title + tasks[index].dateAdded), {
    completed: true,
  });
  load();
};

// Function to bind the check function to the check button and then the generateTasks function
const bindCheck = () => {
  const checkButtons = document.querySelectorAll(".fa-check");
  checkButtons.forEach((button) => {
    const index = button.getAttribute("data-index");
    button.addEventListener("click", () => checkHandler(index));
  });
};

// Loads the tasks page
const loadTasksPage = async () => {
  // The Add task, sort, and filter controls
  const pageContent = document.getElementById("pageContent");
  pageContent.innerHTML = `<button id="addNewTask">Add new task</button>
<div class="controls">
<label for="sort">sort by</label>
<select id="sortTasks">
<option value="dateAsc">Date Added (Ascending)</option>
<option value="dateDesc">Date Added (Descending)</option>
<option value="alphaAsc">Alphabetically (Ascending)</option>
<option value="alphaDesc">Alphabetically (Descending)</option>
</select>
<label>
<input type="checkbox" id="filterCompleted" />
Show Completed Tasks Only
</label>
</div>

php
Copy code
<div class="taskContainer"></div>
<div class="backGround hide">
  <div class="modal hide">
    <form>
      <label for="title">Title</label>
      <input type="text" name="title" id="title" />
      <label for="description">description</label>
      <textarea
        type="text"
        name="description"
        id="description"
        maxlength="150"
      ></textarea>
      <button id="addTask">Add</button>
    </form>
  </div>
</div>`;
  if (!isFetched) await fetchTasks();

  // Functionality of add new task button
  const addNewTaskButton = document.getElementById("addNewTask");
  const modal = document.querySelector(".modal");
  const backGround = document.querySelector(".backGround");

  addNewTaskButton.addEventListener("click", () => {
    modal.classList.remove("hide");
    backGround.classList.remove("hide");
  });

  // Functonality to show the modal
  backGround.addEventListener("click", () => {
    modal.classList.add("hide");
    backGround.classList.add("hide");
    editTaskIndex = -1;
    const newTitle = document.querySelector("#title");
    const newDescription = document.querySelector("#description");
    newTitle.value = "";
    newDescription.value = "";
  });

  modal.addEventListener("click", (event) => {
    event.stopPropagation();
  });

  // Functionality to add the new task or edit existing one
  const addTaskButton = document.getElementById("addTask");

  addTaskButton.addEventListener("click", function (event) {
    event.preventDefault();
    const newTitle = document.querySelector("#title");
    const newDescription = document.querySelector("#description");
    const title = newTitle.value;
    const description = newDescription.value;
    if (title && description) {
      if (editTaskIndex >= 0) {
        // Editing an existing task
        tasks[editTaskIndex].title = title;
        tasks[editTaskIndex].description = description;
        update(ref(db, "tasks/" + title + tasks[editTaskIndex].dateAdded), {
          title: title,
          description: description,
        });
        editTaskIndex = -1;
      } else {
        // Adding a new task
        const date = new Date();
        tasks.push({
          title,
          description,
          completed: false,
          dateAdded: date.getTime(),
        });
        set(ref(db, "tasks/" + title + date.getTime()), {
          title: title,
          description: description,
          completed: false,
          dateAdded: date.getTime(),
        });
      }
      newTitle.value = "";
      newDescription.value = "";
      load();
      backGround.classList.add("hide");
      modal.classList.add("hide");
    } else {
      alert("Please provide both a title and description for the task.");
    }
  });

  // Functionality to sort and filter
  const sortTasksElement = document.getElementById("sortTasks");
  sortTasksElement.addEventListener("change", load);

  const filterCompletedElement = document.getElementById("filterCompleted");
  filterCompletedElement.addEventListener("change", load);

  load(); // Initial load of tasks
};

// Navigates between pages using the navigation bar
const loadPage = (page) => {
  const pageContent = document.getElementById("pageContent");
  pageContent.innerHTML = "";
  switch (page) {
    case "home":
      loadHomePage();
      break;
    case "tasks":
      loadTasksPage();
      break;
    case "about":
      loadAboutPage();
      break;
    case "contact":
      loadContactPage();
      break;
  }
};

// Functionality to navigation Bar and load home page first
document.addEventListener("DOMContentLoaded", () => {
  loadPage("home"); // Ensure initial load
  const navLinks = document.querySelectorAll(".navBar li");
  navLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      const page = link.getAttribute("page");
      loadPage(page);
    });
  });
});
