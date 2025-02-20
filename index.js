// IMPORTING HELPER FUNCTIONS FROM UTILS
import {getTasks, createNewTask, patchTask, putTask, saveTasks, deleteTask,} from "./utils/taskFunctions.js";

// IMPORTING INITIAL DATA
import {initialData} from "./initialData.js";


// CHECKS IF LOCAL STORAGE ALREADY HAS DATA, IF NOT INITIAL DATA LOADS TO LOCAL STORAGE
function initializeData() {
  if (!localStorage.getItem("tasks")) {
    localStorage.setItem("tasks", JSON.stringify(initialData)); 
    localStorage.setItem("showSideBar", "true")
  } else {
    console.log("Data already exists in localStorage");
  }
}

// GETTING ELEMENTS FROM THE DOM
const elements = {
  // Navigation Sidebar
	sideBarDiv: document.getElementById("side-bar-div"),
	sideLogoDiv: document.getElementById("side-logo-div"),
	logo: document.getElementById("logo"),
	boardsNavLinksDiv: document.getElementById("boards-nav-links-div"),
	headlineSidePanel: document.getElementById("headline-sidepanel"),
	sideBarBottom: document.querySelector(".side-bar-bottom"),
	toggleDiv: document.querySelector(".toggle-div"),
	iconDark: document.getElementById("icon-dark"),
	switch: document.getElementById("switch"),
	labelCheckboxTheme: document.getElementById("label-checkbox-theme"),
	iconLight: document.getElementById("icon-light"),
	hideSideBarDiv: document.querySelector(".hide-side-bar-div"),
	hideSideBarBtn: document.getElementById("hide-side-bar-btn"),
	showSideBarBtn: document.getElementById("show-side-bar-btn"),

	// Main Layout
	layout: document.getElementById("layout"),
	header: document.getElementById("header"),
	headerNameDiv: document.querySelector(".header-name-div"),
	logoMobile: document.querySelector(".logo-mobile"),
	headerBoardName: document.getElementById("header-board-name"),
	dropdownBtn: document.getElementById("dropdownBtn"),
	dropDownIcon: document.getElementById("dropDownIcon"),
	addNewTaskBtn: document.getElementById("add-new-task-btn"),
	editBtn: document.getElementById("edit-board-btn"),
	editBoardDiv: document.getElementById("editBoardDiv"),
	deleteBoardBtn: document.getElementById("deleteBoardBtn"),
	container: document.querySelector(".container"),
	cardColumnMain: document.querySelector(".card-column-main"),
	todoColumnDiv: document.querySelector('.column-div[data-status="todo"]'),
	todoHeadDiv: document.getElementById("todo-head-div"),
	todoDot: document.getElementById("todo-dot"),
	todoText: document.getElementById("toDoText"),
	todoTasksContainer: document.querySelector(".tasks-container"),
	doingColumnDiv: document.querySelector('.column-div[data-status="doing"]'),
	doingHeadDiv: document.getElementById("doing-head-div"),
	doingDot: document.getElementById("doing-dot"),
	doingText: document.getElementById("doingText"),
	doingTasksContainer: document.querySelector(".tasks-container"),
	doneColumnDiv: document.querySelector('.column-div[data-status="done"]'),
	doneHeadDiv: document.getElementById("done-head-div"),
	doneDot: document.getElementById("done-dot"),
	doneText: document.getElementById("doneText"),
	doneTasksContainer: document.querySelector(".tasks-container"),

	// New Task Modal
	newTaskModalWindow: document.getElementById("new-task-modal-window"),
	modalTitleInput: document.getElementById("modal-title-input"),
	titleInput: document.getElementById("title-input"),
	modalDescInput: document.getElementById("modal-desc-input"),
	descInput: document.getElementById("desc-input"),
	modalSelectStatus: document.getElementById("modal-select-status"),
	selectStatus: document.getElementById("select-status"),
	createTaskBtn: document.getElementById("create-task-btn"),
	cancelAddTaskBtn: document.getElementById("cancel-add-task-btn"),

	// Edit Task Modal
	editTaskModalWindow: document.querySelector(".edit-task-modal-window"),
	editTaskForm: document.getElementById("edit-task-form"),
	editTaskHeader: document.getElementById("edit-task-header"),
	editTaskTitleInput: document.getElementById("edit-task-title-input"),
	editBtn: document.getElementById("edit-btn"),
	editTaskDescInput: document.getElementById("edit-task-desc-input"),
	editSelectStatus: document.getElementById("edit-select-status"),
	saveTaskChangesBtn: document.getElementById("save-task-changes-btn"),
	cancelEditBtn: document.getElementById("cancel-edit-btn"),
	deleteTaskBtn: document.getElementById("delete-task-btn"),

	// Filter Section
	filterDiv: document.getElementById("filterDiv"),
}

