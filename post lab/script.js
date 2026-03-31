/**
 * Smart Attendance System - Core Logic
 * Powered by Face-API.js (vladmandic fork)
 */

const MODEL_URL = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/';
const WEBCAM_ELEMENT = document.getElementById('webcam');
const OVERLAY_CANVAS = document.getElementById('overlay');
const STATUS_TEXT = document.getElementById('status-text');
const STATUS_LABEL = document.getElementById('status-label');
const SYSTEM_STATUS = document.getElementById('system-status');
const LOADING_OVERLAY = document.getElementById('loading-overlay');
const ENROLL_BTN = document.getElementById('enroll-btn');
const ATTENDANCE_LIST = document.getElementById('attendance-list');
const COUNT_ENROLLED = document.getElementById('count-enrolled');
const COUNT_LOGS = document.getElementById('count-logs');

// State Management
let labeledFaceDescriptors = [];
let faceMatcher = null;
let isModelsLoaded = false;
let isWebcamRunning = false;
let attendanceLogs = JSON.parse(localStorage.getItem('attendanceLogs') || '[]');
let enrolledUsers = JSON.parse(localStorage.getItem('enrolledUsers') || '[]');
let lastRecognitionTime = {}; // To debounce attendance logging

/**
 * Initialize AI Models
 */
async function loadModels() {
    try {
        STATUS_TEXT.innerText = "Loading AI Models...";
        // Load the models from CDN
        // ssdMobilenetv1: For face detection
        // faceLandmark68Net: For detecting face landmarks (required by recognition)
        // faceRecognitionNet: For generating 128-float face descriptor (embedding)
        await Promise.all([
            faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
            faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
            faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL)
        ]);

        isModelsLoaded = true;
        STATUS_TEXT.innerText = "Models Loaded! Preparing System...";
        
        // Load stored users into descriptors
        await refreshFaceMatcher();
        updateStats();
        renderLogs();

        // Fade out loading screen
        setTimeout(() => {
            LOADING_OVERLAY.style.opacity = '0';
            setTimeout(() => LOADING_OVERLAY.style.display = 'none', 500);
        }, 1000);

    } catch (error) {
        console.error("Model Loading Error:", error);
        STATUS_TEXT.innerText = "Error: Failed to load models. Check console.";
        STATUS_TEXT.style.color = "var(--error)";
    }
}

/**
 * Convert stored user data into Face-API descriptors
 */
async function refreshFaceMatcher() {
    if (enrolledUsers.length === 0) {
        faceMatcher = null;
        return;
    }

    labeledFaceDescriptors = enrolledUsers.map(user => {
        // Convert the stored array back to Float32Array
        const desc = new Float32Array(user.descriptor);
        return new faceapi.LabeledFaceDescriptors(user.name + " (" + user.roll + ")", [desc]);
    });

    faceMatcher = new faceapi.FaceMatcher(labeledFaceDescriptors, 0.6);
}

/**
 * Start Webcam Feed
 */
async function startWebcam() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: {} });
        WEBCAM_ELEMENT.srcObject = stream;
        isWebcamRunning = true;
        
        SYSTEM_STATUS.classList.add('status-online');
        STATUS_LABEL.innerText = "System Online";
        document.getElementById('toggle-webcam').innerText = "Stop Webcam";
        ENROLL_BTN.disabled = false;

        // Sync overlay size with webcam
        WEBCAM_ELEMENT.addEventListener('play', () => {
            const displaySize = { width: WEBCAM_ELEMENT.offsetWidth, height: WEBCAM_ELEMENT.offsetHeight };
            faceapi.matchDimensions(OVERLAY_CANVAS, displaySize);
            startDetectionLoop(displaySize);
        });

    } catch (err) {
        console.error("Webcam Error:", err);
        alert("Could not access webcam. Please ensure permissions are granted.");
    }
}

/**
 * Detection Loop
 */
let detectionInterval;
function startDetectionLoop(displaySize) {
    detectionInterval = setInterval(async () => {
        if (!isWebcamRunning) return;

        // Detect all faces in the frame
        const detections = await faceapi.detectAllFaces(WEBCAM_ELEMENT)
            .withFaceLandmarks()
            .withFaceDescriptors();

        const resizedDetections = faceapi.resizeResults(detections, displaySize);
        
        // Clear canvas and draw new results
        const ctx = OVERLAY_CANVAS.getContext('2d');
        ctx.clearRect(0, 0, OVERLAY_CANVAS.width, OVERLAY_CANVAS.height);

        resizedDetections.forEach(detection => {
            const { descriptor } = detection;
            let label = "Unknown";
            let color = "red";

            if (faceMatcher) {
                const match = faceMatcher.findBestMatch(descriptor);
                label = match.toString();
                
                // Recognition Logic
                if (match.label !== 'unknown' && match.distance < 0.4) { // Distance < 0.4 means high confidence (lower dist = better match)
                    color = "#00b894"; // Green for matched
                    logAttendance(match.label, 1 - match.distance);
                }
            }

            // Draw bounding box
            const drawBox = new faceapi.draw.DrawBox(detection.detection.box, { label: label, boxColor: color });
            drawBox.draw(OVERLAY_CANVAS);
        });
    }, 200); // 5 FPS for smoother UI without overloading CPU
}

/**
 * Face Enrollment Logic
 */
