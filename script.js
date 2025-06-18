// This file contains JavaScript code that handles button click events and navigation logic for the subject pages.

document.addEventListener('DOMContentLoaded', function() {
    const buttons = document.querySelectorAll('.subject-button');

    buttons.forEach(button => {
        button.addEventListener('click', function() {
            const subjectPage = this.getAttribute('data-subject');
            window.location.href = `subjects/${subjectPage}.html`;
        });
    });
});