document.addEventListener("DOMContentLoaded", function () {

    let currentFilter = "All";
    let currentSection = "All";

    const loggedInUser = getCurrentUser();

    if (!loggedInUser) {
        window.location.href = "./login1.html";
        return;
    }

    const today = getToday();
    document.getElementById("taskDate").min = today;

    initTheme();

    // USER DETAILS
    document.getElementById("userName").innerText = loggedInUser.name || loggedInUser.fullname || "User";
    document.getElementById("userEmail").innerText = loggedInUser.email || "";
    document.getElementById("profileName").innerText = loggedInUser.name || "";
    document.getElementById("profileEmail").innerText = loggedInUser.email || "";
    document.getElementById("profilePhone").innerText = loggedInUser.phone || "";
    document.getElementById("profileAge").innerText = loggedInUser.age || "";
    document.getElementById("profileDOB").innerText = loggedInUser.dob || "";
    document.getElementById("profileCountry").innerText = loggedInUser.country || "";
    document.getElementById("profileGender").innerText = loggedInUser.gender || "N/A";
    document.getElementById("profileSkills").innerText =
        Array.isArray(loggedInUser.skills)
            ? loggedInUser.skills.join(", ")
            : (loggedInUser.skills || "N/A");
    document.getElementById("profileAddress").innerText = loggedInUser.address || "";

    // SHOW / HIDE TASK BOX
    document.getElementById("showTaskBox").addEventListener("click", function () {
        document.getElementById("taskBox").classList.toggle("d-none");
    });

    function showSection(section) {
        ["activeSection", "completedSection", "overdueSection", "deletedSection"]
            .forEach(id => document.getElementById(id).classList.add("d-none"));

        if (section === "All") {
            ["activeSection", "completedSection", "overdueSection", "deletedSection"]
                .forEach(id => document.getElementById(id).classList.remove("d-none"));
        } else if (section === "Active") {
            document.getElementById("activeSection").classList.remove("d-none");
        } else if (section === "Completed") {
            document.getElementById("completedSection").classList.remove("d-none");
        } else if (section === "Overdue") {
            document.getElementById("overdueSection").classList.remove("d-none");
        } else if (section === "Deleted") {
            document.getElementById("deletedSection").classList.remove("d-none");
        }
    }

    document.querySelectorAll(".sectionFilterBtn").forEach(btn => {
        btn.addEventListener("click", function () {
            currentSection = this.dataset.section;
            showSection(currentSection);
        });
    });

    function getPriorityBadge(priority) {
        if (priority === "High") {
            return `<span class="badge bg-danger">High</span>`;
        }
        if (priority === "Medium") {
            return `<span class="badge bg-warning text-dark">Medium</span>`;
        }
        return `<span class="badge bg-success">Low</span>`;
    }

    function getStatusBadge(task) {
        return task.completed
            ? `<span class="badge bg-success">Completed</span>`
            : `<span class="badge bg-warning text-dark">Pending</span>`;
    }

    function createTaskCard(task) {
        const isOverdue =
            task.date < today && !task.completed && !task.deleted;

        return `
        <div class="col-md-6">
            <div class="card shadow-sm p-4 h-100">
                <div class="d-flex justify-content-between align-items-center mb-2">
                    <h4>${task.title || ""}</h4>
                    <div class="d-flex gap-2">
                        ${getPriorityBadge(task.priority)}
                        ${getStatusBadge(task)}
                    </div>
                </div>

                <p class="text-muted">${task.description || ""}</p>

                <p>
                    <i class="bi bi-clock"></i>
                    ${task.time || ""}
                </p>

                <p>
                    <i class="bi bi-calendar-event"></i>
                    ${task.date || ""}
                </p>

                ${isOverdue ? `<p><span class="badge bg-warning text-dark">Overdue</span></p>` : ""}

                <small class="text-secondary">
                    Created: ${task.createdAt || ""}
                </small>

                <div class="mt-3 d-flex justify-content-end gap-2 flex-wrap">
                    ${!task.completed && !task.deleted ? `
                        <button class="btn btn-warning btn-sm editBtn" data-id="${task.id}">
                            <i class="bi bi-pencil-square"></i> Edit
                        </button>

                        <button class="btn btn-success btn-sm completeBtn" data-id="${task.id}">
                            <i class="bi bi-check-circle"></i> Complete
                        </button>

                        <button class="btn btn-secondary btn-sm deleteBtn" data-id="${task.id}">
                            <i class="bi bi-trash"></i> Delete
                        </button>
                    ` : ""}

                    ${task.deleted ? `
                        <button class="btn btn-primary btn-sm restoreBtn" data-id="${task.id}">
                            <i class="bi bi-arrow-counterclockwise"></i> Restore
                        </button>
                    ` : ""}
                </div>

                <div class="update-box mt-4" id="updateBox-${task.id}" style="display:none;">
                    <input type="text" class="form-control mb-2 updateTitle" value="${task.title || ""}">
                    <textarea class="form-control mb-2 updateDescription" rows="3">${task.description || ""}</textarea>
                    <input type="time" class="form-control mb-2 updateTime" value="${task.time || ""}">
                    <input type="date" class="form-control mb-2 updateDate" min="${today}" value="${task.date || ""}">

                    <select class="form-select mb-3 updatePriority">
                        <option value="Low" ${task.priority === "Low" ? "selected" : ""}>Low</option>
                        <option value="Medium" ${task.priority === "Medium" ? "selected" : ""}>Medium</option>
                        <option value="High" ${task.priority === "High" ? "selected" : ""}>High</option>
                    </select>

                    <button class="btn btn-primary btn-sm updateBtn" data-id="${task.id}">
                        Update
                    </button>
                </div>
            </div>
        </div>`;
    }

    async function displayTasks() {
        document.getElementById("taskList").innerHTML = "";
        document.getElementById("completedTaskList").innerHTML = "";
        document.getElementById("overdueTaskList").innerHTML = "";
        document.getElementById("deletedTaskList").innerHTML = "";

        try {
            // OOP: Task class performs GET for this user's tasks.
            const tasks = await new Task().getByUserId(loggedInUser.id);

            tasks.forEach(task => {
                if (currentFilter !== "All" && task.priority !== currentFilter) return;

                const isOverdue =
                    task.date < today && !task.completed && !task.deleted;

                const card = createTaskCard(task);

                if (task.deleted) {
                    $("#deletedTaskList").append(card);
                } else if (task.completed) {
                    $("#completedTaskList").append(card);
                } else if (isOverdue) {
                    $("#overdueTaskList").append(card);
                } else {
                    $("#taskList").append(card);
                }
            });
        } catch (error) {
            console.error(error);
            showError("Failed to load tasks");
        }
    }

    // ADD TASK - POST
    document.getElementById("addTaskBtn").addEventListener("click", async function () {
        const title = document.getElementById("taskTitle").value.trim();
        const description = document.getElementById("taskDescription").value.trim();
        const time = document.getElementById("taskTime").value;
        const date = document.getElementById("taskDate").value;
        const priority = document.getElementById("taskPriority").value;

        if (!title || !description || !time || !date) {
            Swal.fire({
                icon: "warning",
                title: "Please fill all task fields"
            });
            return;
        }

        const taskData = {
            userId: loggedInUser.id,
            title,
            description,
            time,
            date,
            priority,
            completed: false,
            deleted: false,
            createdAt: new Date().toLocaleDateString()
        };

        try {
            // OOP: Task object performs POST.
            await new Task(taskData).create();

            $("#taskTitle, #taskDescription, #taskTime, #taskDate").val("");
            await displayTasks();

            Swal.fire({
                toast: true,
                position: "top-end",
                icon: "success",
                title: "Task Added Successfully",
                showConfirmButton: false,
                timer: 1800
            });
        } catch (error) {
            console.error(error);
            showError("Failed to add task");
        }
    });

    document.addEventListener("click", async function (event) {

        const button = event.target.closest("button");
        if (!button) return;

        const id = button.dataset.id;

        // EDIT
        if (button.classList.contains("editBtn")) {
            const box = document.getElementById(`updateBox-${id}`);
            box.style.display = box.style.display === "none" ? "block" : "none";
        }

        // UPDATE - PATCH
        if (button.classList.contains("updateBtn")) {
            const parent = button.closest(".update-box");

            const updatedData = {
                title: parent.querySelector(".updateTitle").value.trim(),
                description: parent.querySelector(".updateDescription").value.trim(),
                time: parent.querySelector(".updateTime").value,
                date: parent.querySelector(".updateDate").value,
                priority: parent.querySelector(".updatePriority").value,
                updatedAt: new Date().toLocaleDateString()
            };

            const result = await Swal.fire({
                title: "Save changes?",
                text: "Do you want to update this task?",
                icon: "question",
                showCancelButton: true,
                confirmButtonText: "Yes, update",
                cancelButtonText: "Cancel"
            });

            if (!result.isConfirmed) return;

            try {
                await new Task().update(id, updatedData);
                await displayTasks();

                Swal.fire({
                    toast: true,
                    position: "top-end",
                    icon: "success",
                    title: "Task Updated",
                    timer: 1500,
                    showConfirmButton: false
                });
            } catch (error) {
                console.error(error);
                showError("Failed to update task");
            }
        }

        // COMPLETE - PATCH
        if (button.classList.contains("completeBtn")) {
            const result = await Swal.fire({
                title: "Complete Task?",
                text: "Mark this task as completed?",
                icon: "question",
                showCancelButton: true,
                confirmButtonColor: "#16a34a",
                confirmButtonText: "Yes, Complete",
                cancelButtonText: "Cancel"
            });

            if (!result.isConfirmed) return;

            try {
                await new Task().update(id, { completed: true });
                await displayTasks();

                Swal.fire({
                    icon: "success",
                    title: "Task Completed Successfully",
                    timer: 1200,
                    showConfirmButton: false
                });
            } catch (error) {
                console.error(error);
                showError("Failed to complete task");
            }
        }

        // SOFT DELETE - PATCH
        if (button.classList.contains("deleteBtn")) {
            const result = await Swal.fire({
                title: "Delete this task?",
                text: "It will move to deleted section",
                icon: "warning",
                showCancelButton: true,
                confirmButtonColor: "red",
                confirmButtonText: "Yes, delete",
                cancelButtonText: "Cancel"
            });

            if (!result.isConfirmed) return;

            try {
                await new Task().update(id, { deleted: true });
                await displayTasks();

                Swal.fire({
                    toast: true,
                    position: "top-end",
                    icon: "success",
                    title: "Deleted Successfully",
                    timer: 1500,
                    showConfirmButton: false
                });
            } catch (error) {
                console.error(error);
                showError("Failed to delete task");
            }
        }

        // RESTORE - PATCH
        if (button.classList.contains("restoreBtn")) {
            const result = await Swal.fire({
                title: "Restore Task?",
                text: "Move this task back to active tasks?",
                icon: "question",
                showCancelButton: true,
                confirmButtonColor: "#2563eb",
                confirmButtonText: "Yes, Restore",
                cancelButtonText: "Cancel"
            });

            if (!result.isConfirmed) return;

            try {
                await new Task().update(id, { deleted: false });
                await displayTasks();
            } catch (error) {
                console.error(error);
                showError("Failed to restore task");
            }
        }
    });

    // LOGOUT
    document.getElementById("logoutBtn").addEventListener("click", async function () {
        const result = await Swal.fire({
            title: "Are you sure to logout?",
            text: "You will be logged out",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "red",
            cancelButtonText: "Cancel",
            confirmButtonText: "Yes, logout"
        });

        if (!result.isConfirmed) return;

        clearSession();

        Swal.fire({
            icon: "success",
            title: "Logged Out Successfully",
            timer: 1000,
            showConfirmButton: false
        }).then(() => {
            window.location.href = "./login1.html";
        });
    });

    displayTasks();
    showSection("All");
});
