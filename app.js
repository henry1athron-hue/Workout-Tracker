let workouts = JSON.parse(localStorage.getItem('workouts')) || [];
let currentWorkout = null;
let currentExercise = null;
let setCounter = 0;

const contentDiv = document.getElementById('content');
const sidebar = document.getElementById('sidebar');

// --- 1. SIDEBAR TOGGLE ---
document.getElementById('toggle-sidebar').addEventListener('click', () => {
    sidebar.classList.toggle('active');
});

// --- 2. SIDEBAR RENDERING ---
function renderLogs() {
    const list = document.getElementById('workout-list');
    list.innerHTML = '';
    
    const displayList = [...workouts].reverse();

    displayList.forEach((w, reversedIndex) => {
        const originalIndex = workouts.length - 1 - reversedIndex;
        
        const li = document.createElement('li');
        li.className = 'workout-log-item';
        
        li.innerHTML = `
            <div class="log-header">
                <div onclick="toggleLogDetail(${originalIndex})" style="flex-grow:1">
                    <strong>${w.title}</strong><br>
                    <small>${w.date}</small>
                </div>
                <div class="log-actions">
                    <button class="icon-btn edit-btn" onclick="openEditMode(${originalIndex})">✏️</button>
                    <button class="icon-btn trash-btn" onclick="deleteWorkout(${originalIndex})">🗑️</button>
                </div>
            </div>
            <div id="log-detail-${originalIndex}" class="log-details" style="display:none; margin-top:10px;">
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
    const isHidden = detailDiv.style.display === 'none';
    detailDiv.style.display = isHidden ? 'block' : 'none';
}

window.deleteWorkout = function(index) {
    if(confirm("Permanently delete this workout log?")) {
        workouts.splice(index, 1);
        saveAndRefresh();
    }
}

// --- 3. EDIT MODE (IN-APP SUITE) ---
window.openEditMode = function(index) {
    sidebar.classList.remove('active');
    const w = workouts[index];
    
    let html = `
        <div class="edit-container">
            <h2>Edit Workout</h2>
            <label>Workout Title</label>
            <input type="text" id="edit-w-title" value="${w.title}">
            <hr>
    `;

    w.exercises.forEach((ex, exIdx) => {
        html += `
            <div class="edit-card">
                <label>Exercise Name</label>
                <input type="text" id="edit-ex-name-${exIdx}" value="${ex.name}">
                
                <div style="display:flex; gap:10px;">
                    <div style="flex:1">
                        <label>Weight</label>
                        <input type="number" id="edit-ex-weight-${exIdx}" value="${ex.weight}">
                    </div>
                    <div style="flex:1">
                        <label>Rest (m)</label>
                        <input type="number" step="0.1" id="edit-ex-rest-${exIdx}" value="${ex.restTime}">
                    </div>
                </div>

                <label>Reps (Comma separated)</label>
                <input type="text" id="edit-ex-reps-${exIdx}" value="${ex.setsDone.join(', ')}">
            </div>
        `;
    });

    html += `
            <button class="btn" onclick="saveAllEdits(${index})">Save Changes</button>
            <button class="btn btn-secondary" onclick="renderHome()">Cancel</button>
        </div>
    `;

    contentDiv.innerHTML = html;
}

window.saveAllEdits = function(index) {
    const w = workouts[index];
    w.title = document.getElementById('edit-w-title').value;

    w.exercises.forEach((ex, exIdx) => {
        ex.name = document.getElementById(`edit-ex-name-${exIdx}`).value;
        ex.weight = document.getElementById(`edit-ex-weight-${exIdx}`).value;
        ex.restTime = document.getElementById(`edit-ex-rest-${exIdx}`).value;
        const repInput = document.getElementById(`edit-ex-reps-${exIdx}`).value;
        ex.setsDone = repInput.split(',').map(item => item.trim()).filter(item => item !== "");
    });

    saveAndRefresh();
    renderHome();
}

// --- 4. CORE APP FLOW & CANCEL LOGIC ---
function saveAndRefresh() {
    localStorage.setItem('workouts', JSON.stringify(workouts));
    renderLogs();
}

function renderHome() {
    contentDiv.innerHTML = `
        <div class="welcome-screen">
            <h1>Ready?</h1>
            <button class="btn" onclick="startWorkout()">Start New Workout</button>
        </div>
    `;
    renderLogs();
}

window.startWorkout = function() {
    currentWorkout = { title: '', exercises: [], date: '', time: '' };
    contentDiv.innerHTML = `
        <h3>Workout Name</h3>
        <input type="text" id="w-title" placeholder="e.g. Push Day" autofocus>
        <button class="btn" onclick="setupExercise()">Next</button>
        <button class="btn btn-secondary" onclick="renderHome()">Back</button>
    `;
}

window.setupExercise = function() {
    if(document.getElementById('w-title')) {
        currentWorkout.title = document.getElementById('w-title').value || 'Untitled Workout';
    }
    
    contentDiv.innerHTML = `
        <h3>Add Exercise</h3>
        <input type="text" id="e-name" placeholder="Exercise Name">
        <input type="number" id="e-weight" placeholder="Weight (lbs)">
        <input type="number" id="e-sets" placeholder="Number of Sets">
        <input type="number" step="0.1" id="e-rest" placeholder="Rest (minutes)">
        
        <button class="btn" onclick="beginSets()">Start Movement</button>
        
        <button class="btn btn-secondary" onclick="cancelWorkout()">Cancel Workout</button>

        <!-- FINISH WORKOUT BUTTON: Appears if there are saved movements -->
        ${currentWorkout.exercises.length > 0 ? 
            `<button class="btn btn-secondary" style="background-color: #2e7d32; color: white; margin-top: 10px;" onclick="finishWorkout()">Finish & Log Workout</button>` 
            : ''}
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
        <div class="set-tracker">
            <h2>${currentExercise.name}</h2>
            <p class="set-info">Set ${setCounter} of ${currentExercise.targetSets}</p>
            <p class="rest-hint">Rest Target: ${currentExercise.restTime} min</p>
            <input type="number" id="reps-done" placeholder="Reps performed" autofocus>
            <button class="btn" onclick="submitSet()">Complete Set</button>
            
            <button class="btn btn-secondary" style="margin-top: 10px; background-color: #2e7d32; color: white;" onclick="finishExercise()">Finish Movement Early</button>

            <button class="btn btn-secondary" style="margin-top: 10px; background-color: #444;" onclick="cancelMovement()">Cancel Movement</button>
            
            <button class="btn btn-secondary" style="margin-top: 10px;" onclick="cancelWorkout()">Cancel Workout</button>
        </div>
    `;
}

window.submitSet = function() {
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
    if (currentExercise && !currentWorkout.exercises.includes(currentExercise)) {
        currentWorkout.exercises.push(currentExercise);
    }
    
    contentDiv.innerHTML = `
        <h2>Movement Saved!</h2>
        <button class="btn" onclick="setupExercise()">Add Another Movement</button>
        <button class="btn btn-secondary" onclick="finishWorkout()">Finish & Log Workout</button>
        <button class="btn btn-secondary" style="background-color: #662222; margin-top: 20px;" onclick="cancelWorkout()">Discard Workout</button>
    `;
}

window.cancelMovement = function() {
    if(confirm("Discard this specific movement? Progress for this exercise will be lost.")) {
        currentExercise = null;
        setCounter = 0;
        setupExercise();
    }
}

window.cancelWorkout = function() {
    if(confirm("Discard this current workout? Progress will not be saved.")) {
        currentWorkout = null;
        currentExercise = null;
        renderHome();
    }
}

window.finishWorkout = function() {
    const now = new Date();
    currentWorkout.date = now.toLocaleDateString();
    currentWorkout.time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    workouts.push(currentWorkout);
    saveAndRefresh();
    renderHome();
}

// Initial Boot
renderHome();
