// Check if user is logged in
const currentTeacher = JSON.parse(sessionStorage.getItem('currentTeacher'));
if (!currentTeacher) {
    console.log('No teacher found in session storage');
    window.location.href = 'index.html';
    throw new Error('No teacher found in session storage');
}

// Display teacher name
document.getElementById('teacherName').textContent = currentTeacher.name;

// Navigation functionality
const navButtons = document.querySelectorAll('.nav-btn');
const sections = document.querySelectorAll('.section');

navButtons.forEach(button => {
    button.addEventListener('click', () => {
        navButtons.forEach(btn => btn.classList.remove('active'));
        sections.forEach(section => section.classList.remove('active'));
        
        button.classList.add('active');
        const section = button.getAttribute('data-section');
        document.getElementById(`${section}-section`).classList.add('active');
    });
});

// Calendar functionality
let currentDate = new Date();
const calendarGrid = document.getElementById('calendarGrid');
const currentMonthYear = document.getElementById('currentMonthYear');

function updateCalendar() {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    currentMonthYear.textContent = `${new Date(year, month).toLocaleString('default', { month: 'long' })} ${year}`;
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    calendarGrid.innerHTML = '';
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay.getDay(); i++) {
        const emptyCell = document.createElement('div');
        calendarGrid.appendChild(emptyCell);
    }
    
    // Add cells for each day of the month
    for (let day = 1; day <= lastDay.getDate(); day++) {
        const dayCell = document.createElement('div');
        dayCell.className = 'calendar-day';
        dayCell.textContent = day;
        
        const date = new Date(year, month, day);
        if (date.getDay() === 0 || date.getDay() === 6) {
            dayCell.classList.add('weekend');
        }
        
        // Check if day is a holiday or vacation
        const holidays = currentTeacher.holidays || [];
        const vacations = currentTeacher.vacations || [];
        
        if (holidays.includes(date.toISOString().split('T')[0])) {
            dayCell.classList.add('holiday');
        } else if (vacations.some(v => 
            date >= new Date(v.start) && date <= new Date(v.end)
        )) {
            dayCell.classList.add('vacation');
        }

        // Add click handler for attendance
        dayCell.addEventListener('click', () => {
            if (!dayCell.classList.contains('weekend') && 
                !dayCell.classList.contains('holiday') && 
                !dayCell.classList.contains('vacation')) {
                markAttendance(date, dayCell);
            }
        });
        
        calendarGrid.appendChild(dayCell);
    }
}

// Month navigation
document.getElementById('prevMonth').addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() - 1);
    updateCalendar();
});

document.getElementById('nextMonth').addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() + 1);
    updateCalendar();
});

// Holiday and Vacation marking
document.getElementById('markHoliday').addEventListener('click', () => {
    const date = prompt('Enter date (YYYY-MM-DD):');
    if (date) {
        if (!currentTeacher.holidays) currentTeacher.holidays = [];
        currentTeacher.holidays.push(date);
        updateTeacherData();
        updateCalendar();
    }
});

document.getElementById('markVacation').addEventListener('click', () => {
    const startDate = prompt('Enter start date (YYYY-MM-DD):');
    const endDate = prompt('Enter end date (YYYY-MM-DD):');
    if (startDate && endDate) {
        if (!currentTeacher.vacations) currentTeacher.vacations = [];
        currentTeacher.vacations.push({ start: startDate, end: endDate });
        updateTeacherData();
        updateCalendar();
    }
});

// Class Management
const classModal = document.getElementById('classModal');
const studentModal = document.getElementById('studentModal');
const classForm = document.getElementById('classForm');
const createClassBtn = document.getElementById('createClass');

createClassBtn.addEventListener('click', () => {
    classModal.classList.add('active');
});

classForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const className = document.getElementById('className').value;
    const section = document.getElementById('section').value;
    const academicYear = document.getElementById('academicYear').value;
    
    if (!currentTeacher.classes) currentTeacher.classes = [];
    currentTeacher.classes.push({
        name: className,
        section: section,
        academicYear: academicYear,
        students: []
    });
    
    updateTeacherData();
    updateClassesList();
    classModal.classList.remove('active');
    classForm.reset();
});

function updateClassesList() {
    const classesList = document.getElementById('classesList');
    classesList.innerHTML = '';
    
    currentTeacher.classes.forEach((class_, index) => {
        const classCard = document.createElement('div');
        classCard.className = 'class-card';
        classCard.innerHTML = `
            <h3>${class_.name} - Section ${class_.section}</h3>
            <p>Academic Year: ${class_.academicYear}</p>
            <p>Students: ${class_.students.length}</p>
        `;
        
        classCard.addEventListener('click', () => {
            showStudentManagement(index);
        });
        
        classesList.appendChild(classCard);
    });
}