let activeBoard = ""

// EXTRACTS UNIQUE BOARD NAME FROM TASKS
function fetchAndDisplayBoardsAndTasks() {
  const tasks = getTasks();
  const boards = [...new Set(tasks.map(task => task.board).filter(Boolean))];
  displayBoards(boards);
  if (boards.length > 0) {
    const localStorageBoard = JSON.parse(localStorage.getItem("activeBoard"))
    activeBoard = localStorageBoard ? localStorageBoard : boards[0]; 
    elements.headerBoardName.textContent = activeBoard
    styleActiveBoard(activeBoard)
    refreshTasksUI();
  }
}

// CREATES DIFFERENT BOARDS IN THE DOM
function displayBoards(boards) {
  const boardsContainer = document.getElementById("boards-nav-links-div");
  boardsContainer.innerHTML = ''; // Clears the container
  boards.forEach(board => {
    const boardElement = document.createElement("button");
    boardElement.textContent = board;
    boardElement.classList.add("board-btn");
    boardElement.addEventListener("click", () => { 
      elements.headerBoardName.textContent = board;
      filterAndDisplayTasksByBoard(board);
      activeBoard = board //assigns active board
      localStorage.setItem("activeBoard", JSON.stringify(activeBoard))
      styleActiveBoard(activeBoard)
    });
    boardsContainer.appendChild(boardElement);
  });

}

// FILTERS TASKS CORRESPONDING TO THE BOARD NAME/DISPLAYS TO DOM
function filterAndDisplayTasksByBoard(boardName) {
  const tasks = getTasks(); // Fetch tasks from a simulated local storage function
  const filteredTasks = tasks.filter(task => task.board === boardName);

  // Ensure the column titles are set outside of this function or correctly initialized before this function runs
  const columns = document.querySelectorAll(".column-div");

  columns.forEach(column => {
    const status = column.getAttribute("data-status");
    // Reset column content while preserving the column title
    column.innerHTML = `<div class="column-head-div">
                          <span class="dot" id="${status}-dot"></span>
                          <h4 class="columnHeader">${status.toUpperCase()}</h4>
                        </div>`;

    const tasksContainer = document.createElement("div");
    column.appendChild(tasksContainer);

    filteredTasks
    .filter(task => task.status === status)
    .forEach(task => { 
      const taskElement = document.createElement("div");
      taskElement.classList.add("task-div");
      taskElement.textContent = task.title;
      taskElement.setAttribute("data-task-id", task.id);

      // Listen for a click event on each task and open a modal
      taskElement.addEventListener("click", () => { 
        openEditTaskModal(task);
      });

      tasksContainer.appendChild(taskElement);
    });
  });
}


function refreshTasksUI() {
  filterAndDisplayTasksByBoard(activeBoard);
}

// STYLES ACTIVE BOARD
function styleActiveBoard(boardName) {
  document.querySelectorAll(".board-btn").forEach(btn => { 
    
    if(btn.textContent === boardName) {
      btn.classList.add("active") 
    }
    else {
      btn.classList.remove("active"); 
    }
  });
}


function addTaskToUI(task) {
  const column = document.querySelector(`.column-div[data-status="${task.status}"]`); 
  if (!column) {
    console.error(`Column not found for status: ${task.status}`);
    return;
  }

  let tasksContainer = column.querySelector(".tasks-container");
  if (!tasksContainer) {
    console.warn(`Tasks container not found for status: ${task.status}, creating one.`);
    tasksContainer = document.createElement("div");
    tasksContainer.className = "tasks-container";
    column.appendChild(tasksContainer);
  }

  const taskElement = document.createElement("div");
  taskElement.className = "task-div";
  taskElement.textContent = task.title; // Modify as needed
  taskElement.setAttribute("data-task-id", task.id);

  //LISTEN FOR A CLICK EVENT ON EACH TASK AND OPEN A MODAL
  taskElement.addEventListener("click", () => {
    openEditTaskModal(task);
  });
  
  tasksContainer.appendChild(taskElement); 
}



