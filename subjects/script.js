let currentQuestionIndex = 0;
let userAnswers = Array(questions.length).fill(null); // null = unanswered/skip

// Get DOM elements
const quizSection = document.getElementById('quiz-section');
const resultSection = document.getElementById('result-section');
const questionText = document.getElementById('question-text');
const optionsContainer = document.getElementById('options-container');
const scoreDisplay = document.getElementById('score-display');
const correctCountDisplay = document.getElementById('correct-count');
const wrongCountDisplay = document.getElementById('wrong-count');
const accuracyDisplay = document.getElementById('accuracy-display');
const restartButton = document.getElementById('restart-btn');
const messageBox = document.getElementById('message-box');
const messageText = document.getElementById('message-text');
const messageOkButton = document.getElementById('message-ok-btn');
const prevBtn = document.getElementById('prev-btn');
const skipBtn = document.getElementById('skip-btn');
const submitBtn = document.getElementById('submit-btn');

let autoNextTimeout = null;
let autoNextInterval = null;

/**
 * Loads and displays the current question.
 * Sets up change listeners for radio buttons.
 */
function loadQuestion() {
    if (!questions || questions.length === 0) {
        showMessageBox("No questions found for this subject. Please check the HTML file.");
        return;
    }
    if (autoNextTimeout) {
        clearTimeout(autoNextTimeout);
        autoNextTimeout = null;
    }
    if (autoNextInterval) {
        clearInterval(autoNextInterval);
        autoNextInterval = null;
    }

    optionsContainer.innerHTML = '';
    const q = questions[currentQuestionIndex];

    // Remove any previous badge
    let badgeHTML = '';
    const answered = userAnswers[currentQuestionIndex] !== null;
    if (answered) {
        if (userAnswers[currentQuestionIndex] === q.correct) {
            badgeHTML = `<span class="answer-badge correct">Correct</span>`;
        } else {
            badgeHTML = `<span class="answer-badge wrong">Wrong</span>`;
        }
    }
    questionText.innerHTML = `${currentQuestionIndex + 1}. ${q.question} ${badgeHTML}`;

    q.options.forEach((option, idx) => {
        const label = document.createElement('label');
        label.className = 'option-label rounded-lg flex items-center cursor-pointer p-2 transition-colors';
        label.style.marginBottom = '0.5rem';

        // Remove hover effect if answered
        if (!answered) {
            label.classList.add('hover:bg-indigo-100');
        }

        // Add feedback classes
        if (answered) {
            if (idx === q.correct) {
                label.classList.add('correct-answer');
            }
            if (
                idx === userAnswers[currentQuestionIndex] &&
                userAnswers[currentQuestionIndex] !== q.correct
            ) {
                label.classList.add('wrong-answer');
            }
        }

        label.innerHTML = `
            <input type="radio" name="answer" value="${idx}" class="form-radio text-indigo-600" ${answered ? 'disabled' : ''}>
            <span class="ml-3">${option}</span>
        `;
        const radioInput = label.querySelector('input[type="radio"]');
        radioInput.checked = userAnswers[currentQuestionIndex] === idx;

        if (!answered) {
            radioInput.addEventListener('change', () => {
                userAnswers[currentQuestionIndex] = idx;
                loadQuestion();

                // Hide skip button and show styled timer message
                skipBtn.style.display = 'none';
                let seconds = 3;
                skipBtn.insertAdjacentHTML(
                    'afterend',
                    `<span id="auto-next-timer" class="ml-3 px-3 py-1 rounded-lg bg-indigo-100 text-indigo-700 font-semibold transition-all duration-300">
                        Next question in <span id="timer-seconds">${seconds}</span> seconds...
                    </span>`
                );
                const timerSpan = document.getElementById('auto-next-timer');
                const timerSeconds = document.getElementById('timer-seconds');
                autoNextInterval = setInterval(() => {
                    seconds--;
                    if (seconds > 0) {
                        timerSeconds.textContent = seconds;
                    } else {
                        clearInterval(autoNextInterval);
                        autoNextInterval = null;
                    }
                }, 1000);

                autoNextTimeout = setTimeout(() => {
                    if (timerSpan) timerSpan.remove();
                    skipBtn.style.display = '';
                    if (currentQuestionIndex < questions.length - 1) {
                        currentQuestionIndex++;
                        loadQuestion();
                    }
                }, 3000);
            });
        }
        optionsContainer.appendChild(label);
    });

    // Remove timer if present and show skip button if not answering
    if (!answered) {
        const timerSpan = document.getElementById('auto-next-timer');
        if (timerSpan) timerSpan.remove();
        skipBtn.style.display = '';
    }

    prevBtn.disabled = currentQuestionIndex === 0;
}

/**
 * Shows a custom message box instead of `alert()`.
 * @param {string} message - The message to display.
 */
function showMessageBox(message, callback) {
    messageText.textContent = message;
    messageBox.classList.remove('hidden');
    messageOkButton.onclick = function () {
        messageBox.classList.add('hidden');
        if (callback) callback();
    };
}

/**
 * Displays the final score and results.
 */
function showResults() {
    quizSection.classList.add('hidden');
    resultSection.classList.remove('hidden');

    // Hide navigation and submit buttons after submission
    prevBtn.style.display = 'none';
    skipBtn.style.display = 'none';
    submitBtn.style.display = 'none';

    let score = 0, correct = 0, wrong = 0, attempted = 0;
    userAnswers.forEach((ans, i) => {
        if (ans !== null) {
            attempted++;
            if (ans === questions[i].correct) {
                correct++;
                score += 1;
            } else {
                wrong++;
                score -= 0.25;
            }
        }
    });
    scoreDisplay.textContent = score.toFixed(2);
    correctCountDisplay.textContent = correct;
    wrongCountDisplay.textContent = wrong;
    let accuracy = attempted > 0 ? (correct / attempted) * 100 : 0;
    accuracyDisplay.textContent = `${accuracy.toFixed(2)}%`;
}

/**
 * Resets the quiz to its initial state.
 */
function restartQuiz() {
    currentQuestionIndex = 0;
    userAnswers = Array(questions.length).fill(null);
    resultSection.classList.add('hidden');
    quizSection.classList.remove('hidden');
    prevBtn.style.display = '';
    skipBtn.style.display = '';
    submitBtn.style.display = '';
    loadQuestion();
}

// Event Listeners
prevBtn.onclick = function () {
    if (currentQuestionIndex > 0) {
        currentQuestionIndex--;
        loadQuestion();
    }
};

skipBtn.onclick = function () {
    userAnswers[currentQuestionIndex] = null; // Mark as skipped
    if (currentQuestionIndex < questions.length - 1) {
        currentQuestionIndex++;
        loadQuestion();
    }
};

submitBtn.onclick = function () {
    // Show warning before submit
    showMessageBox(
        "Are you sure you want to submit the exam? Unanswered questions will be marked as skipped.",
        () => {
            showResults();
        }
    );
};

restartButton.addEventListener('click', restartQuiz);

// Initial load of the first question when the page loads
document.addEventListener('DOMContentLoaded', loadQuestion);
