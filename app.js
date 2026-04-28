let workouts = JSON.parse(localStorage.getItem('workouts')) || [];
let currentWorkout = null;
let currentExercise = null;
let setCounter = 0;

const contentDiv = document.getElementById('content');
const sidebar = document.getElementById('sidebar');

document.getElementById('toggle-sidebar').addEventListener('click', () => {
    sidebar.classList.toggle('active');
});

// --- SIDEBAR & LOG LOGIC ---

function renderLogs() {
    const list = document.getElementById('workout-list');
    list.innerHTML = '';
    
    workouts.forEach((w, index) => {
        const li = document.createElement('li');
        li.className = 'workout-log-item';
        
        li.innerHTML = `
            <div class="log-header">
                <div onclick="toggleLogDetail(${index})" style="flex-grow:1">
                    <strong>${w.title}</strong><br>
                    <small>${w.date}</small>
                </div>
                <div class="log-actions">
                    <button class="icon-btn edit-btn" onclick="editWorkout(${index})">✏️</button>
                    <button class="icon-btn trash-btn" onclick="deleteWorkout(${index})">🗑️</button>
                </div>
            </div>
            <div id="log-detail-${index}" class="log-details" style="display:none; margin-top:10px;">
                ${w.exercises.map(ex => `
                    <div class="ex-detail">
                        <strong>${ex.name}</strong><br>
                        ${ex.weight}lbs | Rest: ${ex.restTime}m<br>
                        Reps: ${ex.setsDone.join(', ')}
                    </div>
                `).join('')}
            </div>
        `;
        list.appendChild(li);
    });
}

window.toggleLogDetail = function(index) {
    const detailDiv = document.getElementById(`log-detail-${index}`);
    detailDiv.style.display = detailDiv.style.display === 'none' ? 'block' : 'none';
}

window.deleteWorkout = function(index) {
    if(confirm("Delete this workout log?")) {
        workouts.splice(index, 1);
        saveAndRefresh();
    }
}

window.editWorkout = function(index) {
    const newTitle = prompt("Enter new title:", workouts[index].title);
    if (newTitle !== null) {
        workouts[index].title = newTitle;
        saveAndRefresh();
    }
}

function saveAndRefresh() {
    localStorage.setItem('workouts', JSON.stringify(workouts));
    renderLogs();
}

// --- WORKOUT FLOW (NO TIMER) ---

function renderHome() {
    contentDiv.innerHTML = `<button class="btn" onclick="startWorkout()">Start Workout</button>`;
    renderLogs();
}

window.startWorkout = function() {
    currentWorkout = { title: '', exercises: [], date: '', time: '' };
    contentDiv.innerHTML = `
        <h3>New Workout</h3>
        <input type="text" id="w-title" placeholder="Workout Title">
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
        <input type="number" id="e-weight" placeholder="Weight (lbs)">
        <input type="number" id="e-sets" placeholder="Number of Sets">
        <input type="number" step="0.5" id="e-rest" placeholder="Rest Time (minutes)">
        <button class="btn" onclick="beginSets()">Start Movement</button>
    `;
}

window.beginSets = function() {
    currentExercise = {
        name: document.getElementById('e-name').value || "Exercise",
        weight: document.getElementById('e-weight').value || 0,
        targetSets: parseInt(document.getElementById('e-sets').value) || 1,
        restTime: document.getElementById('e-rest').value || 0,
        setsDone: []
    };
    setCounter = 1;
    renderActiveSet();
}

function renderActiveSet() {
    contentDiv.innerHTML = `
        <h2>${currentExercise.name}</h2>
        <p>Set ${setCounter} of ${currentExercise.targetSets}</p>
        <p>Target Rest: ${currentExercise.restTime} min</p>
        <input type="number" id="reps-done" placeholder="Reps completed for this set">
        <button class="btn" onclick="nextStep()">Submit Set</button>
    `;
}

window.nextStep = function() {
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
        <h2>Exercise Done!</h2>
        <button class="btn" onclick="setupExercise()">Add Another Exercise</button>
        <button class="btn btn-secondary" onclick="finishWorkout()">Finish Workout</button>
    `;
}

window.finishWorkout = function() {
    const now = new Date();
    currentWorkout.date = now.toLocaleDateString();
    currentWorkout.time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    workouts.push(currentWorkout);
    saveAndRefresh();
    renderHome();
}

renderHome();
