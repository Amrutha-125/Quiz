let currentUser = null;
let selectedRole = null;

// Show login form based on selected role
function showLoginForm(role) {
    selectedRole = role;
    document.getElementById('role-selection').classList.add('hidden');
    document.getElementById('login-form').classList.remove('hidden');
    document.getElementById('login-title').innerText = `${role.charAt(0).toUpperCase() + role.slice(1)} Login`;
}

// Go back to role selection
function goBackToRoleSelection() {
    document.getElementById('login-form').classList.add('hidden');
    document.getElementById('role-selection').classList.remove('hidden');
    // Clear login form fields
    document.getElementById('username').value = '';
    document.getElementById('password').value = '';
}

// Login function
async function login() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    if (!username || !password) {
        alert('Username and password are required!');
        return;
    }

    console.log('Login Data:', { username, password, role: selectedRole });

    try {
        const response = await fetch('/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password, role: selectedRole })
        });

        const data = await response.json();
        console.log('Login Response:', data);

        if (data.success) {
            currentUser = data.user;
            showDashboard(data.user.role);
        } else {
            alert('Login failed: ' + data.message);
        }
    } catch (error) {
        console.error('Login Error:', error);
        alert('Login failed due to a network error');
    }
}

// Show dashboard based on user role
function showDashboard(role) {
    document.getElementById('login-form').classList.add('hidden');
    document.getElementById('admin-dashboard').classList.add('hidden');
    document.getElementById('teacher-dashboard').classList.add('hidden');
    document.getElementById('student-dashboard').classList.add('hidden');
    document.getElementById(`${role}-dashboard`).classList.remove('hidden');
}

// Logout function
function logout() {
    fetch('/auth/logout', { method: 'POST' })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                currentUser = null;
                // Hide all dashboards
                document.getElementById('admin-dashboard').classList.add('hidden');
                document.getElementById('teacher-dashboard').classList.add('hidden');
                document.getElementById('student-dashboard').classList.add('hidden');
                // Show role selection screen
                document.getElementById('role-selection').classList.remove('hidden');
                alert('Logged out successfully');
            } else {
                alert('Logout failed: ' + data.message);
            }
        })
        .catch(error => {
            console.error('Logout Error:', error);
            alert('Logout failed');
        });
}

// Function to view all users
// Function to view all users
async function viewUsers() {
    try {
        const response = await fetch('/admin/users');
        const users = await response.json();
        console.log('Users:', users);

        // Display users in the UI
        const userList = users.map(user => `
            <li>
                <p>ID: ${user.id}, Username: ${user.username}, Role: ${user.role}</p>
            </li>
        `).join('');

        document.getElementById('users').innerHTML = userList;

        // Hide the Admin Dashboard buttons and show the user list
        document.getElementById('view-users-btn').classList.add('hidden');
        document.getElementById('add-user-btn').classList.add('hidden');
        document.getElementById('logout-btn').classList.add('hidden');
        document.getElementById('user-list').classList.remove('hidden'); // Show user list
    } catch (error) {
        console.error('Error fetching users:', error);
        alert('Failed to fetch users');
    }
}

// Function to go back to the Admin Dashboard
function goBackToDashboard() {
    // Hide the user list and show the Admin Dashboard buttons
    document.getElementById('user-list').classList.add('hidden');
    document.getElementById('view-users-btn').classList.remove('hidden');
    document.getElementById('add-user-btn').classList.remove('hidden');
    document.getElementById('logout-btn').classList.remove('hidden');
}

// Attach event listeners
document.getElementById('view-users-btn').addEventListener('click', viewUsers);
document.getElementById('back-to-dashboard-btn').addEventListener('click', goBackToDashboard);
// Function to add a new user
async function addUser() {
    const username = prompt('Enter username:');
    const password = prompt('Enter password:');
    const role = prompt('Enter role (admin/teacher/student):');

    if (username && password && role) {
        try {
            const response = await fetch('/admin/add-user', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password, role })
            });
            const result = await response.json();
            console.log('Add User Result:', result);
            alert(result.message);
        } catch (error) {
            console.error('Error adding user:', error);
            alert('Failed to add user');
        }
    } else {
        alert('All fields are required!');
    }
}

// Function to show the quiz creation form
function showQuizCreationForm() {
    // Hide the teacher dashboard and show the quiz creation form
    document.getElementById('teacher-dashboard').classList.add('hidden');
    document.getElementById('quiz-creation-form').classList.remove('hidden');
}

