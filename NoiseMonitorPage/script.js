const modeSelectorBtn = document.getElementById('modeSelectorBtn');
const statusDiv = document.getElementById('status');
const levelDiv = document.getElementById('level');
const countdownDisplay = document.getElementById('countdown');
const timerControls = document.getElementById('timerControls');
const sensitivitySlider = document.getElementById('sensitivity');
const sensitivityValue = document.getElementById('sensitivityValue');
const modeOverlay = document.getElementById('modeOverlay');
const timerOverlay = document.getElementById('timerOverlay');
const countdownInput = document.getElementById('countdownInput');
const confirmTimerBtn = document.getElementById('confirmTimerBtn');
const pauseBtn = document.getElementById('pauseBtn');
const restartBtn = document.getElementById('restartBtn');
const resetBtn = document.getElementById('resetBtn');
const modeCards = document.querySelectorAll('.mode-card');

let audioContext;
let analyser;
let microphone;
let isMonitoring = false;
let animationId;
let maxVolume = 0;
let countdownInterval;
let remainingTime = 0;
let originalTime = 0;
let isCounting = false;
let isPaused = false;
let mode = null; // No default mode; user must select

// Baseline thresholds (from Noise Ninja, adjusted dynamically)
const BASELINE_QUIET = 30;
const BASELINE_WARNING = 60;
const BASELINE_LOUD = 90;

// Current thresholds (will be adjusted by sensitivity)
let QUIET_THRESHOLD = BASELINE_QUIET;
let WARNING_THRESHOLD = BASELINE_WARNING;
let LOUD_THRESHOLD = BASELINE_LOUD;

// Initialize
document.body.className = 'waiting';
statusDiv.textContent = 'Select a mode to start monitoring';
modeOverlay.style.display = 'flex'; // Show mode selection overlay on page load
timerOverlay.style.display = 'none'; // Ensure timer overlay is hidden

// Mode Selector Button
modeSelectorBtn.addEventListener('click', () => {
    stopMonitoring();
    clearInterval(countdownInterval);
    remainingTime = 0;
    isCounting = false;
    isPaused = false;
    updateCountdownDisplay();
    countdownDisplay.style.display = 'none';
    timerControls.style.display = 'none';
    modeOverlay.style.display = 'flex';
    timerOverlay.style.display = 'none'; // Ensure timer overlay is hidden
});

// Mode Selection via Overlay Cards
modeCards.forEach(card => {
    card.addEventListener('click', () => {
        const selectedMode = card.getAttribute('data-mode');
        mode = selectedMode;
        modeOverlay.style.display = 'none';

        if (mode === 'continuous') {
            timerControls.style.display = 'flex';
            countdownDisplay.style.display = 'none';
            resetState();
        } else {
            timerOverlay.style.display = 'flex';
        }
    });
});

// Confirm Timer
confirmTimerBtn.addEventListener('click', () => {
    const seconds = parseInt(countdownInput.value);
    if (seconds < 5 || seconds > 300 || isNaN(seconds)) {
        alert('Please enter a value between 5 and 300 seconds');
        return;
    }
    timerOverlay.style.display = 'none';
    remainingTime = seconds;
    originalTime = seconds;
    updateCountdownDisplay();
    countdownDisplay.style.display = 'block';
    timerControls.style.display = 'flex';
    startMonitoring(); // Start monitoring immediately
    startCountdown(); // Start the timer immediately
    pauseBtn.querySelector('svg').innerHTML = `
        <rect x="6" y="4" width="4" height="16"></rect>
        <rect x="14" y="4" width="4" height="16"></rect>
    `;
    pauseBtn.setAttribute('title', 'Pause Monitoring');
});

// Play/Pause Button (Start/Stop Monitoring)
pauseBtn.addEventListener('click', () => {
    if (!isMonitoring) {
        // Start monitoring
        startMonitoring();
        if (mode === 'challenge') {
            if (remainingTime > 0) {
                startCountdown();
            }
        }
        pauseBtn.querySelector('svg').innerHTML = `
            <rect x="6" y="4" width="4" height="16"></rect>
            <rect x="14" y="4" width="4" height="16"></rect>
        `;
        pauseBtn.setAttribute('title', 'Pause Monitoring');
    } else if (mode === 'continuous') {
        // Stop monitoring for Continuous Mode
        stopMonitoring();
        pauseBtn.querySelector('svg').innerHTML = `
            <polygon points="5 4 19 12 5 20 5 4"></polygon>
        `;
        pauseBtn.setAttribute('title', 'Start Monitoring');
    } else if (mode === 'challenge') {
        // Pause/Resume for Challenge Mode
        if (isCounting) {
            clearInterval(countdownInterval);
            isCounting = false;
            isPaused = true;
            pauseBtn.querySelector('svg').innerHTML = `
                <polygon points="5 4 19 12 5 20 5 4"></polygon>
            `;
            pauseBtn.setAttribute('title', 'Resume Monitoring');
        } else {
            startCountdown();
            isPaused = false;
            pauseBtn.querySelector('svg').innerHTML = `
                <rect x="6" y="4" width="4" height="16"></rect>
                <rect x="14" y="4" width="4" height="16"></rect>
            `;
            pauseBtn.setAttribute('title', 'Pause Monitoring');
        }
    }
});

