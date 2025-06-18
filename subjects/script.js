
let currentQuestionIndex = 0;
let score = 0;
let correctAnswersCount = 0;
let wrongAnswersCount = 0;

// Get DOM elements
const quizSection = document.getElementById('quiz-section');
const resultSection = document.getElementById('result-section');
const questionText = document.getElementById('question-text');
const optionsContainer = document.getElementById('options-container');
const scoreDisplay = document.getElementById('score-display');
// const totalQuestionsDisplay = document.getElementById('total-questions'); // Removed as total is derived from questions.length
const correctCountDisplay = document.getElementById('correct-count');
const wrongCountDisplay = document.getElementById('wrong-count');
const accuracyDisplay = document.getElementById('accuracy-display');
const restartButton = document.getElementById('restart-btn');
const messageBox = document.getElementById('message-box');
const messageText = document.getElementById('message-text');
const messageOkButton = document.getElementById('message-ok-btn');

/**
 * Shows a custom message box instead of `alert()`.
 * @param {string} message - The message to display.
 */
function showMessageBox(message) {
    messageText.textContent = message;
    messageBox.classList.remove('hidden');
}

/**
 * Hides the custom message box.
 */
function hideMessageBox() {
    messageBox.classList.add('hidden');
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
    const currentQuestion = questions[currentQuestionIndex];

    // Update question text
    questionText.textContent = `${currentQuestionIndex + 1}. ${currentQuestion.question}`;

    // Create and append options with change listeners
    currentQuestion.options.forEach((option, index) => {
        const label = document.createElement('label');
        label.classList.add('option-label', 'rounded-lg', 'flex', 'items-center', 'cursor-pointer'); // Tailwind classes
        label.innerHTML = `
            <input type="radio" name="answer" value="${index}" class="form-radio text-indigo-600">
            <span class="ml-3 text-gray-700">${option}</span>
        `;
        const radioInput = label.querySelector('input[type="radio"]');
        // Attach change listener to trigger checkAnswer when an option is selected
        radioInput.addEventListener('change', (event) => checkAnswer(event.target));
        optionsContainer.appendChild(label);
    });
}

/**
 * Checks the selected answer, updates score and counts, provides visual feedback,
 * and moves to the next question or finishes the quiz.
 * This function is now triggered by the 'change' event of radio buttons.
 * @param {HTMLInputElement} selectedRadio - The radio button element that was selected.
 */
function checkAnswer(selectedRadio) {
    const selectedAnswerIndex = parseInt(selectedRadio.value);
    const currentQuestion = questions[currentQuestionIndex];
    const correctAnswerIndex = currentQuestion.correct;

    // Disable all radio buttons for the current question to prevent re-selection
    const allRadios = optionsContainer.querySelectorAll('input[type="radio"]');
    allRadios.forEach(radio => radio.disabled = true);

    // Provide visual feedback for correct/incorrect
    const allLabels = optionsContainer.querySelectorAll('.option-label');
    allLabels.forEach((label, index) => {
        // Always highlight the correct answer in green
        if (index === correctAnswerIndex) {
            label.classList.add('correct-answer');
            label.classList.remove('bg-e5e7eb', 'hover:bg-d1d5db'); // Remove default backgrounds
        }
        // Highlight the selected answer in red if it's wrong
        if (index === selectedAnswerIndex && selectedAnswerIndex !== correctAnswerIndex) {
            label.classList.add('wrong-answer');
            label.classList.remove('bg-e5e7eb', 'hover:bg-d1d5db'); // Remove default backgrounds
        }
    });

    // Update score and counts
    if (selectedAnswerIndex === correctAnswerIndex) {
        score += 1; // +1 for correct answer
        correctAnswersCount++;
    } else {
        score -= 0.25; // -0.25 for wrong answer
        wrongAnswersCount++;
    }

    // Briefly show feedback, then move to next question or results
    setTimeout(() => {
        currentQuestionIndex++;
        if (currentQuestionIndex < questions.length) {
            loadQuestion();
        } else {
            showResults();
        }
    }, 1000); // 1-second delay to show feedback
}

/**
 * Displays the final score and results.
 */
function showResults() {
    quizSection.classList.add('hidden');
    resultSection.classList.remove('hidden');
    
    scoreDisplay.textContent = score.toFixed(2); // Display score with 2 decimal places
    correctCountDisplay.textContent = correctAnswersCount;
    wrongCountDisplay.textContent = wrongAnswersCount;

    const totalQuestionsAttempted = correctAnswersCount + wrongAnswersCount;
    let accuracy = 0;
    if (totalQuestionsAttempted > 0) {
        accuracy = (correctAnswersCount / totalQuestionsAttempted) * 100;
    }
    accuracyDisplay.textContent = `${accuracy.toFixed(2)}%`; // Display accuracy with 2 decimal places
}

/**
 * Resets the quiz to its initial state.
 */
function restartQuiz() {
    currentQuestionIndex = 0;
    score = 0;
    correctAnswersCount = 0;
    wrongAnswersCount = 0;
    resultSection.classList.add('hidden');
    quizSection.classList.remove('hidden');
    loadQuestion();
}

// Event Listener for the restart button and message box OK button
restartButton.addEventListener('click', restartQuiz);
messageOkButton.addEventListener('click', hideMessageBox);

// Initial load of the first question when the page loads
// Ensure the DOM is fully loaded before attempting to run loadQuestion
document.addEventListener('DOMContentLoaded', loadQuestion);
