// Clear all existing data
localStorage.clear();
sessionStorage.clear();

// Initialize teachers array from localStorage or create empty array
let teachers = [];

// DOM Elements
const tabButtons = document.querySelectorAll('.tab-btn');
const forms = document.querySelectorAll('.form');
const loginForm = document.getElementById('loginForm');
const signupForm = document.getElementById('signupForm');

// Tab switching functionality
tabButtons.forEach(button => {
    button.addEventListener('click', () => {
        // Remove active class from all buttons and forms
        tabButtons.forEach(btn => btn.classList.remove('active'));
        forms.forEach(form => form.classList.remove('active'));
        
        // Add active class to clicked button and corresponding form
        button.classList.add('active');
        const tab = button.getAttribute('data-tab');
        document.getElementById(`${tab}Form`).classList.add('active');
        
        // Clear form fields when switching tabs
        forms.forEach(form => form.reset());
    });
});

// Signup form submission
signupForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const teacherName = document.getElementById('teacherName').value.trim();
    const teacherId = document.getElementById('signupId').value.trim();
    const password = document.getElementById('signupPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    // Validate inputs
    if (!teacherName || !teacherId || !password || !confirmPassword) {
        alert('Please fill in all fields!');
        return;
    }
    
    // Validate teacher name (only letters and spaces)
    if (!/^[a-zA-Z\s]+$/.test(teacherName)) {
        alert('Teacher name should contain only letters and spaces!');
        return;
    }
    
    // Validate teacher ID (alphanumeric)
    if (!/^[a-zA-Z0-9]+$/.test(teacherId)) {
        alert('Teacher ID should contain only letters and numbers!');
        return;
    }
    
    // Validate password length
    if (password.length < 6) {
        alert('Password should be at least 6 characters long!');
        return;
    }
    
    // Validate password match
    if (password !== confirmPassword) {
        alert('Passwords do not match!');
        return;
    }
    
    // Check if teacher ID already exists
    if (teachers.some(teacher => teacher.id === teacherId)) {
        alert('Teacher ID already exists! Please choose a different ID.');
        return;
    }
    
    try {
        // Add new teacher to array
        const newTeacher = {
            name: teacherName,
            id: teacherId,
            password: password,
            classes: [],
            holidays: [],
            vacations: []
        };
        
        teachers.push(newTeacher);
        
        // Save to localStorage
        localStorage.setItem('teachers', JSON.stringify(teachers));
        
        // Clear form
        signupForm.reset();
        
        alert('Signup successful! Please login with your credentials.');
        
        // Switch to login tab
        document.querySelector('[data-tab="login"]').click();
        
        // Pre-fill login form
        document.getElementById('loginId').value = teacherId;
        document.getElementById('loginPassword').value = password;
        
    } catch (error) {
        console.error('Error during signup:', error);
        alert('An error occurred during signup. Please try again.');
    }
});

// Login form submission
loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const teacherId = document.getElementById('loginId').value.trim();
    const password = document.getElementById('loginPassword').value;
    
    // Validate inputs
    if (!teacherId || !password) {
        alert('Please fill in all fields!');
        return;
    }
    
    try {
        // Refresh teachers array from localStorage
        teachers = JSON.parse(localStorage.getItem('teachers')) || [];
        
        // Find teacher in array
        const teacher = teachers.find(t => t.id === teacherId && t.password === password);
        
        if (teacher) {
            // Store current teacher in sessionStorage
            const teacherData = {
                name: teacher.name,
                id: teacher.id,
                password: teacher.password, // Include password in session data
                classes: teacher.classes || [],
                holidays: teacher.holidays || [],
                vacations: teacher.vacations || []
            };
            
            // Save to sessionStorage
            sessionStorage.setItem('currentTeacher', JSON.stringify(teacherData));
            
            // Clear form
            loginForm.reset();
            
            // Redirect to dashboard
            window.location.href = 'dashboard.html';
        } else {
            alert('Invalid Teacher ID or Password!');
        }
    } catch (error) {
        console.error('Error during login:', error);
        alert('An error occurred during login. Please try again.');
    }
}); 