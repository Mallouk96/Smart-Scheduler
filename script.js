document.addEventListener('DOMContentLoaded', function () {
    // Load tasks from localStorage
    loadTasks();

    // Add task on button click
    document.getElementById('addTaskBtn').addEventListener('click', function () {
        let taskName = document.getElementById('taskName').value.trim();
        let taskDate = document.getElementById('taskDate').value;
        let taskTime = document.getElementById('taskTime').value;
        let taskDesc = document.getElementById('taskDesc').value.trim();
        let taskPriority = document.getElementById('taskPriority').value;

        if (taskName !== '') {
            addTask(taskName, taskDate, taskTime, taskDesc, taskPriority);
            saveTask(taskName, taskDate, taskTime, taskDesc, taskPriority);
            clearInputs();
        }
    });

    // Add task to the task list
    function addTask(name, date, time, description, priority) {
        const li = document.createElement('li');
        li.classList.add('task-item');
        li.innerHTML = `
            <div class="task-info">
                <span class="task-name">${name}</span><br>
                <span class="task-date">${date} ${time}</span><br>
                <span class="task-desc">${description}</span><br>
                <span class="task-priority">Priority: ${priority.charAt(0).toUpperCase() + priority.slice(1)}</span>
            </div>
            <button class="complete-btn">✔️</button>
            <button class="delete-btn">🗑️</button>
            <button class="edit-btn">✏️</button> <!-- Edit button added -->
        `;
        li.querySelector('.delete-btn').addEventListener('click', deleteTask);
        li.querySelector('.complete-btn').addEventListener('click', completeTask);
        li.querySelector('.edit-btn').addEventListener('click', editTask); // Edit task functionality

        document.getElementById('taskList').appendChild(li);

        // Send reminder notification
        const taskDateTime = new Date(`${date} ${time}`);
        sendTaskReminder(name, taskDateTime);
    }

    // Save task to localStorage
    function saveTask(name, date, time, description, priority) {
        let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        tasks.push({ taskName: name, taskDate: date, taskTime: time, taskDesc: description, taskPriority: priority, isCompleted: false });
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }

    // Clear input fields after adding task
    function clearInputs() {
        document.getElementById('taskName').value = '';
        document.getElementById('taskDate').value = '';
        document.getElementById('taskTime').value = '';
        document.getElementById('taskDesc').value = '';
        document.getElementById('taskPriority').value = 'low';
    }

    // Delete task from localStorage and UI
    function deleteTask(event) {
        let taskList = JSON.parse(localStorage.getItem('tasks')) || [];
        let taskItem = event.target.closest('li');
        let taskName = taskItem.querySelector('.task-name').textContent;

        taskList = taskList.filter(task => task.taskName !== taskName);
        localStorage.setItem('tasks', JSON.stringify(taskList));
        taskItem.remove();
    }

    // Mark task as completed or not
    function completeTask(event) {
        let taskList = JSON.parse(localStorage.getItem('tasks')) || [];
        let taskItem = event.target.closest('li');
        let taskName = taskItem.querySelector('.task-name').textContent;

        taskList.forEach(task => {
            if (task.taskName === taskName) {
                task.isCompleted = !task.isCompleted;
            }
        });

        localStorage.setItem('tasks', JSON.stringify(taskList));
        taskItem.classList.toggle('completed');
    }

    // Edit task functionality
    function editTask(event) {
        let taskItem = event.target.closest('li');
        let taskName = taskItem.querySelector('.task-name').textContent;
        let taskList = JSON.parse(localStorage.getItem('tasks')) || [];
        let task = taskList.find(task => task.taskName === taskName);

        // Pre-fill the input fields with task data
        document.getElementById('taskName').value = task.taskName;
        document.getElementById('taskDate').value = task.taskDate;
        document.getElementById('taskTime').value = task.taskTime;
        document.getElementById('taskDesc').value = task.taskDesc;
        document.getElementById('taskPriority').value = task.taskPriority;

        // Remove the task for re-adding after editing
        deleteTask(event);

        // Optionally allow saving updates after edit
        document.getElementById('addTaskBtn').addEventListener('click', function () {
            let updatedName = document.getElementById('taskName').value.trim();
            let updatedDate = document.getElementById('taskDate').value;
            let updatedTime = document.getElementById('taskTime').value;
            let updatedDesc = document.getElementById('taskDesc').value.trim();
            let updatedPriority = document.getElementById('taskPriority').value;

            if (updatedName !== '') {
                addTask(updatedName, updatedDate, updatedTime, updatedDesc, updatedPriority);
                saveTask(updatedName, updatedDate, updatedTime, updatedDesc, updatedPriority);
                clearInputs();
            }
        });
    }

    // Load tasks from localStorage when page loads
    function loadTasks() {
        let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        tasks.forEach(task => {
            addTask(task.taskName, task.taskDate, task.taskTime, task.taskDesc, task.taskPriority);
            if (task.isCompleted) {
                let taskItems = document.querySelectorAll('#taskList li');
                let lastItem = taskItems[taskItems.length - 1];
                lastItem.classList.add('completed');
            }
        });
    }

    // Floating Action Button (FAB) functionality
    document.getElementById('fabBtn').addEventListener('click', function () {
        document.getElementById('taskName').focus();
    });
    
    // Task Search functionality
    document.getElementById('searchTasks').addEventListener('input', function () {
        let query = this.value.toLowerCase();
        let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        let filteredTasks = tasks.filter(task => task.taskName.toLowerCase().includes(query));
        renderTasks(filteredTasks);
    });

    // Function to render tasks (for search/filtering)
    function renderTasks(tasks) {
        document.getElementById('taskList').innerHTML = '';
        tasks.forEach(task => {
            addTask(task.taskName, task.taskDate, task.taskTime, task.taskDesc, task.taskPriority);
        });
    }
});

// Check if Notification API is supported
if ('Notification' in window) {
    // Request permission to send notifications
    Notification.requestPermission().then(function(permission) {
        if (permission === 'granted') {
            console.log('Notifications allowed');
        }
    });
}

// Function to send task reminder notification
function sendTaskReminder(taskName, taskDateTime) {
    let notificationTime = new Date(taskDateTime).getTime() - 600000; // 10 mins before due time

    setTimeout(function() {
        new Notification("Task Reminder", {
            body: `Reminder: ${taskName} is due soon.`,
            icon: 'path/to/icon.png'
        });
    }, notificationTime - Date.now());
}