function setupEventListeners() {
  // CANCEL EDIT TASK MODAL
  elements.cancelEditBtn.addEventListener("click", () => {
    toggleModal(false, elements.editTaskModalWindow); // CLOSES THE EDIT TASK MODAL
  });

  // CANCEL ADD NEW TASK MODAL
  elements.cancelAddTaskBtn.addEventListener("click", () => {
    toggleModal(false, elements.newTaskModalWindow); // CLOSES THE ADD TASK MODAL
    elements.filterDiv.style.display = "none"; // HIDES FILTER OVERLAY
  });

  // HIDES FILTER OVERLAY WHEN CLICKED OUTSIDE MODAL
	elements.filterDiv.addEventListener("click", () => {
		toggleModal(false, elements.newTaskModalWindow); // CLOSES ANY OPEN MODAL
		elements.filterDiv.style.display = "none"; // HIDES FILTER OVERLAY
	});

  // SHOW/HIDE SIDEBAR TOGGLE
  elements.hideSideBarBtn.addEventListener("click", () => toggleSidebar(false)); // HIDE SIDEBAR
  elements.showSideBarBtn.addEventListener("click", () => toggleSidebar(true)); // SHOW SIDEBAR

  // THEME SWITCH (LIGHT/DARK)
  elements.switch.addEventListener("change", toggleTheme); // TOGGLES (LIGHT/DARK) MODE

  // SHOW ADD NEW TASK MODAL
  elements.addNewTaskBtn.addEventListener("click", () => {
		toggleModal(true, elements.newTaskModalWindow); // OPENS ADD TASK MODAL
		elements.filterDiv.style.display = "block"; // SHOWS FILTER OVERLAY 
	});

  // TASK CREATION FORM SUBMISSION
	elements.newTaskModalWindow.addEventListener("submit", (event) => {
		event.preventDefault(); // PREVENTS PAGE RELOAD
		addTask(event); // CALLS ADDTASK
	});

  // CLICK EVENT TO SWITCH EACH BOARD
	elements.boardsNavLinksDiv.addEventListener("click", (event) => {
		const clickedBoard = event.target.textContent; // Get board name from clicked button

		if (
			(clickedBoard === "Launch Career" || clickedBoard === "Roadmap") &&
			clickedBoard !== activeBoard
		) {
			elements.headerBoardName.textContent = clickedBoard; // Set active board name in header
			filterAndDisplayTasksByBoard(clickedBoard); // Display tasks for selected board
			activeBoard = clickedBoard; // Set active board to clicked one
			localStorage.setItem("activeBoard", JSON.stringify(activeBoard)); // Persist to localStorage
			styleActiveBoard(activeBoard); // Apply active board styling
		}
	});

	// SHOWS EDIT MODAL
	elements.editBtn.addEventListener("click", () => {
		toggleModal(true, elements.editBoardDiv); // OPENS EDIT MODAL
	});

	// DELETES BOARD
	elements.deleteBoardBtn.addEventListener("click", () => {
		deleteBoard(activeBoard);
	});
}

// TOGGLES TASK MODAL
function toggleModal(show, modal = elements.modalWindow) {
  modal.style.display = show ? "block" : "none"; 
}

/************************************************************************************************************************* */

// HANDLES ADDING TASKS
function addTask(event) {
  event.preventDefault(); 

  // USER INPUT FOR THE TASK OBJECT
    const task = {
      title: document.getElementById("title-input").value, // EXTRACTING TASK TITLE
      description: document.getElementById("desc-input").value, // TASK DESCRIPTION
		  status: document.getElementById("select-status").value, // TASK STATUS (e.g., "todo", "doing", "done")
		  id: Date.now(), // TIMESTAMP AS A UNIQUE TASK ID
		  board: activeBoard, // ASSIGNING ACTIVE BOARD TASK
    };

    const newTask = createNewTask(task);
    if (newTask) {
      addTaskToUI(newTask);
      toggleModal(false, elements.newTaskModalWindow);
      elements.filterDiv.style.display = 'none'; // HIDES FILTER OVERLAY
      event.target.reset();
      refreshTasksUI();
    }
}


