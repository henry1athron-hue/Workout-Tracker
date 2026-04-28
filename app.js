// State Management
let workouts = JSON.parse(localStorage.getItem('workouts')) || [];
let currentWorkout = null;
let currentExercise = null;
let setCounter = 0;
let restTimer = null;

const contentDiv = document.getElementById('content');
const sidebar = document.getElementById('sidebar');

// Sidebar Toggle
document.getElementById('toggle-sidebar').addEventListener('click', () => {
    sidebar.classList.toggle('active');
});

// Render Sidebar Logs with Dropdown Detail
function renderLogs() {
    const list = document.getElementById('workout-list');
    list.innerHTML = '';
    
    // Reverse so newest is on top
    [...workouts].reverse().forEach((w, index) => {
        const li = document.createElement('li');
        li.className = 'workout-log-item';
        
        // Header of the log entry
        li.innerHTML = `
            <div class="log-header" onclick="toggleLogDetail(${index})">
                <strong>${w.title}</strong><br>
                <small>${w.date} at ${w.time}</small>
            </div>
            <div id="log-detail-${index}" class="log-details" style="display:none;">
                ${w.exercises.map(ex => `
                    <div class="ex-detail">
                        <strong>${ex.name} @ ${ex.weight}lbs</strong><br>
                        <span>Sets: ${ex.setsDone.join(', ')}</span>
                    </div>
                `).join('')}
            </div>
        `;
        list.appendChild(li);
    });
}

// Function to expand/collapse log details
window.toggleLogDetail = function(index) {
    const detailDiv = document.getElementById(`log-detail-${index}`);
    detailDiv.style.display = detailDiv.style.display === 'none' ? 'block' : 'none';
}

// --- REST OF THE FUNCTIONS REMAIN THE SAME ---

function renderHome() {
    contentDiv.innerHTML = `<button class="btn" onclick="startWorkout()">Start Workout</button>`;
    renderLogs();
}

window.startWorkout = function() {
    currentWorkout = { title: '', exercises: [], date: '', time: '' };
    contentDiv.innerHTML = `
        <h3>New Workout</h3>
        <input type="text" id="w-title" placeholder="Workout Title (e.g., Pull Day)" required>
        <button class="btn" onclick="setupExercise()">Next</button>
    `;
}

window.setupExercise = function() {
    if(document.getElementById('w-title')) {
        currentWorkout.title = document.getElementById('w-title').value || 'Untitled Workout';
    }
    contentDiv.innerHTML = `
        <h3>Add Movement</h3>
        <input type="text" id="e-name" placeholder="Movement Name">
        <input type="number" id="e-weight" placeholder="Weight">
        <input type="number" id="e-sets" placeholder="Total Sets">
        <input type="number" id="e-rest" placeholder="Rest Time (seconds)">
        <button class="btn" onclick="beginSets()">Start Movement</button>
    `;
}

window.beginSets = function() {
    currentExercise = {
        name: document.getElementById('e-name').value,
        weight: document.getElementById('e-weight').value,
        targetSets: parseInt(document.getElementById('e-sets').value),
        restTime: parseInt(document.getElementById('e-rest').value),
        setsDone: []
    };
    setCounter = 1;
    renderActiveSet();
}

function renderActiveSet() {
    contentDiv.innerHTML = `
        <h2>${currentExercise.name}</h2>
        <p>Weight: ${currentExercise.weight} | Set: ${setCounter} / ${currentExercise.targetSets}</p>
        <button class="btn" onclick="completeSet()">Set Completed</button>
    `;
}

window.completeSet = function() {
    let timeLeft = currentExercise.restTime;
    contentDiv.innerHTML = `
        <h2>Rest!</h2>
        <div class="timer-display" id="timer">${timeLeft}</div>
        <p>Log reps for Set ${setCounter}:</p>
        <input type="number" id="reps-done" placeholder="Reps completed" autofocus>
        <button class="btn btn-secondary" onclick="skipRest()">Skip Timer</button>
    `;

    restTimer = setInterval(() => {
        timeLeft--;
        const timerEl = document.getElementById('timer');
        if(timerEl) timerEl.innerText = timeLeft;
        if (timeLeft <= 0) {
            clearInterval(restTimer);
            handleRestFinished();
        }
    }, 1000);
}

window.skipRest = function() {
    clearInterval(restTimer);
    handleRestFinished();
}

function handleRestFinished() {
    let reps = document.getElementById('reps-done').value || 0;
    currentExercise.setsDone.push(reps);

    if (setCounter < currentExercise.targetSets) {
        setCounter++;
        renderActiveSet();
    } else {
        finishExercise();
    }
}

function finishExercise() {
    currentWorkout.exercises.push(currentExercise);
    contentDiv.innerHTML = `
        <h2>Movement Complete!</h2>
        <button class="btn" onclick="setupExercise()">Add Another Exercise</button>
        <button class="btn btn-secondary" onclick="finishWorkout()">Finish Workout</button>
    `;
}

window.finishWorkout = function() {
    const now = new Date();
    currentWorkout.date = now.toLocaleDateString();
    currentWorkout.time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    workouts.push(currentWorkout);
    localStorage.setItem('workouts', JSON.stringify(workouts));
    
    renderHome();
}

renderHome();