async function enrollUser(e) {
    e.preventDefault();
    const name = document.getElementById('user-name').value;
    const roll = document.getElementById('user-roll').value;

    if (!isWebcamRunning) {
        alert("Please start the webcam first!");
        return;
    }

    ENROLL_BTN.innerText = "Capturing...";
    ENROLL_BTN.disabled = true;

    // Detect a single face for enrollment
    const detection = await faceapi.detectSingleFace(WEBCAM_ELEMENT)
        .withFaceLandmarks()
        .withFaceDescriptor();

    if (!detection) {
        alert("No face detected! Please look directly at the camera.");
        ENROLL_BTN.innerText = "Capture & Enroll";
        ENROLL_BTN.disabled = false;
        return;
    }

    // 1. Prevent Multi-Registration of same face or Roll ID
    
    // Check Roll ID first (simple string check)
    const isRollExists = enrolledUsers.some(u => u.roll === roll);
    if (isRollExists) {
        alert(`Error: Roll ID "${roll}" is already registered!`);
        ENROLL_BTN.innerText = "Capture & Enroll";
        ENROLL_BTN.disabled = false;
        return;
    }

    // Check Face Match (AI check)
    if (faceMatcher) {
        const match = faceMatcher.findBestMatch(detection.descriptor);
        // Distance < 0.45 means high confidence (lower dist = better match)
        if (match.label !== 'unknown' && match.distance < 0.45) {
            alert(`Registration Failed: This face is already enrolled as "${match.label}". One student can only register once!`);
            ENROLL_BTN.innerText = "Capture & Enroll";
            ENROLL_BTN.disabled = false;
            return;
        }
    }

    // Save to local storage
    const newUser = {
        name,
        roll,
        // Convert Float32Array to regular array for JSON storage
        descriptor: Array.from(detection.descriptor)
    };

    enrolledUsers.push(newUser);
    localStorage.setItem('enrolledUsers', JSON.stringify(enrolledUsers));
    
    await refreshFaceMatcher();
    updateStats();
    
    alert(`Success! ${name} has been enrolled.`);
    document.getElementById('enrollment-form').reset();
    ENROLL_BTN.innerText = "Capture & Enroll";
    ENROLL_BTN.disabled = false;
}

/**
 * Log Attendance with Debouncing
 */
function logAttendance(labeledMatch, confidence) {
    const now = new Date();
    const dateStr = now.toLocaleDateString();
    const timeStr = now.toLocaleTimeString();
    
    // Parse label (Name (Roll))
    const parts = labeledMatch.match(/(.+) \((.+)\)/);
    const name = parts ? parts[1] : labeledMatch;
    const roll = parts ? parts[2] : "N/A";

    // Debounce: Only log once every 5 minutes for the same user
    const logKey = `${name}-${roll}`;
    const lastLog = lastRecognitionTime[logKey];
    
    if (lastLog && (now - lastLog) < 300000) { // 5 minutes in ms
        return;
    }

    // 2. Prevent Double Entry in Same Day
    const isAlreadyLoggedToday = attendanceLogs.some(log => 
        log.name === name && log.roll === roll && log.date === dateStr
    );

    if (isAlreadyLoggedToday) {
        console.log(`Skipping log for ${name}: Already marked today.`);
        return;
    }

    const logEntry = { name, roll, date: dateStr, time: timeStr, confidence: (confidence * 100).toFixed(1) + '%' };
    attendanceLogs.unshift(logEntry); // Add to beginning
    localStorage.setItem('attendanceLogs', JSON.stringify(attendanceLogs));
    
    lastRecognitionTime[logKey] = now;
    renderLogs();
    updateStats();
}

/**
 * UI Utilities
 */
function renderLogs() {
    ATTENDANCE_LIST.innerHTML = '';
    attendanceLogs.forEach(log => {
        const row = `
            <tr>
                <td>${log.name}</td>
                <td>${log.roll}</td>
                <td>${log.date}</td>
                <td>${log.time}</td>
                <td><span class="badge badge-success">${log.confidence}</span></td>
            </tr>
        `;
        ATTENDANCE_LIST.innerHTML += row;
    });
}

function updateStats() {
    COUNT_ENROLLED.innerText = enrolledUsers.length;
    COUNT_LOGS.innerText = attendanceLogs.length;
}

function exportToCSV() {
    if (attendanceLogs.length === 0) {
        alert("No logs to export!");
        return;
    }

    let csvContent = "data:text/csv;charset=utf-8,Name,Roll ID,Date,Time,Confidence\n";
    attendanceLogs.forEach(log => {
        csvContent += `${log.name},${log.roll},${log.date},${log.time},${log.confidence}\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `attendance_report_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Event Listeners
document.getElementById('toggle-webcam').addEventListener('click', () => {
    if (isWebcamRunning) {
        location.reload(); // Simple way to stop webcam and reset overlay
    } else {
        startWebcam();
    }
});

document.getElementById('enrollment-form').addEventListener('submit', enrollUser);
document.getElementById('export-csv').addEventListener('click', exportToCSV);
document.getElementById('clear-data').addEventListener('click', () => {
    if (confirm("Are you sure you want to clear all enrolled users and attendance logs? This cannot be undone.")) {
        localStorage.clear();
        location.reload();
    }
});

// Bootstrap
window.onload = loadModels;