function showStudentManagement(classIndex) {
    sessionStorage.setItem('currentClassIndex', classIndex);
    const class_ = currentTeacher.classes[classIndex];
    const studentsList = document.getElementById('studentsList');
    studentsList.innerHTML = '';
    
    class_.students.forEach((student, studentIndex) => {
        const studentItem = document.createElement('div');
        studentItem.className = 'student-item';
        studentItem.innerHTML = `
            <span>${student.name}</span>
            <button onclick="deleteStudent(${classIndex}, ${studentIndex})">Delete</button>
        `;
        studentsList.appendChild(studentItem);
    });
    
    studentModal.classList.add('active');
}

function deleteStudent(classIndex, studentIndex) {
    currentTeacher.classes[classIndex].students.splice(studentIndex, 1);
    updateTeacherData();
    showStudentManagement(classIndex);
}

// Update teacher data in localStorage
function updateTeacherData() {
    const teachers = JSON.parse(localStorage.getItem('teachers')) || [];
    const index = teachers.findIndex(t => t.id === currentTeacher.id);
    if (index !== -1) {
        teachers[index] = currentTeacher;
        localStorage.setItem('teachers', JSON.stringify(teachers));
        sessionStorage.setItem('currentTeacher', JSON.stringify(currentTeacher));
    }
}

// Logout functionality
document.getElementById('logoutBtn').addEventListener('click', () => {
    sessionStorage.removeItem('currentTeacher');
    window.location.href = 'index.html';
});

// Add event listeners for student management buttons
document.getElementById('addStudent').addEventListener('click', () => {
    const studentName = prompt('Enter student name:');
    if (studentName) {
        const currentClassIndex = parseInt(sessionStorage.getItem('currentClassIndex'));
        if (!currentTeacher.classes[currentClassIndex].students) {
            currentTeacher.classes[currentClassIndex].students = [];
        }
        currentTeacher.classes[currentClassIndex].students.push({
            name: studentName,
            attendance: []
        });
        updateTeacherData();
        showStudentManagement(currentClassIndex);
    }
});

document.getElementById('deleteClass').addEventListener('click', () => {
    if (confirm('Are you sure you want to delete this class? This action cannot be undone.')) {
        const currentClassIndex = parseInt(sessionStorage.getItem('currentClassIndex'));
        currentTeacher.classes.splice(currentClassIndex, 1);
        updateTeacherData();
        updateClassesList();
        studentModal.classList.remove('active');
    }
});

// Add back button functionality
document.getElementById('backToClasses').addEventListener('click', () => {
    studentModal.classList.remove('active');
});