// Function to add a new question
function addQuestion() {
    const questionContainer = document.createElement('div');
    questionContainer.className = 'question';

    // Add question text
    const questionText = document.createElement('input');
    questionText.type = 'text';
    questionText.placeholder = 'Question Text';
    questionContainer.appendChild(questionText);

    // Add question type dropdown
    const questionType = document.createElement('select');
    questionType.innerHTML = `
        <option value="MCQ">MCQ</option>
        <option value="ShortAnswer">Short Answer</option>
        <option value="TrueFalse">True/False</option>
    `;
    questionContainer.appendChild(questionType);

    // Add options container (initially hidden)
    const optionsContainer = document.createElement('div');
    optionsContainer.className = 'options-container';
    optionsContainer.style.display = 'none'; // Hide by default

    // Add options for MCQ
    ['A', 'B', 'C', 'D'].forEach(option => {
        const optionInput = document.createElement('input');
        optionInput.type = 'text';
        optionInput.placeholder = `Option ${option}`;
        optionsContainer.appendChild(optionInput);
    });

    // Add correct option input
    const correctOption = document.createElement('input');
    correctOption.type = 'text';
    correctOption.placeholder = 'Correct Option (A, B, C, or D)';
    optionsContainer.appendChild(correctOption);

    // Show/hide options based on question type
    questionType.addEventListener('change', () => {
        if (questionType.value === 'MCQ') {
            optionsContainer.style.display = 'block';
            correctOption.placeholder = 'Correct Option (A, B, C, or D)';
        } else {
            optionsContainer.style.display = 'none';
            if (questionType.value === 'TrueFalse') {
                correctOption.placeholder = 'Correct Option (True or False)';
            } else if (questionType.value === 'ShortAnswer') {
                correctOption.placeholder = 'Correct Answer';
            }
        }
    });

    questionContainer.appendChild(optionsContainer);
    document.getElementById('questions-container').appendChild(questionContainer);
}

function collectCorrectOption(questionContainer) {
    const correctOptionInput = questionContainer.querySelector('input[name="correct-option"]').value;
    const options = ['A', 'B', 'C', 'D'];
    const optionValues = Array.from(questionContainer.querySelectorAll('input[type="text"]')).map(input => input.value);

    const correctOptionLabel = options.find((label, index) => {
        return optionValues[index] === correctOptionInput;
    });

    if (!correctOptionLabel) {
        throw new Error('Correct option must match one of the provided options (A, B, C, or D)!');
    }

    return correctOptionLabel;
}
// Function to submit the quiz
async function submitQuiz() {
    const title = document.getElementById('quiz-title').value;
    const startDate = document.getElementById('quiz-start-date').value;
    const endDate = document.getElementById('quiz-end-date').value;

    if (!title || !startDate || !endDate) {
        alert('Quiz title, start date, and end date are required!');
        return;
    }

    const questions = [];
    const questionContainers = document.querySelectorAll('.question');

    questionContainers.forEach(container => {
        const questionText = container.querySelector('input[type="text"]').value;
        const questionType = container.querySelector('select').value;
        const optionsContainer = container.querySelector('.options-container');
        const correctOption = optionsContainer.querySelector('input[type="text"]').value;

        const question = {
            text: questionText,
            type: questionType,
            optionA: '',
            optionB: '',
            optionC: '',
            optionD: '',
            correctOption: correctOption
        };

        if (questionType === 'MCQ') {
            const options = optionsContainer.querySelectorAll('input[type="text"]');
            question.optionA = options[0].value;
            question.optionB = options[1].value;
            question.optionC = options[2].value;
            question.optionD = options[3].value;
        }

        questions.push(question);
    });

    try {
        const response = await fetch('/teacher/create-quiz', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, startDate, endDate, questions })
        });

        const result = await response.json();
        console.log('Quiz Creation Result:', result);
        alert(result.message);

        // Clear the quiz creation form
        document.getElementById('quiz-title').value = '';
        document.getElementById('quiz-start-date').value = '';
        document.getElementById('quiz-end-date').value = '';
        document.getElementById('questions-container').innerHTML = '';

        // Go back to the teacher dashboard
        document.getElementById('quiz-creation-form').classList.add('hidden');
        document.getElementById('teacher-dashboard').classList.remove('hidden');
    } catch (error) {
        console.error('Error creating quiz:', error);
        alert('Failed to create quiz');
    }
}