// Restart Button
restartBtn.addEventListener('click', () => {
    if (mode === 'challenge' && originalTime > 0) {
        clearInterval(countdownInterval);
        remainingTime = originalTime;
        updateCountdownDisplay();
        if (isMonitoring && !isPaused) {
            startCountdown();
        } else {
            isCounting = false;
            isPaused = true;
            pauseBtn.querySelector('svg').innerHTML = `
                <polygon points="5 4 19 12 5 20 5 4"></polygon>
            `;
            pauseBtn.setAttribute('title', 'Resume Monitoring');
        }
    }
});

// Reset Button
resetBtn.addEventListener('click', () => {
    stopMonitoring();
    clearInterval(countdownInterval);
    remainingTime = 0;
    isCounting = false;
    isPaused = false;
    updateCountdownDisplay();
    if (mode === 'challenge') {
        timerOverlay.style.display = 'flex';
        countdownDisplay.style.display = 'block';
    } else {
        countdownDisplay.style.display = 'none';
    }
    pauseBtn.querySelector('svg').innerHTML = `
        <polygon points="5 4 19 12 5 20 5 4"></polygon>
    `;
    pauseBtn.setAttribute('title', 'Start Monitoring');
});

// Sensitivity control (from Noise Ninja)
sensitivitySlider.addEventListener('input', () => {
    const sensitivity = parseInt(sensitivitySlider.value);
    sensitivityValue.textContent = `${sensitivity}%`;
    
    // Adjust thresholds based on sensitivity
    const sensitivityFactor = (sensitivity - 50) / 50; // ranges from -1 to 1
    QUIET_THRESHOLD = BASELINE_QUIET * (1 - sensitivityFactor * 0.6);
    WARNING_THRESHOLD = BASELINE_WARNING * (1 - sensitivityFactor * 0.4);
    LOUD_THRESHOLD = BASELINE_LOUD * (1 - sensitivityFactor * 0.2);
});

async function startMonitoring() {
    try {
        if (isMonitoring) return;

        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        analyser = audioContext.createAnalyser();
        analyser.fftSize = 64;
        analyser.smoothingTimeConstant = 0.8;

        const stream = await navigator.mediaDevices.getUserMedia({ 
            audio: {
                noiseSuppression: false,
                echoCancellation: false,
                autoGainControl: false
            }
        });
        microphone = audioContext.createMediaStreamSource(stream);
        microphone.connect(analyser);

        isMonitoring = true;
        updateMeter();
    } catch (err) {
        statusDiv.textContent = 'Microphone access denied';
        isMonitoring = false;
    }
}

function stopMonitoring() {
    if (microphone) microphone.disconnect();
    if (audioContext) audioContext.close();
    cancelAnimationFrame(animationId);
    isMonitoring = false;
    document.body.className = 'waiting';
    statusDiv.textContent = 'Monitoring stopped. Start again or switch modes.';
}

function resetState() {
    stopMonitoring();
    clearInterval(countdownInterval);
    remainingTime = 0;
    updateCountdownDisplay();
    isCounting = false;
    isPaused = false;
    pauseBtn.querySelector('svg').innerHTML = `
        <polygon points="5 4 19 12 5 20 5 4"></polygon>
    `;
    pauseBtn.setAttribute('title', 'Start Monitoring');
}

function getVolume() {
    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(dataArray);
    let sum = dataArray.reduce((a, b) => a + b, 0);
    return sum / dataArray.length;
}

function updateMeter() {
    if (!isMonitoring) return;

    const volume = getVolume();
    maxVolume = Math.max(maxVolume, volume);

    const displayLevel = Math.min(100, (volume / LOUD_THRESHOLD) * 100);
    levelDiv.textContent = `Volume: ${displayLevel.toFixed(0)}%`;

    if (displayLevel < WARNING_THRESHOLD) {
        document.body.className = 'quiet';
        statusDiv.textContent = mode === 'continuous' ? 'Good volume!' : (isCounting ? 'Timer running - Stay quiet!' : (isPaused ? 'Timer paused - Stay quiet!' : 'Volume is good!'));
    } else if (displayLevel < LOUD_THRESHOLD) {
        document.body.className = 'warning';
        statusDiv.textContent = mode === 'continuous' ? 'Getting too loud!' : (isCounting ? 'Timer running - Getting loud!' : (isPaused ? 'Timer paused - Getting loud!' : 'Getting too loud!'));
    } else {
        document.body.className = 'loud';
        statusDiv.textContent = mode === 'continuous' ? 'TOO LOUD! Quiet down!' : (isCounting ? 'Timer running - TOO LOUD!' : (isPaused ? 'Timer paused - TOO LOUD!' : 'WAY TOO LOUD!'));
    }

    setTimeout(() => {
        animationId = requestAnimationFrame(updateMeter);
    }, 100);
}

function updateCountdownDisplay() {
    const minutes = Math.floor(remainingTime / 60);
    const seconds = remainingTime % 60;
    countdownDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

function startCountdown() {
    clearInterval(countdownInterval);
    isCounting = true;
    isPaused = false;
    countdownInterval = setInterval(() => {
        if (remainingTime > 0) {
            if (document.body.className !== 'quiet') {
                remainingTime--;
                updateCountdownDisplay();
            }

            if (remainingTime <= 0) {
                clearInterval(countdownInterval);
                statusDiv.textContent = "Time's up! Challenge complete!";
                isCounting = false;
                isPaused = true;
                pauseBtn.querySelector('svg').innerHTML = `
                    <polygon points="5 4 19 12 5 20 5 4"></polygon>
                `;
                pauseBtn.setAttribute('title', 'Resume Monitoring');
            }
        }
    }, 1000);
}