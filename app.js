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

// Render Sidebar Logs
function renderLogs() {
    const list = document.getElementById('workout-list');
    list.innerHTML = '';
    workouts.forEach(w => {
        const li = document.createElement('li');
        li.innerHTML = `<strong>${w.title}</strong><br>${w.date} ${w.time}`;
        list.appendChild(li);
    });
}

// 1. Home Screen
function renderHome() {
    contentDiv.innerHTML = `<button class="btn" onclick="startWorkout()">Start Workout</button>`;
    renderLogs();
}

// 2. Start Workout
window.startWorkout = function() {
    currentWorkout = { title: '', exercises: [], date: '', time: '' };
    contentDiv.innerHTML = `
        <h3>New Workout</h3>
        <input type="text" id="w-title" placeholder="Workout Title (e.g., Pull Day)" required>
        <button class="btn" onclick="setupExercise()">Next</button>
    `;
}

// 3. Setup Exercise
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

// 4. Begin Sets Loop
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

// 5. Active Set View
function renderActiveSet() {
    contentDiv.innerHTML = `
        <h2>${currentExercise.name}</h2>
        <p>Weight: ${currentExercise.weight} | Set: ${setCounter} / ${currentExercise.targetSets}</p>
        <button class="btn" onclick="completeSet()">Set Completed</button>
    `;
}

// 6. Complete Set & Start Rest Timer (Allows typing reps while resting)
window.completeSet = function() {
    let timeLeft = currentExercise.restTime;
    
    contentDiv.innerHTML = `
        <h2>Rest!</h2>
        <div class="timer-display" id="timer">${timeLeft}</div>
        <p>Log reps for Set ${setCounter}:</p>
        <input type="number" id="reps-done" placeholder="Reps completed">
        <button class="btn btn-secondary" onclick="skipRest()">Skip Timer</button>
    `;

    restTimer = setInterval(() => {
        timeLeft--;
        document.getElementById('timer').innerText = timeLeft;
        if (timeLeft <= 0) {
            clearInterval(restTimer);
            handleRestFinished();
        }
    }, 1000);
}

// 7. Handle Rest Finish (or Skip)
window.skipRest = function() {
    clearInterval(restTimer);
    handleRestFinished();
}

function handleRestFinished() {
    // Save the reps the user typed during rest
    let reps = document.getElementById('reps-done').value || 0;
    currentExercise.setsDone.push(reps);

    if (setCounter < currentExercise.targetSets) {
        setCounter++;
        renderActiveSet(); // Loop back to next set
    } else {
        finishExercise(); // Sets complete
    }
}

// 8. Finish Exercise Prompt
function finishExercise() {
    currentWorkout.exercises.push(currentExercise);
    contentDiv.innerHTML = `
        <h2>Movement Complete!</h2>
        <button class="btn" onclick="setupExercise()">Add Another Exercise</button>
        <button class="btn btn-secondary" onclick="finishWorkout()">Finish Workout</button>
    `;
}

// 9. Finish Workout & Save
window.finishWorkout = function() {
    const now = new Date();
    currentWorkout.date = now.toLocaleDateString();
    currentWorkout.time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    workouts.push(currentWorkout);
    localStorage.setItem('workouts', JSON.stringify(workouts));
    
    renderHome(); // Go back to start
}

// Init
renderHome();