// Function to view scores for a specific quiz
// Function to view scores for a specific quiz
// Function to view scores for a specific quiz
async function viewScores() {
    const quizId = prompt('Enter quiz ID:');

    if (quizId) {
        try {
            const response = await fetch(`/teacher/scores/${quizId}`);
            const scores = await response.json();
            console.log('Scores:', scores);

            // Display scores in the UI
            const scoreList = scores.map(score => `
                <div>
                    <p>Student: ${score.username}, Score: ${score.score}</p>
                </div>
            `).join('');

            document.getElementById('teacher-dashboard').innerHTML = scoreList; // Clear previous content and display new list
        } catch (error) {
            console.error('Error fetching scores:', error);
            alert('Failed to fetch scores');
        }
    } else {
        alert('Quiz ID is required!');
    }
}
// Function to view available quizzes
// Function to view available quizzes
async function viewQuizzes() {
    try {
        const response = await fetch('/student/quizzes');
        if (!response.ok) {
            throw new Error('Failed to fetch quizzes');
        }
        const quizzes = await response.json();
        console.log('Quizzes:', quizzes);

        // Display quizzes in the UI
        const quizzesList = document.getElementById('quizzes');
        quizzesList.innerHTML = ''; // Clear previous content

        quizzes.forEach(quiz => {
            const quizItem = document.createElement('li');
            quizItem.innerHTML = `
                <strong>${quiz.title}</strong>
                <p>Start: ${new Date(quiz.start_date).toLocaleString()}</p>
                <p>End: ${new Date(quiz.end_date).toLocaleString()}</p>
                <button onclick="attemptQuiz(${quiz.id})">Attempt Quiz</button>
            `;
            quizzesList.appendChild(quizItem);
        });

        document.getElementById('quizzes-list').classList.remove('hidden');
    } catch (error) {
        console.error('Error fetching quizzes:', error);
        alert('Failed to fetch quizzes: ' + error.message);
    }
}

