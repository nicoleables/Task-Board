// Retrieve tasks and nextId from localStorage
let taskList = JSON.parse(localStorage.getItem("tasks"));
let nextId = JSON.parse(localStorage.getItem("nextId"));
// Todo: create a function to generate a unique task id
function generateTaskId() {
    let nextId = JSON.parse(localStorage.getItem("nextId"));
    nextId++;
    localStorage.setItem("nextId", JSON.stringify(nextId));
    return nextId;
}

// Todo: create a function to create a task card
function createTaskCard(task) {
    const taskCard = document.createElement("div");
    taskCard.classList.add("task-card");
    taskCard.setAttribute("data-task-id", task.id);

    // Calculate days until due date
    const dueDate = new Date(task.dueDate);
    const today = new Date();
    const daysUntilDue = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
    // Apply color coding based on due date
    if (daysUntilDue < 0) {
        taskCard.style.backgroundColor = "red"; // Overdue tasks in red
    } else if (daysUntilDue <= 3) {
        taskCard.style.backgroundColor = "yellow"; // Tasks nearing deadline in yellow
    }
    
    taskCard.innerHTML = `
        <h3>${task.title}</h3>
        <p>${task.description}</p>
        <p>${dueDate.toLocaleDateString()}</p>
        <button class="delete-button">Delete</button>
    `;
    
    const deleteButton = taskCard.querySelector(".delete-button");
    deleteButton.addEventListener("click", () => {
        handleDeleteTask(task.id, taskCard, taskList); // Pass task ID and task card to handleDeleteTask
    });
    let statusLane;
    if (task.status === "To Do") {
        statusLane = document.getElementById("todo-cards");
    } else if (task.status === "In Progress") {
        statusLane = document.getElementById("in-progress-cards");
    } else if (task.status === "Done") {
        statusLane = document.getElementById("done-cards");
    }
    if (statusLane) {
        statusLane.appendChild(taskCard);
    } 
}

// Todo: create a function to render the task list and make cards draggable
function renderTaskList() {
    let taskList = JSON.parse(localStorage.getItem("tasks"));
    if (taskList && taskList.length > 0) {
        document.getElementById("todo-cards").innerHTML = "";
        document.getElementById("in-progress-cards").innerHTML = "";
        document.getElementById("done-cards").innerHTML = "";
        taskList.forEach(task => {
            createTaskCard(task);
        });
        // Make each task card draggable with z-index adjustment
        $(".task-card").draggable({
            helper: function (e) {
                // ? Check if the target of the drag event is the card itself or a child element. If it is the card itself, clone it, otherwise find the parent card  that is draggable and clone that.
                const original = $(e.target).hasClass('ui-draggable')
                  ? $(e.target)
                  : $(e.target).closest('.ui-draggable');
                // ? Return the clone with the width set to the width of the original card. This is so the clone does not take up the entire width of the lane. This is to also fix a visual bug where the card shrinks as it's dragged to the right.
                return original.clone().css({
                  width: original.outerWidth(),
                });
              },
            });
        }
}

document.addEventListener("DOMContentLoaded", renderTaskList);

// Todo: create a function to handle adding a new task
function handleAddTask(event){
    event.preventDefault();
    let taskList = JSON.parse(localStorage.getItem("tasks")) || [];

    const title = document.getElementById("task-title").value;
    const dueDate = document.getElementById("datepicker").value;
    const description = document.getElementById("task-description").value;

    const newTask = {
        id: generateTaskId(),
        title: title,
        dueDate: dueDate,
        description: description,
        status: "To Do"
    };


    taskList.push(newTask);
    localStorage.setItem("tasks", JSON.stringify(taskList));
    createTaskCard(newTask);
    $('#formModal').modal('hide');
}
// Todo: create a function to handle deleting a task
function handleDeleteTask(taskId, taskCard, taskList){
    const taskIndex = taskList.findIndex(task => task.id === taskId);
    if (taskIndex !== -1) {
        taskList.splice(taskIndex, 1);
        localStorage.setItem("tasks", JSON.stringify(taskList));
        taskCard.remove(); // Remove the task card from the DOM
    }
}

// Todo: create a function to handle dropping a task into a new status lane
function handleDrop(event, ui) {
    const taskId = ui.draggable.attr("data-task-id");
    const newStatus = event.target.id;

    // Find the task index in the taskList
    const taskIndex = taskList.findIndex(task => task.id === parseInt(taskId));

    if (taskIndex !== -1) {
        // Update the task status in taskList
        taskList[taskIndex].status = newStatus;

        // Update localStorage with the modified taskList
        localStorage.setItem("tasks", JSON.stringify(taskList));

        // Get the task card element
        const taskCard = $(`[data-task-id="${taskId}"]`);

        // Get the status lane for the task card
        let statusLane = document.getElementById(newStatus);

        if (statusLane) {
            // Manually position the task card within the status lane
            const offset = ui.offset;
            const laneOffset = $(statusLane).offset();
            const relativeOffset = {
                top: offset.top - laneOffset.top,
                left: offset.left - laneOffset.left
            };

            // Set the position of the task card within the status lane
            taskCard.css({
                position: 'absolute',
                top: relativeOffset.top,
                left: relativeOffset.left
            });

            // Append the task card to the status lane
            statusLane.appendChild(taskCard[0]);
        } else {
            console.error("Status lane not found for task:", taskId);
        }
    } else {
        console.error("Task not found for ID:", taskId);
    }
}



// Todo: when the page loads, render the task list, add event listeners, make lanes droppable, and make the due date field a date picker
$(document).ready(function () {
    renderTaskList();

    $("#add-tasks-btn").on("click", handleAddTask);
    $("#task-container").on("click", ".task-card button", handleDeleteTask);

    $('.lane').droppable({
        accept: '.task-card',
        tolerance: 'pointer', // Allow dropping anywhere within the droppable area
        drop: handleDrop,
    });

    $('#taskDueDate').datepicker({
        changeMonth: true,
        changeYear: true,
    });
});




