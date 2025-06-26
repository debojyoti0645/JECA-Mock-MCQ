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
const nextBtn = document.getElementById('next-btn');
const skipBtn = document.getElementById('skip-btn');
const submitBtn = document.getElementById('submit-btn');

/**
 * Shows a custom message box instead of `alert()`.
 * @param {string} message - The message to display.
 */
function showMessageBox(message, callback) {
    messageText.textContent = message;
    messageBox.classList.remove('hidden');
    messageOkButton.onclick = function() {
        messageBox.classList.add('hidden');
        if (callback) callback();
    };
}

/**
 * Loads and displays the current question.
 * Sets up change listeners for radio buttons.
 */
function loadQuestion() {
    // Check if questions array is defined and not empty
    if (!questions || questions.length === 0) {
        showMessageBox("No questions found for this subject. Please check the HTML file.");
        return;
    }

    // Clear previous options
    optionsContainer.innerHTML = '';
    // Get the current question object
    const q = questions[currentQuestionIndex];

    // Update question text
    questionText.textContent = `${currentQuestionIndex + 1}. ${q.question}`;

    // Create and append options with change listeners
    q.options.forEach((option, idx) => {
        const label = document.createElement('label');
        label.classList.add('option-label', 'rounded-lg', 'flex', 'items-center', 'cursor-pointer'); // Tailwind classes
        label.innerHTML = `
            <input type="radio" name="answer" value="${idx}" class="form-radio text-indigo-600">
            <span class="ml-3 text-gray-700">${option}</span>
        `;
        const radioInput = label.querySelector('input[type="radio"]');
        radioInput.checked = userAnswers[currentQuestionIndex] === idx;
        radioInput.disabled = false;
        // Attach change listener to update userAnswers array
        radioInput.addEventListener('change', () => {
            userAnswers[currentQuestionIndex] = idx;
        });
        optionsContainer.appendChild(label);
    });

    // Highlight selected answer if any
    // Disable prev if at first, next if at last
    prevBtn.disabled = currentQuestionIndex === 0;
    nextBtn.disabled = currentQuestionIndex === questions.length - 1;
}

/**
 * Displays the final score and results.
 */
function showResults() {
    quizSection.classList.add('hidden');
    resultSection.classList.remove('hidden');

    // Hide navigation and submit buttons after submission
    prevBtn.style.display = 'none';
    nextBtn.style.display = 'none';
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
    loadQuestion();
}

// Event Listeners
prevBtn.onclick = function() {
    if (currentQuestionIndex > 0) {
        currentQuestionIndex--;
        loadQuestion();
    }
};

nextBtn.onclick = function() {
    if (currentQuestionIndex < questions.length - 1) {
        currentQuestionIndex++;
        loadQuestion();
    }
};

skipBtn.onclick = function() {
    userAnswers[currentQuestionIndex] = null; // Mark as skipped
    if (currentQuestionIndex < questions.length - 1) {
        currentQuestionIndex++;
        loadQuestion();
    }
};

submitBtn.onclick = function() {
    // Show warning before submit
    showMessageBox("Are you sure you want to submit the exam? Unanswered questions will be marked as skipped.", () => {
        showResults();
    });
};

restartButton.addEventListener('click', restartQuiz);

// Initial load of the first question when the page loads
// Ensure the DOM is fully loaded before attempting to run loadQuestion
document.addEventListener('DOMContentLoaded', loadQuestion);