// Add event listener for the "View Quizzes" button
document.getElementById('view-quizzes-btn')?.addEventListener('click', viewQuizzes);
/// Function to attempt a quiz
async function attemptQuiz(quizId) {
    // Store the quizId in a data attribute
    document.getElementById('quiz-title').dataset.quizId = quizId;

    // Fetch and display the quiz
    const response = await fetch(`/student/quiz/${quizId}`);
    const data = await response.json();

    if (!data.success) {
        alert('Failed to fetch quiz: ' + data.message);
        return;
    }

    // Display the quiz and questions
    document.getElementById('quiz-title').innerText = data.quiz.title;
    const questionsContainer = document.getElementById('questions');
    questionsContainer.innerHTML = '';

    data.questions.forEach((question, index) => {
        const questionDiv = document.createElement('div');
        questionDiv.className = 'question';

        const questionText = document.createElement('p');
        questionText.innerText = `${index + 1}. ${question.question_text}`;
        questionDiv.appendChild(questionText);

        const answerInput = document.createElement('input');
        answerInput.type = 'text';
        answerInput.placeholder = 'Your answer';
        answerInput.id = `answer-${index}`;
        questionDiv.appendChild(answerInput);

        questionsContainer.appendChild(questionDiv);
    });

    // Show the quiz attempt section
    document.getElementById('quizzes-list').classList.add('hidden');
    document.getElementById('quiz-attempt').classList.remove('hidden');
}
// Function to submit the quiz attempt
async function submitQuizAttempt() {
    const quizId = document.getElementById('quiz-title').dataset.quizId;
    const questions = document.querySelectorAll('.question');
    const answers = [];
    const studentId = req.session.studentId; // Retrieve studentId from session (backend)

    questions.forEach((question, index) => {
        const answerInput = document.getElementById(`answer-${index}`);
        answers.push(answerInput.value);
    });

    try {
        const response = await fetch('/student/submit-quiz', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ quizId, answers, studentId })
        });

        const result = await response.json();

        if (result.success) {
            alert(`Quiz submitted successfully! Your score: ${result.score}/${questions.length}`);
        } else {
            alert('Failed to submit quiz: ' + result.message);
        }

        // Go back to the quizzes list
        document.getElementById('quiz-attempt').classList.add('hidden');
        document.getElementById('quizzes-list').classList.remove('hidden');
    } catch (error) {
        console.error('Error submitting quiz:', error);
        alert('Failed to submit quiz');
    }
}
// Function to create a new quiz
async function createQuiz() {
    const title = document.getElementById('quiz-title').value;
    const startDate = document.getElementById('quiz-start-date').value;
    const endDate = document.getElementById('quiz-end-date').value;

    // Validate quiz details
    if (!title || !startDate || !endDate) {
        alert('Quiz title, start date, and end date are required!');
        return;
    }

    // Collect questions
    const questions = [];
    const questionContainers = document.querySelectorAll('.question');

    for (const container of questionContainers) {
        const questionText = container.querySelector('input[type="text"]').value;
        const questionType = container.querySelector('select').value;
        const optionsContainer = container.querySelector('.options-container');
        const correctOption = optionsContainer.querySelector('input[type="text"]').value;

        // Validate question text and correct option
        if (!questionText || !correctOption) {
            alert('Question text and correct option are required for all questions!');
            return;
        }

        const question = {
            text: questionText,
            type: questionType,
            optionA: '',
            optionB: '',
            optionC: '',
            optionD: '',
            correctOption: correctOption
        };

        // Handle MCQ options
        if (questionType === 'MCQ') {
            const options = optionsContainer.querySelectorAll('input[type="text"]');
            if (options.length < 4) {
                alert('MCQ questions must have 4 options!');
                return;
            }

            question.optionA = options[0].value;
            question.optionB = options[1].value;
            question.optionC = options[2].value;
            question.optionD = options[3].value;

            // Validate MCQ options
            if (!question.optionA || !question.optionB || !question.optionC || !question.optionD) {
                alert('All MCQ options are required!');
                return;
            }
        }

        questions.push(question);
    }

    // Validate at least one question
    if (questions.length === 0) {
        alert('At least one question is required!');
        return;
    }

    try {
        // Send quiz data to the server
        const response = await fetch('/teacher/create-quiz', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, startDate, endDate, questions })
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || 'Failed to create quiz');
        }

        // Display success message
        console.log('Quiz Creation Result:', result);
        alert(result.message);

        // Clear the quiz creation form
        document.getElementById('quiz-title').value = '';
        document.getElementById('quiz-start-date').value = '';
        document.getElementById('quiz-end-date').value = '';
        document.getElementById('questions-container').innerHTML = '';

        // Go back to the teacher dashboard
        document.getElementById('quiz-creation-form').classList.add('hidden');
        document.getElementById('teacher-dashboard').classList.remove('hidden');
    } catch (error) {
        console.error('Error creating quiz:', error);
        alert(error.message || 'Failed to create quiz');
    }
}
// Add event listeners for teacher dashboard buttons
document.getElementById('create-quiz-btn')?.addEventListener('click', showQuizCreationForm);
document.getElementById('view-scores-btn')?.addEventListener('click', viewScores);
document.getElementById('logout-btn')?.addEventListener('click', logout);
// Add event listener for the "Add Question" button
document.getElementById('add-question-btn')?.addEventListener('click', addQuestion);
// Add event listener for the "Submit Quiz" button
document.getElementById('submit-quiz-btn')?.addEventListener('click', submitQuiz);

// Function to view all users
async function viewUsers() {
    try {
        const response = await fetch('/admin/users');
        const users = await response.json();
        console.log('Users:', users);

        // Display users in the UI
        const userList = users.map(user => `
            <div>
                <p>ID: ${user.id}, Username: ${user.username}, Role: ${user.role}</p>
            </div>
        `).join('');

        document.getElementById('admin-dashboard').innerHTML = userList; // Clear previous content and display new list
    } catch (error) {
        console.error('Error fetching users:', error);
        alert('Failed to fetch users');
    }
}

// Function to add a new user
async function addUser() {
    const username = prompt('Enter username:');
    const password = prompt('Enter password:');
    const role = prompt('Enter role (admin/teacher/student):');

    if (username && password && role) {
        try {
            const response = await fetch('/admin/add-user', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password, role })
            });
            const result = await response.json();
            console.log('Add User Result:', result);
            alert(result.message);
        } catch (error) {
            console.error('Error adding user:', error);
            alert('Failed to add user');
        }
    } else {
        alert('All fields are required!');
    }
}
// Add event listeners for admin dashboard buttons
document.getElementById('view-users-btn')?.addEventListener('click', viewUsers);
document.getElementById('add-user-btn')?.addEventListener('click', addUser);
document.getElementById('submit-quiz-btn').addEventListener('click', submitQuizAttempt);