// Add PDF download functionality
document.getElementById('downloadAttendance').addEventListener('click', () => {
    const currentClassIndex = parseInt(sessionStorage.getItem('currentClassIndex'));
    if (currentClassIndex === null || !currentTeacher.classes[currentClassIndex]) {
        alert('Please select a class first');
        return;
    }

    const class_ = currentTeacher.classes[currentClassIndex];
    const month = currentDate.getMonth();
    const year = currentDate.getFullYear();
    const today = new Date().toISOString().split('T')[0];
    
    // Create PDF content with proper styling
    let pdfContent = `
        <style>
            .pdf-header {
                text-align: center;
                margin-bottom: 30px;
                color: #2c3e50;
                font-family: 'Times New Roman', serif;
            }
            .pdf-title {
                font-size: 36px;
                font-weight: bold;
                margin-bottom: 20px;
                letter-spacing: 2px;
            }
            .pdf-info {
                display: flex;
                justify-content: space-between;
                margin-bottom: 20px;
                font-size: 18px;
            }
            .pdf-info span {
                border-bottom: 1px solid #2c3e50;
                padding: 5px 20px;
            }
            .pdf-table {
                width: 100%;
                border-collapse: collapse;
                margin: 20px 0;
                font-family: Arial, sans-serif;
            }
            .pdf-table th, .pdf-table td {
                border: 1px solid #2c3e50;
                padding: 12px;
                text-align: left;
            }
            .pdf-table th {
                background-color: #f5f6fa;
                color: #2c3e50;
                font-weight: 600;
            }
            .pdf-table tr:nth-child(even) {
                background-color: #f8f9fa;
            }
            .star-decoration {
                position: absolute;
                top: 20px;
                right: 20px;
                font-size: 24px;
            }
        </style>
        <div class="star-decoration">✧✦</div>
        <div class="pdf-header">
            <div class="pdf-title">CLASS ATTENDANCE</div>
            <div class="pdf-info">
                <div>CLASS: <span>${class_.name} - Section ${class_.section}</span></div>
                <div>DATE: <span>${today}</span></div>
            </div>
        </div>
        <table class="pdf-table">
            <tr>
                <th style="width: 80px;">No</th>
                <th>Student Name</th>
            </tr>
    `;

    // Add student rows
    class_.students.forEach((student, index) => {
        pdfContent += `
            <tr>
                <td>${index + 1}</td>
                <td>${student.name}</td>
            </tr>
        `;
    });

    // Add empty rows to make it 21 rows total
    const remainingRows = 21 - class_.students.length;
    for (let i = 0; i < remainingRows; i++) {
        pdfContent += `
            <tr>
                <td>${class_.students.length + i + 1}</td>
                <td></td>
            </tr>
        `;
    }

    pdfContent += `</table>`;

    // Create and download PDF
    const element = document.createElement('div');
    element.innerHTML = pdfContent;
    
    const opt = {
        margin: [0.5, 0.5, 0.5, 0.5],
        filename: `attendance_${class_.name}_${today}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { 
            scale: 2,
            useCORS: true,
            letterRendering: true
        },
        jsPDF: { 
            unit: 'in', 
            format: 'a4', 
            orientation: 'portrait'
        }
    };

    // Show loading message
    const loadingMessage = document.createElement('div');
    loadingMessage.style.position = 'fixed';
    loadingMessage.style.top = '50%';
    loadingMessage.style.left = '50%';
    loadingMessage.style.transform = 'translate(-50%, -50%)';
    loadingMessage.style.padding = '20px';
    loadingMessage.style.background = 'rgba(0, 0, 0, 0.8)';
    loadingMessage.style.color = 'white';
    loadingMessage.style.borderRadius = '10px';
    loadingMessage.textContent = 'Generating PDF...';
    document.body.appendChild(loadingMessage);

    // Generate and download PDF
    html2pdf().set(opt).from(element).save().then(() => {
        loadingMessage.remove();
    });
});

// Add markAttendance function
function markAttendance(date, dayCell) {
    const currentClassIndex = parseInt(sessionStorage.getItem('currentClassIndex'));
    if (currentClassIndex === null || !currentTeacher.classes[currentClassIndex]) {
        alert('Please select a class first');
        return;
    }

    const class_ = currentTeacher.classes[currentClassIndex];
    const dateStr = date.toISOString().split('T')[0];
    
    // Create attendance modal
    const attendanceModal = document.createElement('div');
    attendanceModal.className = 'modal active';
    attendanceModal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>Mark Attendance for ${dateStr}</h2>
                <button class="back-btn" onclick="this.parentElement.parentElement.parentElement.remove()">← Back to Calendar</button>
            </div>
            <div class="attendance-list">
                ${class_.students.map((student, index) => `
                    <div class="attendance-item">
                        <span>${student.name}</span>
                        <div class="attendance-options">
                            <button class="present" data-index="${index}">Present</button>
                            <button class="absent" data-index="${index}">Absent</button>
                        </div>
                    </div>
                `).join('')}
            </div>
            <button id="saveAttendance" class="btn">Save Attendance</button>
        </div>
    `;
    
    document.body.appendChild(attendanceModal);

    // Handle attendance buttons
    const attendanceItems = attendanceModal.querySelectorAll('.attendance-item');
    attendanceItems.forEach(item => {
        const presentBtn = item.querySelector('.present');
        const absentBtn = item.querySelector('.absent');
        const studentIndex = presentBtn.dataset.index;

        presentBtn.addEventListener('click', () => {
            updateStudentAttendance(currentClassIndex, studentIndex, dateStr, 'present');
            presentBtn.classList.add('active');
            absentBtn.classList.remove('active');
        });

        absentBtn.addEventListener('click', () => {
            updateStudentAttendance(currentClassIndex, studentIndex, dateStr, 'absent');
            absentBtn.classList.add('active');
            presentBtn.classList.remove('active');
        });
    });

    // Save attendance
    document.getElementById('saveAttendance').addEventListener('click', () => {
        updateTeacherData();
        attendanceModal.remove();
        dayCell.classList.add('attendance-marked');
    });
}

// Function to update student attendance
function updateStudentAttendance(classIndex, studentIndex, date, status) {
    const student = currentTeacher.classes[classIndex].students[studentIndex];
    if (!student.attendance) {
        student.attendance = [];
    }
    
    // Remove existing attendance for this date if any
    student.attendance = student.attendance.filter(a => a.date !== date);
    
    // Add new attendance record
    student.attendance.push({
        date: date,
        status: status
    });
}

// Initialize
updateCalendar();
updateClassesList(); 