function toggleSidebar(show) {
  const sidebar = document.getElementById("side-bar-div"); // GETS SIDEBAR ELEMENT
	const showButton = elements.showSideBarBtn; // GETS SHOW SIDEBAR BUTTON
	const hideButton = elements.hideSideBarBtn; // GETS HIDE SIDEBAR BUTTON

	if (show) {
		sidebar.style.display = "block";
		showButton.style.display = "none"; 
		hideButton.style.display = "block";
		localStorage.setItem("showSideBar", "true"); // SAVES SIDEBAR STATE TO LOCALSTORAGE
	} else {
		sidebar.style.display = "none";
		showButton.style.display = "block";
		hideButton.style.display = "none";
		localStorage.setItem("showSideBar", "false"); // SAVES SIDEBAR STATE TO LOCALSTORAGE
	}
}

function toggleTheme() {
  const body = document.body; // ACCESSES BODY ELEMENT
  const isDarkTheme = body.classList.contains("dark-theme"); // CHECKS IF DARK THEME CLASS ALREADY APPLIED

  if (isDarkTheme) {
    // IF DARK THEME IS APPLIED, SWITCH TO LIGHT
    body.classList.remove("dark-theme");
		body.classList.add("light-theme");
  } else {
    // IF LIGHT THEME IS APPLIED, SWITCH TO DARK
    body.classList.remove("light-theme");
		body.classList.add("dark-theme");
  }
  // SAVES USERS THEME PREFERENCE IN LOCALSTORAGE
  localStorage.setItem(
    "theme",
    body.classList.contains("dark-theme") ? "dark" : "light"
  );
}



function openEditTaskModal(task) {
  // SET TASK DETAILS IN MODAL INPUTS
  const taskTitleInput = document.getElementById("edit-task-title-input");
	const taskDescInput = document.getElementById("edit-task-desc-input");
	const taskStatusInput = document.getElementById("edit-select-status");

  taskTitleInput.value = task.title; // SETS TASK TITLE
	taskDescInput.value = task.description; // SETS TASK DESCRIPTION
	taskStatusInput.value = task.status; // SETS TASK STATUS

  // GET BUTTON ELEMENTS FROM THE TASK MODAL
  const saveChangesBtn = document.getElementById("save-task-changes-btn");
	const cancelEditBtn = document.getElementById("cancel-edit-btn");
	const deleteTaskBtn = document.getElementById("delete-task-btn");


  // SAVES CHANGES
  saveChangesBtn.addEventListener("click", () => {
		const updatedTask = {
			id: task.id, // Keep the same ID
			title: taskTitleInput.value,
			description: taskDescInput.value,
			status: taskStatusInput.value,
			board: task.board, // Retain the board name
		};

		const patchedTasks = patchTask(updatedTask.id, updatedTask);
		saveTasks(patchedTasks);
		refreshTasksUI();
		toggleModal(false, elements.editTaskModalWindow); // Close the modal after saving
	});

	// CANCELS EDITING TASK 
	cancelEditBtn.addEventListener("click", () => {
		toggleModal(false, elements.editTaskModalWindow); // Close the modal without saving changes
	});

	// DELETES TASK USING HELPER FUNCTION
	deleteTaskBtn.addEventListener("click", () => {
		deleteTask(task.id);
		toggleModal(false, elements.editTaskModalWindow); // Close the modal after deletion
		refreshTasksUI();
	});
 
  toggleModal(true, elements.editTaskModalWindow); // Show the edit task modal
}

/*************************************************************************************************************************************************/

document.addEventListener('DOMContentLoaded', function() {
  init(); // init is called after the DOM is fully loaded
});

function init() {
  setupEventListeners();
  const showSidebar = localStorage.getItem('showSideBar') === 'true';
  toggleSidebar(showSidebar);
  const savedTheme = localStorage.getItem("theme");
  document.body.classList.remove(
    savedTheme === "dark" ? "light-theme" : "dark-theme" 
  );
  document.body.classList.add(
    savedTheme === "dark" ? "dark-theme" : "light-theme"
  );
  elements.switch.checked = savedTheme !== "dark";
  fetchAndDisplayBoardsAndTasks(); // Initial display of boards and tasks
  initializeData();
}