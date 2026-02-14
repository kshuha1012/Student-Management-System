const firebaseConfig = {
    apiKey: "AIzaSyB1sETrWBJvTIOlsIGhwtXyf6plD8TNRfs",
    authDomain: "attendance-system-a1068.firebaseapp.com",
    databaseURL: "https://attendance-system-a1068-default-rtdb.firebaseio.com",
    projectId: "attendance-system-a1068",
    storageBucket: "attendance-system-a1068.firebasestorage.app",
    messagingSenderId: "499620745174",
    appId: "1:499620745174:web:48c3224bac2f20e3c1e77"
};

// ==================== ASOSIY MA'LUMOTLAR ====================

// Foydalanuvchilar (LocalStorage dan yoki default)
let users = JSON.parse(localStorage.getItem('users')) || [
    {
        id: 1,
        username: 'admin',
        password: '12345',
        name: 'Admin',
        email: 'admin@example.com',
        phone: '+998901234567',
        role: 'admin',
        createdAt: new Date().toISOString()
    }
];

// Joriy foydalanuvchi
let currentUser = null;

// Guruhlar
let groups = JSON.parse(localStorage.getItem('groups')) || [];

// O'quvchilar
let students = JSON.parse(localStorage.getItem('students')) || [];

// Davomat ma'lumotlari
let attendance = JSON.parse(localStorage.getItem('attendance')) || {};

// Davomat tarixi ma'lumotlari
let attendanceHistory = JSON.parse(localStorage.getItem('attendanceHistory')) || {};

// Imtihonlar ma'lumotlari
let exams = JSON.parse(localStorage.getItem('exams')) || [];
let examResults = JSON.parse(localStorage.getItem('examResults')) || [];

// Email sozlamalari
let emailSettings = JSON.parse(localStorage.getItem('emailSettings')) || {
    autoAttendance: true,
    autoExamResults: true,
    autoMonthlyReport: false,
    autoBirthday: true,
    smtpSettings: null
};

// Email shablonlari
const emailTemplates = {
    attendance_report: {
        subject: "Hurmatli ota-ona, {student_name}ning davomat hisoboti",
        message: `Hurmatli {parent_name},<br><br>
                 Ushbu xabar orqali farzandingiz <strong>{student_name}</strong>ning <strong>{month}</strong> oyidagi davomat hisobotini taqdim etamiz:<br><br>
                 ✅ <strong>Davomat foizi:</strong> {attendance_percentage}%<br>
                 📅 <strong>Kelgan kunlar:</strong> {present_days}<br>
                 ❌ <strong>Kelmagandagi kunlar:</strong> {absent_days}<br>
                 ⏰ <strong>Kech qolgan kunlar:</strong> {late_days}<br><br>
                 Farzandingizning muntazam darslarda qatnashishi uning o'qish natijalariga ijobiy ta'sir qiladi. Iltimos, bolangizni muntazam ravishda darsga yuboring.<br><br>
                 Hurmat bilan,<br>
                 {school_name} Menejment`
    },

    exam_results: {
        subject: "Hurmatli ota-ona, {student_name}ning imtihon natijalari",
        message: `Hurmatli {parent_name},<br><br>
                 Farzandingiz <strong>{student_name}</strong>ning <strong>{exam_name}</strong> imtihoni natijalari:<br><br>
                 📊 <strong>Olingan ball:</strong> {score}/{max_score}<br>
                 📈 <strong>Foiz:</strong> {percentage}%<br>
                 🏆 <strong>O'rin:</strong> {rank}<br>
                 📝 <strong>Baholash:</strong> {grade}<br><br>
                 {performance_comment}<br><br>
                 Iltimos, farzandingizni yanada yaxshilash uchun unga yordam bering. Agar savollaringiz bo'lsa, biz bilan bog'laning.<br><br>
                 Hurmat bilan,<br>
                 {school_name} Menejment`
    },

    low_attendance: {
        subject: "Muhim: {student_name}ning davomat foizi past",
        message: `Hurmatli {parent_name},<br><br>
                 Ogohlantirish: Farzandingiz <strong>{student_name}</strong>ning hozirgi davomat foizi <strong>{attendance_percentage}%</strong> ga yetdi, bu maqbul darajadan past.<br><br>
                 📅 <strong>Joriy oy:</strong> {present_days} kun (kelgan), {absent_days} kun (kelmagan)<br>
                 ⚠️ <strong>Sabablar:</strong> {reasons}<br><br>
                 Muntazam darslarda qatnashish bolaning ta'lim olishi uchun juda muhim. Iltimos, bolangizning maktabga kelishini ta'minlang.<br><br>
                 Hurmat bilan,<br>
                 {school_name} Menejment`
    },

    low_grades: {
        subject: "{student_name}ning baholari haqida ogohlantirish",
        message: `Hurmatli {parent_name},<br><br>
                 Farzandingiz <strong>{student_name}</strong>ning ba'zi fanlardagi baholari maqbul darajadan past:<br><br>
                 {subjects_list}<br><br>
                 ⚠️ <strong>O'rtacha baho:</strong> {average_grade}<br>
                 💡 <strong>Takliflar:</strong> {suggestions}<br><br>
                 Iltimos, bolangizga qo'shimcha yordam ko'rsating yoki repetitor bilan bog'laning. Biz ham yordam berishga tayyormiz.<br><br>
                 Hurmat bilan,<br>
                 {school_name} Menejment`
    },

    event_notification: {
        subject: "{school_name}dan yangi tadbir haqida xabar",
        message: `Hurmatli ota-onalar,<br><br>
                 Sizni <strong>{event_name}</strong> tadbiri haqida xabar berishdan mamnunmiz:<br><br>
                 📅 <strong>Sana:</strong> {event_date}<br>
                 ⏰ <strong>Vaqt:</strong> {event_time}<br>
                 📍 <strong>Manzil:</strong> {event_location}<br>
                 📝 <strong>Tavsif:</strong> {event_description}<br><br>
                 Tadbirda ishtirok etishingizni so'raymiz. Farzandingiz bilan birga kelishingiz mumkin.<br><br>
                 Hurmat bilan,<br>
                 {school_name} Menejment`
    },

    payment_reminder: {
        subject: "To'lov eslatmasi - {school_name}",
        message: `Hurmatli {parent_name},<br><br>
                 Farzandingiz <strong>{student_name}</strong> uchun <strong>{month}</strong> oyi to'lovini eslatib o'tamiz:<br><br>
                 💰 <strong>To'lov miqdori:</strong> {amount} so'm<br>
                 📅 <strong>Muddati:</strong> {due_date}<br>
                 🏦 <strong>Hisob raqami:</strong> {account_number}<br><br>
                 To'lovni o'z vaqtida amalga oshirish iltimos qilinadi. To'lov amalga oshirilgandan so'ng, iltimos, bizga xabar bering.<br><br>
                 Hurmat bilan,<br>
                 {school_name} Menejment`
    }
};

// Joriy oy va sahifa
let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();
let currentPage = 1;
const recordsPerPage = 10;

// ==================== SAHIFA YUKLANGANDA ====================

document.addEventListener('DOMContentLoaded', function () {
    // Login formasi
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    // Ro'yxatdan o'tish formasi
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }

    // Guruh formasi
    const groupForm = document.getElementById('groupForm');
    if (groupForm) {
        groupForm.addEventListener('submit', handleGroupForm);
    }

    // O'quvchi formasi
    const studentForm = document.getElementById('studentForm');
    if (studentForm) {
        studentForm.addEventListener('submit', handleStudentForm);
    }

    // Imtihon formasi
    const examForm = document.getElementById('examForm');
    if (examForm) {
        examForm.addEventListener('submit', function (e) {
            e.preventDefault();
            saveExam();
        });
    }

    // Sahifa yuklanganda foydalanuvchini tekshirish
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        showDashboard();
        initDashboard();
    }

    // Event listenerlarni sozlash
    setupEventListeners();

    // Sahifa yuklanganda hisobot maydonlarini yuklash
    setTimeout(() => {
        if (document.getElementById('reportType')) {
            toggleReportFields();
        }
    }, 100);
});

// ==================== LOGIN/REGISTER FUNKSIYALARI ====================

function handleLogin(e) {
    e.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    // Foydalanuvchini tekshirish
    const user = users.find(u => u.username === username && u.password === password);

    if (user) {
        currentUser = user;
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        showDashboard();
        initDashboard();
        showNotification('Muvaffaqiyatli kirish!', 'success');
    } else {
        showNotification('Login yoki parol noto\'g\'ri!', 'error');
    }
}

function handleRegister(e) {
    e.preventDefault();

    const name = document.getElementById('regName').value;
    const lastName = document.getElementById('regLastName').value;
    const username = document.getElementById('regUsername').value;
    const email = document.getElementById('regEmail').value;
    const password = document.getElementById('regPassword').value;
    const confirmPassword = document.getElementById('regConfirmPassword').value;

    // Validatsiya
    if (password !== confirmPassword) {
        showNotification('Parollar mos kelmadi!', 'error');
        return;
    }

    if (users.some(u => u.username === username)) {
        showNotification('Bu foydalanuvchi nomi band!', 'error');
        return;
    }

    if (users.some(u => u.email === email)) {
        showNotification('Bu email band!', 'error');
        return;
    }

    // Yangi foydalanuvchi
    const newUser = {
        id: Date.now(),
        username: username,
        password: password,
        name: name + ' ' + lastName,
        email: email,
        phone: '',
        role: 'teacher',
        createdAt: new Date().toISOString()
    };

    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));

    showNotification('Ro\'yxatdan muvaffaqiyatli o\'tdingiz!', 'success');
    hideRegister();

    // Automatik login
    document.getElementById('username').value = username;
    document.getElementById('password').value = password;
}

function showRegister() {
    document.getElementById('registerModal').classList.remove('hidden');
}

function hideRegister() {
    document.getElementById('registerModal').classList.add('hidden');
    document.getElementById('registerForm').reset();
}

function logout() {
    if (confirm('Tizimdan chiqishni tasdiqlaysizmi?')) {
        currentUser = null;
        localStorage.removeItem('currentUser');
        showLogin();
        showNotification('Tizimdan chiqildi', 'info');
    }
}

function showLogin() {
    document.getElementById('loginPage').classList.remove('hidden');
    document.getElementById('dashboard').classList.add('hidden');
}

function showDashboard() {
    document.getElementById('loginPage').classList.add('hidden');
    document.getElementById('dashboard').classList.remove('hidden');
    updateUserInfo();
}

// ==================== DASHBOARD FUNKSIYALARI ====================

function initDashboard() {
    updateUserInfo();
    loadGroups();
    loadStudents();
    updateStatistics();
    setupTabs();
    updateTodayDate();
    initAttendanceHistory();
    loadExams();
    loadEmailSettings();
}

function updateUserInfo() {
    if (!currentUser) return;

    const initial = currentUser.name.charAt(0);
    document.getElementById('userInitial').textContent = initial;
    document.getElementById('userName').textContent = currentUser.name;
    document.getElementById('userEmail').textContent = currentUser.email;
    document.getElementById('profileAvatar').textContent = initial;
    document.getElementById('profileName').value = currentUser.name;
    document.getElementById('profileEmail').value = currentUser.email;
    document.getElementById('profilePhone').value = currentUser.phone || '';
}

function setupTabs() {
    const menuButtons = document.querySelectorAll('.menu-btn');
    menuButtons.forEach(button => {
        button.addEventListener('click', function () {
            // Barcha tugmalardan aktiv classni olib tashlash
            menuButtons.forEach(btn => btn.classList.remove('active'));
            // Barcha tablarni yashirish
            document.querySelectorAll('.tab-content').forEach(tab => {
                tab.classList.remove('active');
            });

            // Tanlangan tugmani aktiv qilish
            this.classList.add('active');

            // Tanlangan tabni ko'rsatish
            const tabName = this.getAttribute('data-tab');
            document.getElementById(tabName + 'Tab').classList.add('active');

            // Sahifa sarlavhasini yangilash
            updatePageTitle(tabName);

            // Agar sidebar kichik ekranda ochiq bo'lsa, yopish
            if (window.innerWidth < 1024) {
                document.getElementById('sidebar').classList.remove('active');
            }
        });
    });
}

function updatePageTitle(tabName) {
    const titles = {
        'groups': 'Guruhlar',
        'students': 'O\'quvchilar',
        'attendance': 'Davomat',
        'exams': 'Imtihonlar',
        'reports': 'Hisobotlar',
        'settings': 'Sozlamalar'
    };

    const descriptions = {
        'groups': 'Guruhlarni boshqarish',
        'students': 'O\'quvchilar ro\'yxati',
        'attendance': 'Davomat nazorati',
        'exams': 'Test yaratish va boshqarish',
        'reports': 'Hisobotlar yaratish',
        'settings': 'Foydalanuvchi sozlamalari'
    };

    document.getElementById('pageTitle').textContent = titles[tabName] || 'Dashboard';
    document.getElementById('pageDescription').textContent = descriptions[tabName] || '';
}

// ==================== GURUHLAR FUNKSIYALARI ====================

function loadGroups() {
    const container = document.getElementById('groupsContainer');
    if (!container) return;

    container.innerHTML = '';

    if (groups.length === 0) {
        container.innerHTML = `
            <div class="col-span-full text-center py-12">
                <div class="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i class="fas fa-users text-3xl text-gray-400"></i>
                </div>
                <h3 class="text-lg font-medium text-gray-600 mb-2">Hali guruhlar yo'q</h3>
                <p class="text-gray-500 mb-4">Birinchi guruhni yarating</p>
                <button onclick="openGroupModal()" 
                        class="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg">
                    <i class="fas fa-plus mr-2"></i> Yangi Guruh
                </button>
            </div>
        `;
        return;
    }

    groups.forEach(group => {
        const groupStudents = students.filter(s => s.groupId === group.id);
        const presentCount = groupStudents.filter(s => s.attendance === 'present').length;
        const attendanceRate = groupStudents.length > 0 ?
            Math.round((presentCount / groupStudents.length) * 100) : 0;
        const avgGrade = groupStudents.length > 0 ?
            (groupStudents.reduce((sum, s) => sum + (s.grade || 0), 0) / groupStudents.length).toFixed(1) : '0.0';

        const groupCard = document.createElement('div');
        groupCard.className = 'group-card';
        groupCard.innerHTML = `
            <div class="group-header">
                <div class="group-color ${group.color}"></div>
                <div>
                    <div class="group-title">${group.name}</div>
                    <div class="group-course">Kurs ${group.course}</div>
                </div>
            </div>
            
            ${group.description ? `<p class="text-gray-600 text-sm mb-4">${group.description}</p>` : ''}
            
            <div class="group-stats">
                <div class="stat-item">
                    <div class="stat-value">${groupStudents.length}</div>
                    <div class="stat-label">O'quvchi</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value">${attendanceRate}%</div>
                    <div class="stat-label">Davomat</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value">${avgGrade}</div>
                    <div class="stat-label">O'rtacha</div>
                </div>
            </div>
            
            <div class="mt-6 flex justify-between">
                <button onclick="viewGroup(${group.id})" 
                        class="text-blue-600 hover:text-blue-800 font-medium">
                    <i class="fas fa-eye mr-2"></i> Ko'rish
                </button>
                <div class="flex space-x-2">
                    <button onclick="editGroup(${group.id})" 
                            class="p-2 text-gray-500 hover:text-blue-600">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button onclick="deleteGroup(${group.id})" 
                            class="p-2 text-gray-500 hover:text-red-600">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;

        container.appendChild(groupCard);
    });
}

function openGroupModal(group = null) {
    const modal = document.getElementById('groupModal');
    const title = document.getElementById('groupModalTitle');
    const form = document.getElementById('groupForm');

    if (group) {
        title.textContent = 'Guruhni Tahrirlash';
        document.getElementById('groupId').value = group.id;
        document.getElementById('groupName').value = group.name;
        document.getElementById('groupCourse').value = group.course;
        document.getElementById('groupDescription').value = group.description || '';
        document.querySelector(`input[name="groupColor"][value="${group.color}"]`).checked = true;
    } else {
        title.textContent = 'Yangi Guruh';
        form.reset();
        document.getElementById('groupId').value = '';
    }

    modal.classList.remove('hidden');
}

function closeGroupModal() {
    document.getElementById('groupModal').classList.add('hidden');
    document.getElementById('groupForm').reset();
}

function handleGroupForm(e) {
    e.preventDefault();

    const groupId = document.getElementById('groupId').value;
    const group = {
        id: groupId || Date.now(),
        name: document.getElementById('groupName').value,
        course: document.getElementById('groupCourse').value,
        description: document.getElementById('groupDescription').value,
        color: document.querySelector('input[name="groupColor"]:checked').value,
        createdAt: groupId ? groups.find(g => g.id == groupId).createdAt : new Date().toISOString().split('T')[0],
        students: groupId ? groups.find(g => g.id == groupId).students : []
    };

    if (groupId) {
        // Yangilash
        const index = groups.findIndex(g => g.id == groupId);
        groups[index] = group;
        showNotification('Guruh yangilandi!', 'success');
    } else {
        // Yangi guruh
        groups.push(group);
        showNotification('Yangi guruh yaratildi!', 'success');
    }

    saveToLocalStorage();
    loadGroups();
    updateStatistics();
    closeGroupModal();
}

function editGroup(id) {
    const group = groups.find(g => g.id === id);
    if (group) openGroupModal(group);
}

function deleteGroup(id) {
    if (confirm('Guruhni o\'chirish bilan undagi o\'quvchilar ham o\'chiriladi. Davom etasizmi?')) {
        // Guruhdagi o'quvchilarni o'chirish
        students = students.filter(s => s.groupId !== id);
        // Guruhni o'chirish
        groups = groups.filter(g => g.id !== id);

        saveToLocalStorage();
        loadGroups();
        loadStudents();
        updateStatistics();
        showNotification('Guruh o\'chirildi!', 'success');
    }
}

function viewGroup(id) {
    const group = groups.find(g => g.id === id);
    const groupStudents = students.filter(s => s.groupId === id);

    let modalContent = `
        <div class="modal-content">
            <h2 class="text-2xl font-bold text-gray-800 mb-6">${group.name}</h2>
            
            <div class="mb-6">
                <p class="text-gray-600">${group.description || 'Ta\'rif yo\'q'}</p>
                <div class="mt-4 flex space-x-4">
                    <span class="px-3 py-1 bg-gray-100 text-gray-700 rounded-full">
                        Kurs ${group.course}
                    </span>
                    <span class="px-3 py-1 bg-gray-100 text-gray-700 rounded-full">
                        ${groupStudents.length} ta o'quvchi
                    </span>
                </div>
            </div>
            
            <div class="space-y-3 mb-6">
                <h3 class="font-bold text-gray-700">Guruh O'quvchilari</h3>
    `;

    if (groupStudents.length === 0) {
        modalContent += `
            <div class="text-center py-8">
                <i class="fas fa-user-slash text-4xl text-gray-300 mb-4"></i>
                <p class="text-gray-500">Guruhda o'quvchilar yo'q</p>
            </div>
        `;
    } else {
        groupStudents.forEach(student => {
            modalContent += `
                <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div class="flex items-center">
                        <div class="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold mr-3">
                            ${student.firstName.charAt(0)}${student.lastName.charAt(0)}
                        </div>
                        <div>
                            <div class="font-medium">${student.firstName} ${student.lastName}</div>
                            <div class="text-sm text-gray-500">${student.phone}</div>
                        </div>
                    </div>
                    <div class="flex items-center space-x-3">
                        <span class="text-sm ${student.grade >= 4.5 ? 'text-green-600' : student.grade >= 3.5 ? 'text-yellow-600' : 'text-red-600'}">
                            ${student.grade || '0'}
                        </span>
                        <span class="px-2 py-1 text-xs rounded-full ${student.attendance === 'present' ? 'bg-green-100 text-green-800' : student.attendance === 'absent' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}">
                            ${student.attendance === 'present' ? 'Kelgan' : student.attendance === 'absent' ? 'Kelmaganga' : 'Kech qolgan'}
                        </span>
                    </div>
                </div>
            `;
        });
    }

    modalContent += `
            </div>
            
            <div class="flex justify-end space-x-3">
                <button onclick="closeModal()" 
                        class="btn-secondary">
                    Yopish
                </button>
                <button onclick="openStudentModalForGroup(${id})" 
                        class="btn-primary">
                    <i class="fas fa-plus mr-2"></i> O'quvchi Qo'shish
                </button>
            </div>
        </div>
    `;

    showModal(modalContent);
}

function openStudentModalForGroup(groupId) {
    closeModal();
    openStudentModal(null, groupId);
}

// ==================== O'QUVCHILAR FUNKSIYALARI ====================

function loadStudents() {
    const table = document.getElementById('studentsTable');
    if (!table) return;

    table.innerHTML = '';

    if (students.length === 0) {
        table.innerHTML = `
            <tr>
                <td colspan="6" class="px-6 py-12 text-center">
                    <i class="fas fa-user-slash text-4xl text-gray-300 mb-4"></i>
                    <p class="text-gray-500">Hali o'quvchilar qo'shilmagan</p>
                </td>
            </tr>
        `;
        document.getElementById('studentsCount').textContent = '0 ta o\'quvchi';
        return;
    }

    students.forEach(student => {
        const group = groups.find(g => g.id === student.groupId);
        const groupName = group ? group.name : 'Guruhsiz';
        const statusText = student.attendance === 'present' ? 'Kelgan' :
            student.attendance === 'absent' ? 'Kelmaganga' : 'Kech qolgan';
        const statusClass = student.attendance === 'present' ? 'bg-green-100 text-green-800' :
            student.attendance === 'absent' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800';

        const row = document.createElement('tr');
        row.className = 'student-row';
        row.innerHTML = `
            <td class="px-6 py-4">
                <div class="flex items-center">
                    <div class="student-avatar">
                        ${student.firstName.charAt(0)}${student.lastName.charAt(0)}
                    </div>
                    <div class="ml-3">
                        <div class="font-medium">${student.firstName} ${student.lastName}</div>
                        <div class="text-sm text-gray-500">${student.email || 'Email yo\'q'}</div>
                    </div>
                </div>
            </td>
            <td class="px-6 py-4">
                <span class="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                    ${groupName}
                </span>
            </td>
            <td class="px-6 py-4">${student.phone}</td>
            <td class="px-6 py-4">
                <span class="px-3 py-1 ${statusClass} rounded-full text-sm">
                    ${statusText}
                </span>
            </td>
            <td class="px-6 py-4">
                <span class="font-bold ${student.grade >= 4.5 ? 'text-green-600' : student.grade >= 3.5 ? 'text-yellow-600' : 'text-red-600'}">
                    ${student.grade || '0'}
                </span>
            </td>
            <td class="px-6 py-4">
                <div class="flex space-x-2">
                    <button onclick="editStudent(${student.id})" 
                            class="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button onclick="deleteStudent(${student.id})" 
                            class="p-2 text-red-600 hover:bg-red-50 rounded-lg">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        `;

        table.appendChild(row);
    });

    document.getElementById('studentsCount').textContent = `${students.length} ta o'quvchi`;
}

function openStudentModal(student = null, groupId = null) {
    const modal = document.getElementById('studentModal');
    const title = document.getElementById('studentModalTitle');
    const form = document.getElementById('studentForm');
    const groupSelect = document.getElementById('studentGroup');

    // Guruhlarni to'ldirish
    groupSelect.innerHTML = '<option value="">Tanlang</option>' +
        groups.map(g => `<option value="${g.id}">${g.name} (Kurs ${g.course})</option>`).join('');

    if (student) {
        title.textContent = 'O\'quvchini Tahrirlash';
        document.getElementById('studentId').value = student.id;
        document.getElementById('firstName').value = student.firstName;
        document.getElementById('lastName').value = student.lastName;
        document.getElementById('phone').value = student.phone;
        document.getElementById('studentGroup').value = student.groupId;
        document.getElementById('birthDate').value = student.birthDate || '';
        document.getElementById('grade').value = student.grade || '';
        document.getElementById('notes').value = student.notes || '';
        document.getElementById('parentName').value = student.parentName || '';
        document.getElementById('parentEmail').value = student.parentEmail || '';
        document.getElementById('parentPhone').value = student.parentPhone || '';
    } else {
        title.textContent = "Yangi O'quvchi";
        form.reset();
        document.getElementById('studentId').value = '';
        if (groupId) {
            document.getElementById('studentGroup').value = groupId;
        }
    }

    modal.classList.remove('hidden');
}

function closeStudentModal() {
    document.getElementById('studentModal').classList.add('hidden');
    document.getElementById('studentForm').reset();
}

function handleStudentForm(e) {
    e.preventDefault();

    const studentId = document.getElementById('studentId').value;
    const student = {
        id: studentId || Date.now(),
        firstName: document.getElementById('firstName').value,
        lastName: document.getElementById('lastName').value,
        phone: document.getElementById('phone').value,
        groupId: parseInt(document.getElementById('studentGroup').value),
        attendance: 'present',
        grade: parseFloat(document.getElementById('grade').value) || 0,
        birthDate: document.getElementById('birthDate').value,
        notes: document.getElementById('notes').value,
        parentName: document.getElementById('parentName').value,
        parentEmail: document.getElementById('parentEmail').value,
        parentPhone: document.getElementById('parentPhone').value,
        photo: null,
        email: ''
    };

    if (studentId) {
        // Yangilash
        const index = students.findIndex(s => s.id == studentId);
        const oldStudent = students[index];
        student.attendance = oldStudent.attendance;
        student.photo = oldStudent.photo;
        student.email = oldStudent.email;

        students[index] = student;
        showNotification('O\'quvchi yangilandi!', 'success');
    } else {
        // Yangi o'quvchi
        students.push(student);
        showNotification("Yangi o'quvchi qo\'shildi!", 'success');
    }

    saveToLocalStorage();
    loadStudents();
    updateStatistics();
    closeStudentModal();
}

function editStudent(id) {
    const student = students.find(s => s.id === id);
    if (student) openStudentModal(student);
}

function deleteStudent(id) {
    if (confirm('O\'quvchini o\'chirishni tasdiqlaysizmi?')) {
        students = students.filter(s => s.id !== id);
        saveToLocalStorage();
        loadStudents();
        updateStatistics();
        showNotification('O\'quvchi o\'chirildi!', 'success');
    }
}

// ==================== DAVOMAT FUNKSIYALARI ====================

function updateTodayDate() {
    const today = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    document.getElementById('todayDate').textContent = `Bugun: ${today.toLocaleDateString('uz-UZ', options)}`;
    loadGroupButtons();
}

function loadGroupButtons() {
    const container = document.getElementById('groupButtons');
    if (!container) return;

    container.innerHTML = '';

    if (groups.length === 0) {
        container.innerHTML = '<p class="text-gray-500">Hali guruhlar yo\'q</p>';
        return;
    }

    groups.forEach(group => {
        const button = document.createElement('button');
        button.className = 'px-4 py-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition duration-300';
        button.textContent = group.name;
        button.onclick = () => loadGroupAttendance(group.id);
        container.appendChild(button);
    });
}

function loadGroupAttendance(groupId) {
    const group = groups.find(g => g.id === groupId);
    if (!group) return;

    const groupStudents = students.filter(s => s.groupId === groupId);
    const today = new Date().toISOString().split('T')[0];
    const todayAttendance = attendance[today] || {};

    let content = `
        <div class="bg-white rounded-xl shadow-sm p-6">
            <div class="flex justify-between items-center mb-6">
                <h3 class="text-lg font-bold text-gray-800">${group.name} - Davomat</h3>
                <div class="flex space-x-2">
                    <button onclick="markAllPresent(${groupId})" 
                            class="px-3 py-1 bg-green-100 text-green-600 rounded-lg text-sm">
                        Barchasi kelgan
                    </button>
                    <button onclick="saveGroupAttendance(${groupId})" 
                            class="px-3 py-1 bg-blue-600 text-white rounded-lg text-sm">
                        Saqlash
                    </button>
                </div>
            </div>
            
            <div class="space-y-3">
    `;

    if (groupStudents.length === 0) {
        content += `
            <div class="text-center py-8">
                <p class="text-gray-500">Guruhda o'quvchilar yo'q</p>
            </div>
        `;
    } else {
        groupStudents.forEach(student => {
            const studentAttendance = todayAttendance[student.id] || { status: 'present', note: '' };

            content += `
                <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div class="flex items-center">
                        <div class="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold mr-3">
                            ${student.firstName.charAt(0)}${student.lastName.charAt(0)}
                        </div>
                        <div>
                            <div class="font-medium">${student.firstName} ${student.lastName}</div>
                            <div class="text-sm text-gray-500">${student.phone}</div>
                        </div>
                    </div>
                    
                    <div class="flex items-center space-x-3">
                        <div class="flex space-x-1">
                            <button onclick="setAttendance(${student.id}, 'present')" 
                                    class="attendance-btn present ${studentAttendance.status === 'present' ? 'active' : ''}">
                                ✓
                            </button>
                            <button onclick="setAttendance(${student.id}, 'absent')" 
                                    class="attendance-btn absent ${studentAttendance.status === 'absent' ? 'active' : ''}">
                                ✗
                            </button>
                            <button onclick="setAttendance(${student.id}, 'late')" 
                                    class="attendance-btn late ${studentAttendance.status === 'late' ? 'active' : ''}">
                                ⏰
                            </button>
                        </div>
                        
                        <input type="text" 
                               id="note-${student.id}"
                               placeholder="Izoh" 
                               value="${studentAttendance.note}"
                               class="px-3 py-1 border border-gray-300 rounded-lg text-sm w-32">
                    </div>
                </div>
            `;
        });
    }

    content += `
            </div>
        </div>
    `;

    document.getElementById('attendanceContainer').innerHTML = content;
}

function setAttendance(studentId, status) {
    const today = new Date().toISOString().split('T')[0];
    if (!attendance[today]) {
        attendance[today] = {};
    }

    if (!attendance[today][studentId]) {
        attendance[today][studentId] = { status: status, note: '' };
    } else {
        attendance[today][studentId].status = status;
    }

    // UI ni yangilash
    const studentElement = document.querySelector(`[onclick="setAttendance(${studentId}, 'present')"]`).parentElement.parentElement;
    const buttons = studentElement.querySelectorAll('.attendance-btn');
    buttons.forEach(btn => btn.classList.remove('active'));
    studentElement.querySelector(`.attendance-btn.${status}`).classList.add('active');
}

function markAllPresent(groupId) {
    const groupStudents = students.filter(s => s.groupId === groupId);
    const today = new Date().toISOString().split('T')[0];

    if (!attendance[today]) {
        attendance[today] = {};
    }

    groupStudents.forEach(student => {
        if (!attendance[today][student.id]) {
            attendance[today][student.id] = { status: 'present', note: '' };
        } else {
            attendance[today][student.id].status = 'present';
        }
    });

    // UI ni yangilash
    document.querySelectorAll('.attendance-btn.present').forEach(btn => {
        btn.classList.add('active');
        btn.parentElement.querySelectorAll('.attendance-btn:not(.present)').forEach(otherBtn => {
            otherBtn.classList.remove('active');
        });
    });

    showNotification('Barchasi "kelgan" deb belgilandi!', 'success');
}

function saveGroupAttendance(groupId) {
    const today = new Date().toISOString().split('T')[0];
    const groupStudents = students.filter(s => s.groupId === groupId);

    // Izohlarni yig'ish
    groupStudents.forEach(student => {
        const noteInput = document.getElementById(`note-${student.id}`);
        if (noteInput && attendance[today] && attendance[today][student.id]) {
            attendance[today][student.id].note = noteInput.value;
        }
    });

    // O'quvchilarning attendance maydonini yangilash
    groupStudents.forEach(student => {
        if (attendance[today] && attendance[today][student.id]) {
            const studentIndex = students.findIndex(s => s.id === student.id);
            if (studentIndex !== -1) {
                students[studentIndex].attendance = attendance[today][student.id].status;
            }
        }
    });

    saveToLocalStorage();
    showNotification('Davomat saqlandi!', 'success');
}

function saveAttendance() {
    showNotification('Davomat saqlandi!', 'success');
}

// ==================== DAVOMAT TARIXI FUNKSIYALARI ====================

function initAttendanceHistory() {
    updateAttendanceHistory();
    loadAttendanceCalendar();
    loadAttendanceHistory();
    updateAttendanceFilters();
}

function updateAttendanceHistory() {
    const today = new Date().toISOString().split('T')[0];

    if (!attendanceHistory[today]) {
        attendanceHistory[today] = {};
    }

    students.forEach(student => {
        if (!attendanceHistory[today][student.id]) {
            attendanceHistory[today][student.id] = {
                status: student.attendance,
                note: '',
                time: new Date().toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })
            };
        }
    });

    localStorage.setItem('attendanceHistory', JSON.stringify(attendanceHistory));
}

function loadAttendanceCalendar() {
    const calendarContainer = document.getElementById('attendanceCalendar');
    if (!calendarContainer) return;

    const monthNames = [
        'Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun',
        'Iyul', 'Avgust', 'Sentabr', 'Oktabr', 'Noyabr', 'Dekabr'
    ];

    document.getElementById('currentMonth').textContent =
        `${monthNames[currentMonth]} ${currentYear}`;

    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDay = firstDay.getDay();

    let calendarHTML = `
        <div class="attendance-calendar">
            <div class="calendar-header">Ya</div>
            <div class="calendar-header">Du</div>
            <div class="calendar-header">Se</div>
            <div class="calendar-header">Ch</div>
            <div class="calendar-header">Pa</div>
            <div class="calendar-header">Ju</div>
            <div class="calendar-header">Sh</div>
    `;

    for (let i = 0; i < startDay; i++) {
        calendarHTML += `<div class="calendar-day empty"></div>`;
    }

    const today = new Date();
    const isToday = (day) => {
        return day === today.getDate() &&
            currentMonth === today.getMonth() &&
            currentYear === today.getFullYear();
    };

    for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const dayAttendance = attendanceHistory[dateStr] || {};

        const attendanceCounts = {
            present: 0,
            absent: 0,
            late: 0
        };

        Object.values(dayAttendance).forEach(record => {
            if (record.status === 'present') attendanceCounts.present++;
            else if (record.status === 'absent') attendanceCounts.absent++;
            else if (record.status === 'late') attendanceCounts.late++;
        });

        const total = Object.keys(dayAttendance).length;
        const presentPercent = total > 0 ? Math.round((attendanceCounts.present / total) * 100) : 0;

        calendarHTML += `
            <div class="calendar-day ${isToday(day) ? 'today' : ''}" onclick="showDayAttendance('${dateStr}')">
                <div class="calendar-date">${day}</div>
                <div class="day-status">
                    ${attendanceCounts.present > 0 ? `
                        <div class="flex items-center">
                            <div class="status-dot present"></div>
                            <span class="text-xs text-green-600">${attendanceCounts.present}</span>
                        </div>
                    ` : ''}
                    ${attendanceCounts.absent > 0 ? `
                        <div class="flex items-center">
                            <div class="status-dot absent"></div>
                            <span class="text-xs text-red-600">${attendanceCounts.absent}</span>
                        </div>
                    ` : ''}
                    ${attendanceCounts.late > 0 ? `
                        <div class="flex items-center">
                            <div class="status-dot late"></div>
                            <span class="text-xs text-yellow-600">${attendanceCounts.late}</span>
                        </div>
                    ` : ''}
                </div>
                ${total > 0 ? `
                    <div class="attendance-stat">
                        ${presentPercent}% kelgan
                    </div>
                ` : ''}
            </div>
        `;
    }

    calendarHTML += `</div>`;
    calendarContainer.innerHTML = calendarHTML;
}

function prevMonth() {
    currentMonth--;
    if (currentMonth < 0) {
        currentMonth = 11;
        currentYear--;
    }
    loadAttendanceCalendar();
    loadAttendanceHistory();
}

function nextMonth() {
    currentMonth++;
    if (currentMonth > 11) {
        currentMonth = 0;
        currentYear++;
    }
    loadAttendanceCalendar();
    loadAttendanceHistory();
}

function showDayAttendance(dateStr) {
    const date = new Date(dateStr);
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const formattedDate = date.toLocaleDateString('uz-UZ', options);
    const dayAttendance = attendanceHistory[dateStr] || {};

    let modalContent = `
        <div class="modal-content">
            <h2 class="text-xl font-bold text-gray-800 mb-6">${formattedDate}</h2>
            
            <div class="mb-6 grid grid-cols-3 gap-4">
                <div class="stat-card-attendance present">
                    <div class="stat-value-attendance">
                        ${Object.values(dayAttendance).filter(r => r.status === 'present').length}
                    </div>
                    <div class="stat-label-attendance">Kelgan</div>
                </div>
                <div class="stat-card-attendance absent">
                    <div class="stat-value-attendance">
                        ${Object.values(dayAttendance).filter(r => r.status === 'absent').length}
                    </div>
                    <div class="stat-label-attendance">Kelmaganga</div>
                </div>
                <div class="stat-card-attendance late">
                    <div class="stat-value-attendance">
                        ${Object.values(dayAttendance).filter(r => r.status === 'late').length}
                    </div>
                    <div class="stat-label-attendance">Kech qolgan</div>
                </div>
            </div>
            
            <div class="space-y-3">
    `;

    if (Object.keys(dayAttendance).length === 0) {
        modalContent += `
            <div class="text-center py-8">
                <i class="fas fa-calendar-times text-4xl text-gray-300 mb-4"></i>
                <p class="text-gray-500">Bu kunda davomat qilinmagan</p>
            </div>
        `;
    } else {
        Object.keys(dayAttendance).forEach(studentId => {
            const student = students.find(s => s.id == studentId);
            if (!student) return;

            const record = dayAttendance[studentId];
            const group = groups.find(g => g.id === student.groupId);
            const statusClass = record.status === 'present' ? 'present' :
                record.status === 'absent' ? 'absent' : 'late';
            const statusText = record.status === 'present' ? 'Kelgan' :
                record.status === 'absent' ? 'Kelmaganga' : 'Kech qolgan';

            modalContent += `
                <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div class="flex items-center">
                        <div class="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold mr-3">
                            ${student.firstName.charAt(0)}${student.lastName.charAt(0)}
                        </div>
                        <div>
                            <div class="font-medium">${student.firstName} ${student.lastName}</div>
                            <div class="text-sm text-gray-500">${group ? group.name : 'Guruhsiz'}</div>
                        </div>
                    </div>
                    <div class="text-right">
                        <span class="status-badge ${statusClass}">${statusText}</span>
                        <div class="text-sm text-gray-500 mt-1">${record.time || ''}</div>
                    </div>
                </div>
            `;
        });
    }

    modalContent += `
            </div>
            
            <div class="mt-6 flex justify-end">
                <button onclick="editDayAttendance('${dateStr}')" 
                        class="btn-primary">
                    <i class="fas fa-edit mr-2"></i> Tahrirlash
                </button>
            </div>
        </div>
    `;

    showModal(modalContent);
}

function editDayAttendance(dateStr) {
    closeModal();

    const date = new Date(dateStr);
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const formattedDate = date.toLocaleDateString('uz-UZ', options);
    const dayAttendance = attendanceHistory[dateStr] || {};

    let modalContent = `
        <div class="modal-content">
            <h2 class="text-xl font-bold text-gray-800 mb-6">Davomatni Tahrirlash - ${formattedDate}</h2>
            
            <div class="space-y-3 mb-6">
    `;

    students.forEach(student => {
        const group = groups.find(g => g.id === student.groupId);
        const record = dayAttendance[student.id] || { status: 'present', note: '', time: '09:00' };

        modalContent += `
            <div class="p-3 border rounded-lg">
                <div class="flex justify-between items-center mb-3">
                    <div class="flex items-center">
                        <div class="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold mr-3 text-sm">
                            ${student.firstName.charAt(0)}${student.lastName.charAt(0)}
                        </div>
                        <div>
                            <div class="font-medium">${student.firstName} ${student.lastName}</div>
                            <div class="text-sm text-gray-500">${group ? group.name : 'Guruhsiz'}</div>
                        </div>
                    </div>
                </div>
                
                <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                        <label class="block text-sm text-gray-700 mb-1">Holat</label>
                        <select class="attendance-select form-control text-sm" 
                                data-student="${student.id}" 
                                data-date="${dateStr}">
                            <option value="present" ${record.status === 'present' ? 'selected' : ''}>Kelgan</option>
                            <option value="absent" ${record.status === 'absent' ? 'selected' : ''}>Kelmaganga</option>
                            <option value="late" ${record.status === 'late' ? 'selected' : ''}>Kech qolgan</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-sm text-gray-700 mb-1">Vaqt</label>
                        <input type="time" 
                               class="time-input form-control text-sm" 
                               value="${record.time || '09:00'}"
                               data-student="${student.id}" 
                               data-date="${dateStr}">
                    </div>
                    <div>
                        <label class="block text-sm text-gray-700 mb-1">Izoh</label>
                        <input type="text" 
                               class="note-input form-control text-sm" 
                               placeholder="Izoh..."
                               value="${record.note || ''}"
                               data-student="${student.id}" 
                               data-date="${dateStr}">
                    </div>
                </div>
            </div>
        `;
    });

    modalContent += `
            </div>
            
            <div class="flex justify-end space-x-3">
                <button onclick="closeModal()" 
                        class="btn-secondary">
                    Bekor qilish
                </button>
                <button onclick="saveDayAttendance('${dateStr}')" 
                        class="btn-primary">
                    Saqlash
                </button>
            </div>
        </div>
    `;

    showModal(modalContent);
}

function saveDayAttendance(dateStr) {
    if (!attendanceHistory[dateStr]) {
        attendanceHistory[dateStr] = {};
    }

    document.querySelectorAll('.attendance-select').forEach(select => {
        const studentId = select.getAttribute('data-student');
        const status = select.value;
        const time = document.querySelector(`.time-input[data-student="${studentId}"]`).value;
        const note = document.querySelector(`.note-input[data-student="${studentId}"]`).value;

        attendanceHistory[dateStr][studentId] = {
            status: status,
            time: time,
            note: note
        };

        const today = new Date().toISOString().split('T')[0];
        if (dateStr === today) {
            const studentIndex = students.findIndex(s => s.id == studentId);
            if (studentIndex !== -1) {
                students[studentIndex].attendance = status;
            }
        }
    });

    localStorage.setItem('attendanceHistory', JSON.stringify(attendanceHistory));
    saveToLocalStorage();

    closeModal();
    loadAttendanceCalendar();
    loadAttendanceHistory();
    showNotification('Davomat saqlandi!', 'success');
}

function loadAttendanceHistory() {
    const table = document.getElementById('attendanceHistoryTable');
    const info = document.getElementById('historyInfo');
    const pagination = document.getElementById('pagination');

    if (!table) return;

    const selectedGroup = document.getElementById('historyGroup').value;
    const selectedStudent = document.getElementById('historyStudent').value;
    const selectedStatus = document.getElementById('historyStatus').value;

    let allRecords = [];

    Object.keys(attendanceHistory).forEach(dateStr => {
        Object.keys(attendanceHistory[dateStr]).forEach(studentId => {
            const record = attendanceHistory[dateStr][studentId];
            const student = students.find(s => s.id == studentId);
            const group = student ? groups.find(g => g.id === student.groupId) : null;

            if (selectedGroup !== 'all' && group && group.id != selectedGroup) return;
            if (selectedStudent !== 'all' && student && student.id != selectedStudent) return;
            if (selectedStatus !== 'all' && record.status !== selectedStatus) return;
            if (!student) return;

            allRecords.push({
                date: dateStr,
                student: student,
                group: group,
                record: record
            });
        });
    });

    allRecords.sort((a, b) => new Date(b.date) - new Date(a.date));

    const totalRecords = allRecords.length;
    const totalPages = Math.ceil(totalRecords / recordsPerPage);
    const startIndex = (currentPage - 1) * recordsPerPage;
    const endIndex = startIndex + recordsPerPage;
    const pageRecords = allRecords.slice(startIndex, endIndex);

    table.innerHTML = '';

    if (pageRecords.length === 0) {
        table.innerHTML = `
            <tr>
                <td colspan="6" class="px-6 py-8 text-center">
                    <i class="fas fa-search text-4xl text-gray-300 mb-4"></i>
                    <p class="text-gray-500">Davomat yozuvlari topilmadi</p>
                </td>
            </tr>
        `;
    } else {
        pageRecords.forEach((item, index) => {
            const date = new Date(item.date);
            const formattedDate = date.toLocaleDateString('uz-UZ', {
                weekday: 'short',
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });

            const statusClass = item.record.status === 'present' ? 'present' :
                item.record.status === 'absent' ? 'absent' : 'late';
            const statusText = item.record.status === 'present' ? 'Kelgan' :
                item.record.status === 'absent' ? 'Kelmaganga' : 'Kech qolgan';

            const row = document.createElement('tr');
            row.className = 'attendance-row';
            row.innerHTML = `
                <td class="px-6 py-4">
                    <div class="font-medium">${formattedDate}</div>
                    <div class="text-sm text-gray-500">${date.toLocaleDateString('uz-UZ')}</div>
                </td>
                <td class="px-6 py-4">
                    <div class="font-medium">${item.student.firstName} ${item.student.lastName}</div>
                    <div class="text-sm text-gray-500">${item.student.phone}</div>
                </td>
                <td class="px-6 py-4">
                    <span class="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                        ${item.group ? item.group.name : 'Guruhsiz'}
                    </span>
                </td>
                <td class="px-6 py-4">
                    <span class="status-badge ${statusClass}">${statusText}</span>
                </td>
                <td class="px-6 py-4">
                    ${item.record.note || '<span class="text-gray-400">Izoh yo\'q</span>'}
                </td>
                <td class="px-6 py-4">
                    ${item.record.time || ''}
                </td>
            `;

            table.appendChild(row);
        });
    }

    info.textContent = `${startIndex + 1}-${Math.min(endIndex, totalRecords)} yozuv ${totalRecords} tadan ko'rsatilmoqda`;

    pagination.innerHTML = '';

    if (totalPages > 1) {
        const prevButton = document.createElement('button');
        prevButton.className = `page-btn ${currentPage === 1 ? 'disabled' : ''}`;
        prevButton.innerHTML = '<i class="fas fa-chevron-left"></i>';
        prevButton.onclick = () => {
            if (currentPage > 1) {
                currentPage--;
                loadAttendanceHistory();
            }
        };
        pagination.appendChild(prevButton);

        const maxPagesToShow = 5;
        let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
        let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

        if (endPage - startPage + 1 < maxPagesToShow) {
            startPage = Math.max(1, endPage - maxPagesToShow + 1);
        }

        for (let i = startPage; i <= endPage; i++) {
            const pageButton = document.createElement('button');
            pageButton.className = `page-btn ${i === currentPage ? 'active' : ''}`;
            pageButton.textContent = i;
            pageButton.onclick = () => {
                currentPage = i;
                loadAttendanceHistory();
            };
            pagination.appendChild(pageButton);
        }

        const nextButton = document.createElement('button');
        nextButton.className = `page-btn ${currentPage === totalPages ? 'disabled' : ''}`;
        nextButton.innerHTML = '<i class="fas fa-chevron-right"></i>';
        nextButton.onclick = () => {
            if (currentPage < totalPages) {
                currentPage++;
                loadAttendanceHistory();
            }
        };
        pagination.appendChild(nextButton);
    }
}

function updateAttendanceFilters() {
    const groupSelect = document.getElementById('historyGroup');
    const studentSelect = document.getElementById('historyStudent');

    if (groupSelect) {
        let groupOptions = '<option value="all">Barcha guruhlar</option>';
        groups.forEach(group => {
            groupOptions += `<option value="${group.id}">${group.name}</option>`;
        });
        groupSelect.innerHTML = groupOptions;

        let studentOptions = '<option value="all">Barcha o\'quvchilar</option>';
        students.forEach(student => {
            studentOptions += `<option value="${student.id}">${student.firstName} ${student.lastName}</option>`;
        });
        studentSelect.innerHTML = studentOptions;
    }
}

function exportAttendanceHistory() {
    let allRecords = [];

    Object.keys(attendanceHistory).forEach(dateStr => {
        Object.keys(attendanceHistory[dateStr]).forEach(studentId => {
            const record = attendanceHistory[dateStr][studentId];
            const student = students.find(s => s.id == studentId);
            const group = student ? groups.find(g => g.id === student.groupId) : null;

            if (student) {
                allRecords.push({
                    Sana: new Date(dateStr).toLocaleDateString('uz-UZ'),
                    'O\'quvchi': `${student.firstName} ${student.lastName}`,
                    Guruh: group ? group.name : 'Guruhsiz',
                    Telefon: student.phone,
                    Holat: record.status === 'present' ? 'Kelgan' :
                        record.status === 'absent' ? 'Kelmaganga' : 'Kech qolgan',
                    Izoh: record.note || '',
                    Vaqt: record.time || ''
                });
            }
        });
    });

    let csv = 'Sana,O\'quvchi,Guruh,Telefon,Holat,Izoh,Vaqt\n';

    allRecords.forEach(record => {
        csv += `"${record.Sana}","${record['O\'quvchi']}","${record.Guruh}","${record.Telefon}","${record.Holat}","${record.Izoh}","${record.Vaqt}"\n`;
    });

    const blob = new Blob(['\ufeff', csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `davomat-tarixi-${new Date().getTime()}.csv`;
    link.click();

    showNotification('Davomat tarixi Excel formatida yuklab olindi!', 'success');
}

function calculateAttendanceStats() {
    const stats = {
        totalDays: 0,
        presentDays: {},
        absentDays: {},
        lateDays: {},
        overallAttendance: {}
    };

    students.forEach(student => {
        let presentCount = 0;
        let totalCount = 0;

        Object.keys(attendanceHistory).forEach(dateStr => {
            if (attendanceHistory[dateStr][student.id]) {
                totalCount++;
                if (attendanceHistory[dateStr][student.id].status === 'present') {
                    presentCount++;
                }
            }
        });

        stats.overallAttendance[student.id] = {
            present: presentCount,
            total: totalCount,
            percentage: totalCount > 0 ? Math.round((presentCount / totalCount) * 100) : 0
        };
    });

    return stats;
}

function showMonthlyStats() {
    const stats = calculateAttendanceStats();

    let modalContent = `
        <div class="modal-content">
            <h2 class="text-xl font-bold text-gray-800 mb-6">Oylik Davomat Statistikasi</h2>
            
            <div class="mb-6">
                <h3 class="font-bold text-gray-700 mb-4">Umumiy statistika</h3>
                <div class="grid grid-cols-3 gap-4">
                    <div class="text-center p-4 bg-blue-50 rounded-lg">
                        <div class="text-2xl font-bold text-blue-600">
                            ${Object.keys(attendanceHistory).length}
                        </div>
                        <div class="text-sm text-gray-600">Kun</div>
                    </div>
                    <div class="text-center p-4 bg-green-50 rounded-lg">
                        <div class="text-2xl font-bold text-green-600">
                            ${students.length}
                        </div>
                        <div class="text-sm text-gray-600">O'quvchi</div>
                    </div>
                    <div class="text-center p-4 bg-purple-50 rounded-lg">
                        <div class="text-2xl font-bold text-purple-600">
                            ${groups.length}
                        </div>
                        <div class="text-sm text-gray-600">Guruh</div>
                    </div>
                </div>
            </div>
            
            <div class="space-y-4">
                <h3 class="font-bold text-gray-700">O'quvchilar bo'yicha statistika</h3>
    `;

    students.forEach(student => {
        const studentStats = stats.overallAttendance[student.id];
        const group = groups.find(g => g.id === student.groupId);

        modalContent += `
            <div class="p-3 border rounded-lg">
                <div class="flex justify-between items-center mb-2">
                    <div class="font-medium">${student.firstName} ${student.lastName}</div>
                    <span class="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                        ${group ? group.name : 'Guruhsiz'}
                    </span>
                </div>
                <div class="flex items-center">
                    <div class="flex-1">
                        <div class="text-sm text-gray-600 mb-1">
                            Davomat: ${studentStats.present}/${studentStats.total} kun
                        </div>
                        <div class="w-full bg-gray-200 rounded-full h-2">
                            <div class="bg-green-600 h-2 rounded-full" 
                                 style="width: ${studentStats.percentage}%"></div>
                        </div>
                    </div>
                    <div class="ml-4 text-lg font-bold ${studentStats.percentage >= 80 ? 'text-green-600' : studentStats.percentage >= 60 ? 'text-yellow-600' : 'text-red-600'}">
                        ${studentStats.percentage}%
                    </div>
                </div>
            </div>
        `;
    });

    modalContent += `
            </div>
        </div>
    `;

    showModal(modalContent);
}

// ==================== IMTIHONLAR FUNKSIYALARI ====================

function loadExams() {
    const container = document.getElementById('examsContainer');
    const groupFilter = document.getElementById('examGroupFilter').value;
    const typeFilter = document.getElementById('examTypeFilter').value;
    const statusFilter = document.getElementById('examStatusFilter').value;
    const searchTerm = document.getElementById('examSearch').value.toLowerCase();

    if (!container) return;

    container.innerHTML = '';

    let filteredExams = exams;

    if (groupFilter !== 'all') {
        filteredExams = filteredExams.filter(exam => exam.groupId == groupFilter);
    }

    if (typeFilter !== 'all') {
        filteredExams = filteredExams.filter(exam => exam.type === typeFilter);
    }

    if (statusFilter !== 'all') {
        filteredExams = filteredExams.filter(exam => exam.status === statusFilter);
    }

    if (searchTerm) {
        filteredExams = filteredExams.filter(exam =>
            exam.name.toLowerCase().includes(searchTerm) ||
            exam.description.toLowerCase().includes(searchTerm)
        );
    }

    if (filteredExams.length === 0) {
        container.innerHTML = `
            <div class="col-span-full text-center py-12">
                <div class="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i class="fas fa-clipboard-check text-3xl text-gray-400"></i>
                </div>
                <h3 class="text-lg font-medium text-gray-600 mb-2">Hali imtihonlar yo'q</h3>
                <p class="text-gray-500 mb-4">Birinchi imtihonni yarating</p>
                <button onclick="createNewExam()" 
                        class="px-6 py-3 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-lg">
                    <i class="fas fa-plus mr-2"></i> Imtihon Yaratish
                </button>
            </div>
        `;
        return;
    }

    filteredExams.forEach(exam => {
        const group = groups.find(g => g.id === exam.groupId);
        const groupName = group ? group.name : 'Guruhsiz';
        const results = examResults.filter(r => r.examId === exam.id);
        const participantsCount = results.length;

        const statusColors = {
            'draft': 'bg-gray-100 text-gray-800',
            'active': 'bg-green-100 text-green-800',
            'completed': 'bg-blue-100 text-blue-800'
        };

        const typeNames = {
            'quiz': 'Viktorina',
            'midterm': 'Oraliq nazorat',
            'final': 'Yakuniy imtihon',
            'test': 'Test',
            'survey': 'So\'rovnoma'
        };

        const card = document.createElement('div');
        card.className = 'bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow duration-300';
        card.innerHTML = `
            <div class="flex justify-between items-start mb-4">
                <div>
                    <h4 class="font-bold text-lg text-gray-800">${exam.name}</h4>
                    <span class="text-sm text-gray-500">${typeNames[exam.type] || exam.type}</span>
                </div>
                <span class="px-3 py-1 text-xs rounded-full ${statusColors[exam.status] || 'bg-gray-100'}">
                    ${exam.status === 'draft' ? 'Qoralama' :
                exam.status === 'active' ? 'Faol' : 'Yakunlangan'}
                </span>
            </div>
            
            <p class="text-gray-600 text-sm mb-4">${exam.description || 'Tavsif yo\'q'}</p>
            
            <div class="mb-4">
                <span class="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                    ${groupName}
                </span>
                <span class="ml-2 px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                    ${exam.maxScore} ball
                </span>
            </div>
            
            <div class="flex justify-between text-sm text-gray-500 mb-6">
                <div>
                    <i class="fas fa-users mr-1"></i>
                    <span>${participantsCount} ishtirokchi</span>
                </div>
                <div>
                    <i class="fas fa-question-circle mr-1"></i>
                    <span>${exam.questions?.length || 0} savol</span>
                </div>
            </div>
            
            <div class="flex justify-between">
                <div class="space-x-2">
                    <button onclick="viewExam(${exam.id})" 
                            class="px-3 py-1 bg-blue-600 text-white rounded-lg text-sm">
                        <i class="fas fa-eye mr-1"></i> Ko'rish
                    </button>
                    ${exam.status === 'draft' ? `
                    <button onclick="editExam(${exam.id})" 
                            class="px-3 py-1 bg-yellow-600 text-white rounded-lg text-sm">
                        <i class="fas fa-edit mr-1"></i> Tahrirlash
                    </button>
                    ` : ''}
                </div>
                <div>
                    ${exam.status === 'active' ? `
                    <button onclick="startExam(${exam.id})" 
                            class="px-3 py-1 bg-green-600 text-white rounded-lg text-sm">
                        <i class="fas fa-play mr-1"></i> Boshlash
                    </button>
                    ` : ''}
                    ${exam.status === 'completed' ? `
                    <button onclick="viewExamResults(${exam.id})" 
                            class="px-3 py-1 bg-purple-600 text-white rounded-lg text-sm">
                        <i class="fas fa-chart-bar mr-1"></i> Natijalar
                    </button>
                    ` : ''}
                </div>
            </div>
        `;

        container.appendChild(card);
    });

    loadExamResultsTable();
}

function loadExamResultsTable() {
    const table = document.getElementById('examResultsTable');
    if (!table) return;

    table.innerHTML = '';

    const recentResults = examResults
        .sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt))
        .slice(0, 5);

    if (recentResults.length === 0) {
        table.innerHTML = `
            <tr>
                <td colspan="7" class="px-6 py-4 text-center text-gray-500">
                    Hali imtihon natijalari mavjud emas
                </td>
            </tr>
        `;
        return;
    }

    recentResults.forEach(result => {
        const exam = exams.find(e => e.id === result.examId);
        const student = students.find(s => s.id === result.studentId);
        const group = student ? groups.find(g => g.id === student.groupId) : null;

        if (!exam || !student) return;

        const percentage = Math.round((result.score / exam.maxScore) * 100);
        const grade = getGradeFromScore(percentage);

        const row = document.createElement('tr');
        row.className = 'hover:bg-gray-50';
        row.innerHTML = `
            <td class="px-6 py-4">
                <div class="flex items-center">
                    <div class="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm mr-3">
                        ${student.firstName.charAt(0)}${student.lastName.charAt(0)}
                    </div>
                    <div>
                        <div class="font-medium">${student.firstName} ${student.lastName}</div>
                    </div>
                </div>
            </td>
            <td class="px-6 py-4">${exam.name}</td>
            <td class="px-6 py-4">${group ? group.name : 'Guruhsiz'}</td>
            <td class="px-6 py-4">
                <span class="font-bold ${grade === 'A' ? 'text-green-600' :
                grade === 'B' ? 'text-blue-600' :
                    grade === 'C' ? 'text-yellow-600' :
                        grade === 'D' ? 'text-orange-600' : 'text-red-600'}">
                    ${result.score}/${exam.maxScore} (${grade})
                </span>
            </td>
            <td class="px-6 py-4">
                <span class="px-2 py-1 bg-gray-100 text-gray-800 rounded text-sm">
                    #${result.rank || '-'}
                </span>
            </td>
            <td class="px-6 py-4">${new Date(result.completedAt).toLocaleDateString('uz-UZ')}</td>
            <td class="px-6 py-4">
                <button onclick="viewStudentResult(${result.id})" 
                        class="text-blue-600 hover:text-blue-800">
                    <i class="fas fa-external-link-alt"></i>
                </button>
            </td>
        `;

        table.appendChild(row);
    });
}

function createNewExam() {
    const modal = document.getElementById('examModal');
    const title = document.getElementById('examModalTitle');
    const form = document.getElementById('examForm');
    const groupSelect = document.getElementById('examGroup');

    groupSelect.innerHTML = '<option value="">Tanlang</option>' +
        groups.map(g => `<option value="${g.id}">${g.name} (Kurs ${g.course})</option>`).join('');

    title.textContent = 'Yangi Imtihon';
    form.reset();
    document.getElementById('examId').value = '';
    document.getElementById('questionsContainer').innerHTML = '';

    modal.classList.remove('hidden');
}

function editExam(id) {
    const exam = exams.find(e => e.id === id);
    if (!exam) return;

    const modal = document.getElementById('examModal');
    const title = document.getElementById('examModalTitle');
    const form = document.getElementById('examForm');
    const groupSelect = document.getElementById('examGroup');

    groupSelect.innerHTML = '<option value="">Tanlang</option>' +
        groups.map(g => `<option value="${g.id}">${g.name} (Kurs ${g.course})</option>`).join('');

    title.textContent = 'Imtihonni Tahrirlash';
    document.getElementById('examId').value = exam.id;
    document.getElementById('examName').value = exam.name;
    document.getElementById('examType').value = exam.type;
    document.getElementById('examGroup').value = exam.groupId;
    document.getElementById('maxScore').value = exam.maxScore;
    document.getElementById('startTime').value = exam.startTime || '';
    document.getElementById('endTime').value = exam.endTime || '';
    document.getElementById('duration').value = exam.duration || '';
    document.getElementById('examDescription').value = exam.description || '';

    loadQuestions(exam.questions || []);

    modal.classList.remove('hidden');
}

function loadQuestions(questions) {
    const container = document.getElementById('questionsContainer');
    container.innerHTML = '';

    questions.forEach((question, index) => {
        const questionElement = document.createElement('div');
        questionElement.className = 'border rounded-lg p-4 bg-gray-50';
        questionElement.innerHTML = `
            <div class="flex justify-between items-start mb-3">
                <div>
                    <span class="font-medium">${index + 1}. ${question.text}</span>
                    <span class="ml-3 text-sm text-gray-500">(${question.score} ball)</span>
                </div>
                <div class="flex space-x-2">
                    <button onclick="editQuestion(${index})" 
                            class="text-blue-600 hover:text-blue-800">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button onclick="deleteQuestion(${index})" 
                            class="text-red-600 hover:text-red-800">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
            <div class="text-sm text-gray-600">
                Turi: ${getQuestionTypeName(question.type)} | 
                To'g'ri javob: ${question.correctAnswer}
            </div>
            ${question.options ? `
                <div class="mt-2 text-sm">
                    <div class="font-medium mb-1">Variantlar:</div>
                    <ul class="list-disc list-inside">
                        ${question.options.map(opt => `<li>${opt}</li>`).join('')}
                    </ul>
                </div>
            ` : ''}
        `;
        questionElement.dataset.index = index;
        questionElement.dataset.question = JSON.stringify(question);
        container.appendChild(questionElement);
    });
}

function addQuestion() {
    const modal = document.getElementById('questionModal');
    const title = document.getElementById('questionModalTitle');
    const form = document.getElementById('questionForm');

    title.textContent = 'Yangi Savol';
    form.reset();
    document.getElementById('questionId').value = '';
    document.getElementById('optionsList').innerHTML = '';

    for (let i = 0; i < 4; i++) {
        addOption();
    }

    modal.classList.remove('hidden');
}

function addOption() {
    const container = document.getElementById('optionsList');
    const optionIndex = container.children.length;

    const optionDiv = document.createElement('div');
    optionDiv.className = 'flex items-center space-x-3';
    optionDiv.innerHTML = `
        <input type="checkbox" id="correct-${optionIndex}" class="correct-checkbox">
        <input type="text" class="form-control flex-1 option-input" 
               placeholder="Variant ${optionIndex + 1}">
        <button type="button" onclick="this.parentElement.remove()" 
                class="text-red-600 hover:text-red-800">
            <i class="fas fa-times"></i>
        </button>
    `;

    container.appendChild(optionDiv);
}

function toggleAnswerOptions() {
    const type = document.getElementById('questionType').value;
    const optionsContainer = document.getElementById('optionsContainer');
    const correctAnswerContainer = document.getElementById('correctAnswerContainer');

    if (type === 'multiple_choice' || type === 'single_choice' || type === 'true_false' || type === 'matching') {
        optionsContainer.style.display = 'block';

        if (type === 'true_false') {
            document.getElementById('optionsList').innerHTML = `
                <div class="flex items-center space-x-3">
                    <input type="radio" name="true_false" value="true" class="correct-radio">
                    <span>To'g'ri</span>
                </div>
                <div class="flex items-center space-x-3">
                    <input type="radio" name="true_false" value="false" class="correct-radio">
                    <span>Noto'g'ri</span>
                </div>
            `;
        } else if (type === 'matching') {
            document.getElementById('optionsList').innerHTML = `
                <div class="space-y-2">
                    <div class="grid grid-cols-2 gap-2">
                        <input type="text" class="form-control matching-left" placeholder="So'z">
                        <input type="text" class="form-control matching-right" placeholder="Ta'rif">
                    </div>
                    <div class="grid grid-cols-2 gap-2">
                        <input type="text" class="form-control matching-left" placeholder="So'z">
                        <input type="text" class="form-control matching-right" placeholder="Ta'rif">
                    </div>
                </div>
            `;
        }
    } else {
        optionsContainer.style.display = 'none';
    }

    if (type === 'essay') {
        correctAnswerContainer.innerHTML = `
            <textarea id="correctAnswer" rows="4" class="form-control" 
                      placeholder="Namuna javob..."></textarea>
        `;
    } else {
        correctAnswerContainer.innerHTML = `
            <input type="text" id="correctAnswer" required class="form-control">
        `;
    }
}

function saveQuestion() {
    const type = document.getElementById('questionType').value;
    const options = [];

    if (type === 'multiple_choice' || type === 'single_choice') {
        document.querySelectorAll('.option-input').forEach(input => {
            if (input.value.trim()) {
                options.push(input.value.trim());
            }
        });
    } else if (type === 'true_false') {
        options.push('To\'g\'ri', 'Noto\'g\'ri');
    }

    const question = {
        id: Date.now(),
        text: document.getElementById('questionText').value,
        type: type,
        options: options.length > 0 ? options : null,
        correctAnswer: document.getElementById('correctAnswer').value,
        score: parseFloat(document.getElementById('questionScore').value) || 1
    };

    closeQuestionModal();
    return question;
}

function saveExam() {
    const examId = document.getElementById('examId').value;
    const questions = [];

    document.querySelectorAll('#questionsContainer > div').forEach(div => {
        const questionData = div.dataset.question;
        if (questionData) {
            questions.push(JSON.parse(questionData));
        }
    });

    const exam = {
        id: examId || Date.now(),
        name: document.getElementById('examName').value,
        type: document.getElementById('examType').value,
        groupId: parseInt(document.getElementById('examGroup').value),
        maxScore: parseInt(document.getElementById('maxScore').value),
        startTime: document.getElementById('startTime').value || null,
        endTime: document.getElementById('endTime').value || null,
        duration: document.getElementById('duration').value ?
            parseInt(document.getElementById('duration').value) : null,
        description: document.getElementById('examDescription').value,
        questions: questions,
        status: 'draft',
        createdAt: new Date().toISOString(),
        createdBy: currentUser.id
    };

    if (examId) {
        const index = exams.findIndex(e => e.id == examId);
        exams[index] = exam;
    } else {
        exams.push(exam);
    }

    saveExamsToStorage();
    loadExams();
    closeExamModal();
    showNotification('Imtihon saqlandi!', 'success');
}

function saveExamAsDraft() {
    const exam = getExamFromForm();
    exam.status = 'draft';

    if (exam.id) {
        const index = exams.findIndex(e => e.id == exam.id);
        exams[index] = exam;
    } else {
        exam.id = Date.now();
        exams.push(exam);
    }

    saveExamsToStorage();
    loadExams();
    closeExamModal();
    showNotification('Imtihon qoralama sifatida saqlandi!', 'success');
}

function activateExam() {
    const exam = getExamFromForm();
    exam.status = 'active';

    if (exam.id) {
        const index = exams.findIndex(e => e.id == exam.id);
        exams[index] = exam;
    } else {
        exam.id = Date.now();
        exams.push(exam);
    }

    saveExamsToStorage();
    loadExams();
    closeExamModal();
    showNotification('Imtihon faollashtirildi! Endi o\'quvchilar topshira oladi!', 'success');
}

function saveExamsToStorage() {
    localStorage.setItem('exams', JSON.stringify(exams));
    localStorage.setItem('examResults', JSON.stringify(examResults));
}

function viewExam(id) {
    const exam = exams.find(e => e.id === id);
    if (!exam) return;

    const group = groups.find(g => g.id === exam.groupId);
    const results = examResults.filter(r => r.examId === exam.id);

    let modalContent = `
        <div class="modal-content" style="max-width: 800px;">
            <h2 class="text-2xl font-bold text-gray-800 mb-6">${exam.name}</h2>
            
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div class="bg-blue-50 p-4 rounded-lg">
                    <div class="text-lg font-bold text-blue-600">${exam.maxScore}</div>
                    <div class="text-sm text-gray-600">Maksimal ball</div>
                </div>
                <div class="bg-green-50 p-4 rounded-lg">
                    <div class="text-lg font-bold text-green-600">${results.length}</div>
                    <div class="text-sm text-gray-600">Ishtirokchilar</div>
                </div>
                <div class="bg-purple-50 p-4 rounded-lg">
                    <div class="text-lg font-bold text-purple-600">${exam.questions?.length || 0}</div>
                    <div class="text-sm text-gray-600">Savollar</div>
                </div>
            </div>
            
            <div class="mb-6">
                <h3 class="font-bold text-gray-700 mb-3">Imtihon haqida</h3>
                <p class="text-gray-600 mb-2">${exam.description || 'Tavsif yo\'q'}</p>
                <div class="flex space-x-3">
                    <span class="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                        ${group ? group.name : 'Guruhsiz'}
                    </span>
                    <span class="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                        ${exam.status === 'draft' ? 'Qoralama' :
            exam.status === 'active' ? 'Faol' : 'Yakunlangan'}
                    </span>
                </div>
            </div>
            
            <div class="mb-6">
                <h3 class="font-bold text-gray-700 mb-3">Savollar (${exam.questions?.length || 0})</h3>
                <div class="space-y-4">
    `;

    exam.questions?.forEach((question, index) => {
        modalContent += `
            <div class="border rounded-lg p-4">
                <div class="font-medium mb-2">${index + 1}. ${question.text}</div>
                <div class="text-sm text-gray-600">
                    <span class="mr-3">Turi: ${getQuestionTypeName(question.type)}</span>
                    <span class="mr-3">Ball: ${question.score}</span>
                    <span>To'g'ri javob: ${question.correctAnswer}</span>
                </div>
                ${question.options ? `
                    <div class="mt-2">
                        <div class="text-sm font-medium mb-1">Variantlar:</div>
                        <ul class="list-disc list-inside text-sm text-gray-600">
                            ${question.options.map(opt => `<li>${opt}</li>`).join('')}
                        </ul>
                    </div>
                ` : ''}
            </div>
        `;
    });

    modalContent += `
                </div>
            </div>
            
            <div class="flex justify-end space-x-3">
                <button onclick="closeModal()" 
                        class="btn-secondary">
                    Yopish
                </button>
                ${exam.status === 'draft' ? `
                <button onclick="editExam(${exam.id})" 
                        class="btn-primary">
                    Tahrirlash
                </button>
                ` : ''}
                ${exam.status === 'completed' ? `
                <button onclick="viewExamResults(${exam.id})" 
                        class="btn-primary">
                    Natijalarni Ko'rish
                </button>
                ` : ''}
                ${exam.status === 'active' ? `
                <button onclick="startExamForStudent(${exam.id})" 
                        class="btn-primary">
                    Imtihonni Boshlash
                </button>
                ` : ''}
            </div>
        </div>
    `;

    showModal(modalContent);
}

function viewExamResults(examId) {
    const exam = exams.find(e => e.id === examId);
    if (!exam) return;

    const results = examResults.filter(r => r.examId === examId);
    const group = groups.find(g => g.id === exam.groupId);

    results.sort((a, b) => b.score - a.score);

    results.forEach((result, index) => {
        result.rank = index + 1;
    });

    const totalParticipants = results.length;
    const averageScore = totalParticipants > 0 ?
        (results.reduce((sum, r) => sum + r.score, 0) / totalParticipants).toFixed(1) : 0;
    const highestScore = totalParticipants > 0 ? Math.max(...results.map(r => r.score)) : 0;
    const lowestScore = totalParticipants > 0 ? Math.min(...results.map(r => r.score)) : 0;

    document.getElementById('resultsModalTitle').textContent = `${exam.name} - Natijalar`;
    document.getElementById('totalParticipants').textContent = totalParticipants;
    document.getElementById('averageScore').textContent = averageScore;
    document.getElementById('highestScore').textContent = highestScore;
    document.getElementById('lowestScore').textContent = lowestScore;

    const table = document.getElementById('resultsDetailsTable');
    table.innerHTML = '';

    if (totalParticipants === 0) {
        table.innerHTML = `
            <tr>
                <td colspan="7" class="px-6 py-8 text-center text-gray-500">
                    Hali imtihon natijalari mavjud emas
                </td>
            </tr>
        `;
    } else {
        results.forEach(result => {
            const student = students.find(s => s.id === result.studentId);
            if (!student) return;

            const percentage = Math.round((result.score / exam.maxScore) * 100);
            const grade = getGradeFromScore(percentage);

            const row = document.createElement('tr');
            row.className = 'hover:bg-gray-50';
            row.innerHTML = `
                <td class="px-6 py-4">
                    <span class="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                        #${result.rank}
                    </span>
                </td>
                <td class="px-6 py-4">
                    <div class="flex items-center">
                        <div class="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm mr-3">
                            ${student.firstName.charAt(0)}${student.lastName.charAt(0)}
                        </div>
                        <div class="font-medium">${student.firstName} ${student.lastName}</div>
                    </div>
                </td>
                <td class="px-6 py-4 font-bold ${grade === 'A' ? 'text-green-600' :
                    grade === 'B' ? 'text-blue-600' :
                        grade === 'C' ? 'text-yellow-600' :
                            grade === 'D' ? 'text-orange-600' : 'text-red-600'}">
                    ${result.score}/${exam.maxScore}
                </td>
                <td class="px-6 py-4">
                    <div class="flex items-center">
                        <div class="w-full bg-gray-200 rounded-full h-2 mr-3">
                            <div class="bg-green-600 h-2 rounded-full" 
                                 style="width: ${percentage}%"></div>
                        </div>
                        <span>${percentage}%</span>
                    </div>
                </td>
                <td class="px-6 py-4">
                    ${new Date(result.completedAt).toLocaleTimeString('uz-UZ', {
                                hour: '2-digit', minute: '2-digit'
                            })}
                </td>
                <td class="px-6 py-4">
                    <span class="px-2 py-1 ${percentage >= 60 ? 'bg-green-100 text-green-800' :
                    'bg-red-100 text-red-800'} rounded text-sm">
                        ${percentage >= 60 ? "O'tdi" : "O'ta olmadi"}
                    </span>
                </td>
                <td class="px-6 py-4">
                    <button onclick="viewDetailedResult(${result.id})" 
                            class="text-blue-600 hover:text-blue-800">
                        <i class="fas fa-search"></i>
                    </button>
                </td>
            `;

            table.appendChild(row);
        });
    }

    document.getElementById('resultsModal').classList.remove('hidden');
}

function getGradeFromScore(percentage) {
    if (percentage >= 90) return 'A';
    if (percentage >= 80) return 'B';
    if (percentage >= 70) return 'C';
    if (percentage >= 60) return 'D';
    return 'F';
}

function getQuestionTypeName(type) {
    const types = {
        'multiple_choice': 'Ko\'p tanlovli',
        'single_choice': 'Bitta tanlov',
        'true_false': 'To\'g\'ri/Noto\'g\'ri',
        'short_answer': 'Qisqa javob',
        'essay': 'Insho',
        'matching': 'Moslashtirish'
    };
    return types[type] || type;
}

function getExamFromForm() {
    const questions = [];
    document.querySelectorAll('#questionsContainer > div').forEach(div => {
        const questionData = div.dataset.question;
        if (questionData) {
            questions.push(JSON.parse(questionData));
        }
    });

    return {
        id: document.getElementById('examId').value || Date.now(),
        name: document.getElementById('examName').value,
        type: document.getElementById('examType').value,
        groupId: parseInt(document.getElementById('examGroup').value),
        maxScore: parseInt(document.getElementById('maxScore').value),
        startTime: document.getElementById('startTime').value || null,
        endTime: document.getElementById('endTime').value || null,
        duration: document.getElementById('duration').value ?
            parseInt(document.getElementById('duration').value) : null,
        description: document.getElementById('examDescription').value,
        questions: questions,
        createdAt: new Date().toISOString(),
        createdBy: currentUser.id
    };
}

function closeExamModal() {
    document.getElementById('examModal').classList.add('hidden');
}

function closeQuestionModal() {
    document.getElementById('questionModal').classList.add('hidden');
}

function closeResultsModal() {
    document.getElementById('resultsModal').classList.add('hidden');
}

function startExamForStudent(examId) {
    const exam = exams.find(e => e.id === examId);
    if (!exam) return;

    const now = new Date();
    if (exam.startTime && new Date(exam.startTime) > now) {
        showNotification('Imtihon hali boshlanmagan!', 'error');
        return;
    }

    if (exam.endTime && new Date(exam.endTime) < now) {
        showNotification('Imtihon vaqti tugagan!', 'error');
        return;
    }

    const existingResult = examResults.find(r =>
        r.examId === examId && r.studentId === currentUser.id
    );

    if (existingResult) {
        showNotification('Siz bu imtihonni allaqachon topshirgansiz!', 'error');
        return;
    }

    showExamPage(exam);
}

function showExamPage(exam) {
    let modalContent = `
        <div class="modal-content" style="max-width: 800px;">
            <div class="flex justify-between items-center mb-6">
                <h2 class="text-2xl font-bold text-gray-800">${exam.name}</h2>
                <div id="examTimer" class="text-lg font-bold text-red-600">
                    ${exam.duration ? formatTime(exam.duration * 60) : 'Cheklovsiz'}
                </div>
            </div>
            
            <div class="mb-6 p-4 bg-blue-50 rounded-lg">
                <h3 class="font-bold text-gray-700 mb-2">Ko'rsatmalar:</h3>
                <ul class="list-disc list-inside text-gray-600">
                    <li>Barcha savollarga javob bering</li>
                    <li>Vaqt chegarasi: ${exam.duration ? exam.duration + ' daqiqa' : 'Cheklovsiz'}</li>
                    <li>Savollarga qaytish imkoniyati mavjud</li>
                    <li>Yakunlash tugmasini bosgandan so'ng javoblarni o'zgartira olmaysiz</li>
                </ul>
            </div>
            
            <form id="examSubmissionForm" class="space-y-6">
                <input type="hidden" id="examId" value="${exam.id}">
    `;

    exam.questions?.forEach((question, index) => {
        modalContent += `
            <div class="border rounded-lg p-4">
                <div class="font-medium mb-3">${index + 1}. ${question.text}</div>
                <div class="text-sm text-gray-500 mb-3">(${question.score} ball)</div>
                
                ${renderQuestionInput(question, index)}
            </div>
        `;
    });

    modalContent += `
                <div class="flex justify-between pt-6 border-t">
                    <button type="button" onclick="closeModal()" 
                            class="btn-secondary">
                        Chiqish
                    </button>
                    <button type="submit" 
                            class="btn-primary">
                        Imtihonni Yakunlash
                    </button>
                </div>
            </form>
        </div>
    `;

    showModal(modalContent);

    if (exam.duration) {
        startExamTimer(exam.duration * 60);
    }
}

function renderQuestionInput(question, index) {
    let html = '';

    switch (question.type) {
        case 'multiple_choice':
            html = `<div class="space-y-2">`;
            question.options?.forEach((option, optIndex) => {
                html += `
                    <label class="flex items-center">
                        <input type="checkbox" 
                               name="question-${index}" 
                               value="${option}"
                               class="mr-2">
                        ${option}
                    </label>
                `;
            });
            html += `</div>`;
            break;

        case 'single_choice':
        case 'true_false':
            html = `<div class="space-y-2">`;
            question.options?.forEach((option, optIndex) => {
                html += `
                    <label class="flex items-center">
                        <input type="radio" 
                               name="question-${index}" 
                               value="${option}"
                               class="mr-2">
                        ${option}
                    </label>
                `;
            });
            html += `</div>`;
            break;

        case 'short_answer':
            html = `
                <input type="text" 
                       name="question-${index}"
                       class="form-control"
                       placeholder="Javobingizni kiriting...">
            `;
            break;

        case 'essay':
            html = `
                <textarea name="question-${index}"
                          rows="4"
                          class="form-control"
                          placeholder="Javobingizni batafsil yozing..."></textarea>
            `;
            break;

        case 'matching':
            html = `<div class="space-y-2">`;
            html += `Moslashtirish savollari bu yerda ko'rsatiladi`;
            html += `</div>`;
            break;

        default:
            html = `<input type="text" name="question-${index}" class="form-control">`;
    }

    return html;
}

function startExamTimer(totalSeconds) {
    const timerElement = document.getElementById('examTimer');
    if (!timerElement) return;

    let remainingSeconds = totalSeconds;

    const timer = setInterval(() => {
        if (remainingSeconds <= 0) {
            clearInterval(timer);
            showNotification('Vaqt tugadi! Imtihon avtomatik yakunlandi.', 'error');
            submitExam();
            return;
        }

        remainingSeconds--;
        timerElement.textContent = formatTime(remainingSeconds);
    }, 1000);
}

function formatTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function submitExam() {
    const examId = document.getElementById('examId').value;
    const exam = exams.find(e => e.id == examId);

    if (!exam) return;

    let totalScore = 0;
    const answers = [];

    exam.questions?.forEach((question, index) => {
        const answer = getAnswerFromForm(index, question.type);
        const isCorrect = checkAnswer(answer, question.correctAnswer, question.type);
        const score = isCorrect ? question.score : 0;

        totalScore += score;

        answers.push({
            questionId: question.id,
            questionText: question.text,
            answer: answer,
            correctAnswer: question.correctAnswer,
            isCorrect: isCorrect,
            score: score,
            maxScore: question.score
        });
    });

    const result = {
        id: Date.now(),
        examId: exam.id,
        studentId: currentUser.id,
        score: totalScore,
        maxScore: exam.maxScore,
        answers: answers,
        completedAt: new Date().toISOString(),
        timeSpent: 0
    };

    examResults.push(result);
    saveExamsToStorage();

    updateExamStatus(exam.id);

    closeModal();
    showNotification(`Imtihon topshirildi! Sizning balingiz: ${totalScore}/${exam.maxScore}`, 'success');
}

function getAnswerFromForm(index, type) {
    if (type === 'multiple_choice') {
        const checkboxes = document.querySelectorAll(`input[name="question-${index}"]:checked`);
        return Array.from(checkboxes).map(cb => cb.value);
    } else if (type === 'single_choice' || type === 'true_false') {
        const radio = document.querySelector(`input[name="question-${index}"]:checked`);
        return radio ? radio.value : '';
    } else {
        const input = document.querySelector(`[name="question-${index}"]`);
        return input ? input.value : '';
    }
}

function checkAnswer(answer, correctAnswer, type) {
    if (!answer) return false;

    switch (type) {
        case 'multiple_choice':
            const correctAnswers = Array.isArray(correctAnswer) ?
                correctAnswer : [correctAnswer];
            return JSON.stringify(answer.sort()) === JSON.stringify(correctAnswers.sort());

        case 'single_choice':
        case 'true_false':
            return answer === correctAnswer;

        case 'short_answer':
            return answer.trim().toLowerCase() === correctAnswer.trim().toLowerCase();

        case 'essay':
            return answer.trim().length > 10;

        default:
            return false;
    }
}

function updateExamStatus(examId) {
    const exam = exams.find(e => e.id === examId);
    if (!exam) return;

    const groupStudents = students.filter(s => s.groupId === exam.groupId);
    const completedResults = examResults.filter(r => r.examId === examId);

    if (groupStudents.length > 0 && completedResults.length >= groupStudents.length) {
        const examIndex = exams.findIndex(e => e.id === examId);
        exams[examIndex].status = 'completed';
        saveExamsToStorage();
    }
}

function importGoogleForm() {
    showNotification('Google Forms dan import qilish funksiyasi keyingi versiyada!', 'info');
}

function exportExamResults() {
    const examId = document.querySelector('#examId')?.value;
    if (!examId) return;

    const exam = exams.find(e => e.id == examId);
    const results = examResults.filter(r => r.examId == examId);

    if (!exam || results.length === 0) {
        showNotification('Eksport qilish uchun natijalar mavjud emas!', 'error');
        return;
    }

    let csv = 'O\'rin,O\'quvchi,Ball,Maksimal Ball,Foiz,Grade,Vaqt\n';

    results.forEach(result => {
        const student = students.find(s => s.id === result.studentId);
        if (!student) return;

        const percentage = Math.round((result.score / exam.maxScore) * 100);
        const grade = getGradeFromScore(percentage);

        csv += `"${result.rank || '-'}","${student.firstName} ${student.lastName}",${result.score},${exam.maxScore},${percentage}%,"${grade}","${new Date(result.completedAt).toLocaleString('uz-UZ')}"\n`;
    });

    const blob = new Blob(['\ufeff', csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `imtihon-natijalari-${exam.name}-${new Date().getTime()}.csv`;
    link.click();

    showNotification('Natijalar Excel formatida yuklab olindi!', 'success');
}

// ==================== EMAIL FUNKSIYALARI ====================

function toggleReportFields() {
    const reportType = document.getElementById('reportType').value;
    const container = document.getElementById('reportFields');

    let html = '';

    switch (reportType) {
        case 'attendance':
            html = `
                <div>
                    <label class="block text-gray-700 mb-2">Guruh</label>
                    <select id="reportGroup" class="form-control">
                        <option value="all">Barcha guruhlar</option>
                    </select>
                </div>
                <div>
                    <label class="block text-gray-700 mb-2">Sana oralig'i</label>
                    <div class="grid grid-cols-2 gap-3">
                        <input type="date" id="reportStart" class="form-control">
                        <input type="date" id="reportEnd" class="form-control">
                    </div>
                </div>
                <div class="flex items-center">
                    <input type="checkbox" id="sendToParents" class="mr-3">
                    <label for="sendToParents" class="text-gray-700">
                        Ota-onalarga email orqali yuborish
                    </label>
                </div>
            `;
            break;

        case 'exam_results':
            html = `
                <div>
                    <label class="block text-gray-700 mb-2">Imtihon</label>
                    <select id="reportExam" class="form-control">
                        <option value="">Tanlang</option>
                    </select>
                </div>
                <div>
                    <label class="block text-gray-700 mb-2">Guruh</label>
                    <select id="reportGroup" class="form-control">
                        <option value="all">Barcha guruhlar</option>
                    </select>
                </div>
                <div class="flex items-center">
                    <input type="checkbox" id="sendToParents" class="mr-3" checked>
                    <label for="sendToParents" class="text-gray-700">
                        Ota-onalarga email orqali yuborish
                    </label>
                </div>
                <div class="flex items-center">
                    <input type="checkbox" id="includeRanking" class="mr-3" checked>
                    <label for="includeRanking" class="text-gray-700">
                        Reytingni qo'shish
                    </label>
                </div>
            `;
            break;

        case 'parent_notification':
            html = `
                <div>
                    <label class="block text-gray-700 mb-2">Xabar turi</label>
                    <select id="notificationType" class="form-control">
                        <option value="attendance">Davomat haqida</option>
                        <option value="grades">Bahlar haqida</option>
                        <option value="exam">Imtihon haqida</option>
                        <option value="event">Tadbir haqida</option>
                        <option value="payment">To'lov haqida</option>
                        <option value="general">Umumiy xabar</option>
                    </select>
                </div>
                <div>
                    <label class="block text-gray-700 mb-2">Qabul qiluvchilar</label>
                    <select id="recipientsGroup" class="form-control">
                        <option value="all">Barcha ota-onalar</option>
                        <option value="specific_group">Maxsus guruh</option>
                        <option value="specific_students">Maxsus o'quvchilar</option>
                        <option value="low_attendance">Past davomatli o'quvchilar</option>
                        <option value="low_grades">Past baholi o'quvchilar</option>
                    </select>
                </div>
                <div id="specificGroupContainer" class="hidden">
                    <label class="block text-gray-700 mb-2">Guruh</label>
                    <select id="specificGroup" class="form-control">
                        <option value="">Tanlang</option>
                    </select>
                </div>
                <div class="flex items-center">
                    <input type="checkbox" id="sendSMS" class="mr-3">
                    <label for="sendSMS" class="text-gray-700">
                        SMS xabar ham yuborish
                    </label>
                </div>
            `;
            break;

        default:
            html = `
                <div>
                    <label class="block text-gray-700 mb-2">Guruh</label>
                    <select id="reportGroup" class="form-control">
                        <option value="all">Barcha guruhlar</option>
                    </select>
                </div>
                <div>
                    <label class="block text-gray-700 mb-2">Sana oralig'i</label>
                    <div class="grid grid-cols-2 gap-3">
                        <input type="date" id="reportStart" class="form-control">
                        <input type="date" id="reportEnd" class="form-control">
                    </div>
                </div>
            `;
    }

    container.innerHTML = html;

    if (reportType === 'attendance' || reportType === 'grades' || reportType === 'students' || reportType === 'monthly') {
        loadGroupsIntoSelect('reportGroup');
    }

    if (reportType === 'exam_results') {
        loadExamsIntoSelect('reportExam');
        loadGroupsIntoSelect('reportGroup');
    }

    if (reportType === 'parent_notification') {
        loadGroupsIntoSelect('specificGroup');
        setupNotificationListeners();
    }
}

function loadGroupsIntoSelect(selectId) {
    const select = document.getElementById(selectId);
    if (!select) return;

    let options = '<option value="all">Barcha guruhlar</option>';
    groups.forEach(group => {
        options += `<option value="${group.id}">${group.name}</option>`;
    });

    select.innerHTML = options;
}

function loadExamsIntoSelect(selectId) {
    const select = document.getElementById(selectId);
    if (!select) return;

    let options = '<option value="">Tanlang</option>';
    exams.forEach(exam => {
        if (exam.status === 'completed') {
            options += `<option value="${exam.id}">${exam.name}</option>`;
        }
    });

    select.innerHTML = options;
}

function loadEmailTemplate() {
    const templateName = document.getElementById('emailTemplate').value;
    const subjectInput = document.getElementById('emailSubject');
    const messageInput = document.getElementById('emailMessage');

    if (templateName === 'custom') {
        subjectInput.value = '';
        messageInput.value = '';
        return;
    }

    const template = emailTemplates[templateName];
    if (template) {
        subjectInput.value = template.subject;
        messageInput.value = template.message;
    }

    loadRecipients();
}

function loadRecipients() {
    const templateName = document.getElementById('emailTemplate').value;
    const select = document.getElementById('emailRecipients');

    select.innerHTML = '';

    switch (templateName) {
        case 'attendance_report':
        case 'low_attendance':
            students.forEach(student => {
                const option = document.createElement('option');
                option.value = student.id;
                option.textContent = `${student.firstName} ${student.lastName} (Ota-ona: ${student.parentName || 'Noma\'lum'})`;
                select.appendChild(option);
            });
            break;

        case 'exam_results':
            const examId = document.getElementById('reportExam')?.value;
            if (examId) {
                const examResults = examResults.filter(r => r.examId == examId);
                examResults.forEach(result => {
                    const student = students.find(s => s.id === result.studentId);
                    if (student) {
                        const option = document.createElement('option');
                        option.value = student.id;
                        option.textContent = `${student.firstName} ${student.lastName}`;
                        select.appendChild(option);
                    }
                });
            }
            break;

        default:
            students.forEach(student => {
                const option = document.createElement('option');
                option.value = student.id;
                option.textContent = `${student.firstName} ${student.lastName}`;
                select.appendChild(option);
            });
    }
}

function selectAllRecipients() {
    const select = document.getElementById('emailRecipients');
    Array.from(select.options).forEach(option => {
        option.selected = true;
    });
}

function clearRecipients() {
    const select = document.getElementById('emailRecipients');
    Array.from(select.options).forEach(option => {
        option.selected = false;
    });
}

function formatText(command) {
    const textarea = document.getElementById('emailMessage');
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);

    let formattedText = '';

    switch (command) {
        case 'bold':
            formattedText = `<strong>${selectedText}</strong>`;
            break;
        case 'italic':
            formattedText = `<em>${selectedText}</em>`;
            break;
        case 'underline':
            formattedText = `<u>${selectedText}</u>`;
            break;
    }

    textarea.value = textarea.value.substring(0, start) + formattedText + textarea.value.substring(end);
}

function insertVariable(variable) {
    const textarea = document.getElementById('emailMessage');
    const start = textarea.selectionStart;

    let variableText = '';
    switch (variable) {
        case 'student_name':
            variableText = '{student_name}';
            break;
        case 'parent_name':
            variableText = '{parent_name}';
            break;
        case 'grade':
            variableText = '{grade}';
            break;
        case 'attendance_percentage':
            variableText = '{attendance_percentage}';
            break;
        case 'exam_name':
            variableText = '{exam_name}';
            break;
        case 'score':
            variableText = '{score}';
            break;
    }

    textarea.value = textarea.value.substring(0, start) + variableText + textarea.value.substring(start);
    textarea.focus();
}

function previewEmail() {
    const subject = document.getElementById('emailSubject').value;
    const message = document.getElementById('emailMessage').value;
    const recipientsSelect = document.getElementById('emailRecipients');
    const selectedRecipients = Array.from(recipientsSelect.selectedOptions).map(opt => opt.textContent);

    if (!subject.trim()) {
        showNotification('Iltimos, email mavzusini kiriting!', 'error');
        return;
    }

    if (!message.trim()) {
        showNotification('Iltimos, xabar matnini kiriting!', 'error');
        return;
    }

    if (selectedRecipients.length === 0) {
        showNotification('Iltimos, kamida bitta qabul qiluvchini tanlang!', 'error');
        return;
    }

    document.getElementById('previewSubject').textContent = subject;
    document.getElementById('previewRecipients').textContent = selectedRecipients.join(', ');
    document.getElementById('previewMessage').innerHTML = message.replace(/\n/g, '<br>');

    document.getElementById('emailPreviewModal').classList.remove('hidden');
}

function closeEmailPreview() {
    document.getElementById('emailPreviewModal').classList.add('hidden');
}

function confirmSendEmails() {
    const subject = document.getElementById('emailSubject').value;
    const message = document.getElementById('emailMessage').value;
    const recipientsSelect = document.getElementById('emailRecipients');
    const selectedStudentIds = Array.from(recipientsSelect.selectedOptions).map(opt => parseInt(opt.value));

    let successCount = 0;
    let failedCount = 0;

    selectedStudentIds.forEach(studentId => {
        const student = students.find(s => s.id === studentId);
        if (student && student.email) {
            successCount++;
            logEmailSent(studentId, subject, message);
        } else {
            failedCount++;
        }
    });

    closeEmailPreview();

    const successMessage = `
        <p class="text-center mb-4">
            <i class="fas fa-check-circle text-4xl text-green-600 mb-3"></i><br>
            ${successCount} ta email muvaffaqiyatli yuborildi!
        </p>
        ${failedCount > 0 ? `
            <p class="text-yellow-600 text-sm">
                ${failedCount} ta email yuborilmadi (email manzili mavjud emas)
            </p>
        ` : ''}
    `;

    document.getElementById('emailSuccessMessage').innerHTML = successMessage;
    document.getElementById('emailSuccessModal').classList.remove('hidden');

    showNotification(`${successCount} ta email yuborildi!`, 'success');
}

function logEmailSent(studentId, subject, message) {
    const emailLogs = JSON.parse(localStorage.getItem('emailLogs')) || [];

    emailLogs.push({
        id: Date.now(),
        studentId: studentId,
        subject: subject,
        message: message,
        sentAt: new Date().toISOString(),
        sentBy: currentUser.id
    });

    localStorage.setItem('emailLogs', JSON.stringify(emailLogs));
}

function closeEmailSuccess() {
    document.getElementById('emailSuccessModal').classList.add('hidden');
}

function sendAutoNotification(type, studentId, data = {}) {
    if (!emailSettings[`auto${type.charAt(0).toUpperCase() + type.slice(1)}`]) {
        return;
    }

    const student = students.find(s => s.id === studentId);
    if (!student || !student.email) return;

    let subject = '';
    let message = '';

    switch (type) {
        case 'attendance':
            if (data.attendancePercentage < 50) {
                subject = `Hurmatli ota-ona, ${student.firstName}ning davomat foizi past`;
                message = `Hurmatli ota-ona, ${student.firstName}ning hozirgi davomat foizi ${data.attendancePercentage}% ga yetdi. Iltimos, farzandingizning maktabga kelishini ta'minlang.`;
            }
            break;

        case 'examResults':
            subject = `Hurmatli ota-ona, ${student.firstName}ning imtihon natijalari`;
            message = `Hurmatli ota-ona, ${student.firstName}ning ${data.examName} imtihoni natijasi: ${data.score}/${data.maxScore}. ${data.percentage >= 60 ? 'Tabriklaymiz!' : 'Yana bir bor urinib ko\'ring.'}`;
            break;

        case 'birthday':
            subject = `Tug'ilgan kuningiz bilan, ${student.firstName}!`;
            message = `Hurmatli ${student.firstName} va ota-onalari, sizni tug'ilgan kuningiz bilan chin qalbimizdan tabriklaymiz! Sog'lik-somat, baxt-u farovat tilaymiz!`;
            break;
    }

    if (subject && message) {
        console.log(`Email sent to ${student.email}: ${subject}`);
    }
}

function saveAutoEmailSettings() {
    emailSettings.autoAttendance = document.getElementById('autoAttendance').checked;
    emailSettings.autoExamResults = document.getElementById('autoExamResults').checked;
    emailSettings.autoMonthlyReport = document.getElementById('autoMonthlyReport').checked;
    emailSettings.autoBirthday = document.getElementById('autoBirthday').checked;

    localStorage.setItem('emailSettings', JSON.stringify(emailSettings));
    showNotification('Email sozlamalari saqlandi!', 'success');
}

function sendExamResultsToParents(examId) {
    const exam = exams.find(e => e.id === examId);
    if (!exam || exam.status !== 'completed') return;

    const results = examResults.filter(r => r.examId === examId);

    results.forEach(result => {
        const student = students.find(s => s.id === result.studentId);
        if (!student || !student.email) return;

        const sortedResults = results.sort((a, b) => b.score - a.score);
        const rank = sortedResults.findIndex(r => r.id === result.id) + 1;
        const percentage = Math.round((result.score / exam.maxScore) * 100);
        const grade = getGradeFromScore(percentage);

        let performanceComment = '';
        if (percentage >= 90) {
            performanceComment = 'Ajoyib natija! Farzandingiz juda yaxshi ishladi.';
        } else if (percentage >= 70) {
            performanceComment = 'Yaxshi natija. Yana ham yaxshilash imkoniyati bor.';
        } else if (percentage >= 60) {
            performanceComment = 'Qoniqarli natija. Qo\'shimcha mashg\'ulotlar kerak.';
        } else {
            performanceComment = 'Yaxshilash uchun qo\'shimcha yordam kerak.';
        }

        const emailData = {
            student_name: `${student.firstName} ${student.lastName}`,
            parent_name: student.parentName || 'Hurmatli ota-ona',
            exam_name: exam.name,
            score: result.score,
            max_score: exam.maxScore,
            percentage: percentage + '%',
            rank: rank,
            grade: grade,
            performance_comment: performanceComment,
            school_name: 'Talaba Menejeri'
        };

        sendPersonalizedEmail(student.email, 'exam_results', emailData);
    });
}

function sendPersonalizedEmail(email, templateName, data) {
    const template = emailTemplates[templateName];
    if (!template) return;

    let subject = template.subject;
    let message = template.message;

    Object.keys(data).forEach(key => {
        const placeholder = `{${key}}`;
        subject = subject.replace(new RegExp(placeholder, 'g'), data[key]);
        message = message.replace(new RegExp(placeholder, 'g'), data[key]);
    });

    console.log(`Sending email to ${email}:`, { subject, message });

    const emailLogs = JSON.parse(localStorage.getItem('emailLogs')) || [];
    emailLogs.push({
        id: Date.now(),
        to: email,
        subject: subject,
        message: message,
        template: templateName,
        sentAt: new Date().toISOString()
    });
    localStorage.setItem('emailLogs', JSON.stringify(emailLogs));
}

function sendMonthlyReports() {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const monthNames = ['Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun',
        'Iyul', 'Avgust', 'Sentabr', 'Oktabr', 'Noyabr', 'Dekabr'];

    students.forEach(student => {
        if (!student.email) return;

        const attendanceStats = calculateStudentAttendance(student.id, currentMonth, currentYear);

        const examStats = calculateStudentExamStats(student.id);

        const emailData = {
            student_name: `${student.firstName} ${student.lastName}`,
            parent_name: student.parentName || 'Hurmatli ota-ona',
            month: monthNames[currentMonth],
            attendance_percentage: attendanceStats.percentage + '%',
            present_days: attendanceStats.present,
            absent_days: attendanceStats.absent,
            late_days: attendanceStats.late,
            average_grade: examStats.averageGrade,
            exam_count: examStats.count,
            school_name: 'Talaba Menejeri'
        };

        sendPersonalizedEmail(student.email, 'attendance_report', emailData);
    });
}

function calculateStudentAttendance(studentId, month, year) {
    let present = 0;
    let absent = 0;
    let late = 0;
    let total = 0;

    Object.keys(attendanceHistory).forEach(dateStr => {
        const date = new Date(dateStr);
        if (date.getMonth() === month && date.getFullYear() === year) {
            if (attendanceHistory[dateStr][studentId]) {
                const status = attendanceHistory[dateStr][studentId].status;
                if (status === 'present') present++;
                else if (status === 'absent') absent++;
                else if (status === 'late') late++;
                total++;
            }
        }
    });

    const percentage = total > 0 ? Math.round((present / total) * 100) : 0;

    return { present, absent, late, total, percentage };
}

function calculateStudentExamStats(studentId) {
    const studentResults = examResults.filter(r => r.studentId === studentId);
    const count = studentResults.length;

    let totalScore = 0;
    let maxScore = 0;

    studentResults.forEach(result => {
        const exam = exams.find(e => e.id === result.examId);
        if (exam) {
            totalScore += result.score;
            maxScore += exam.maxScore;
        }
    });

    const averageGrade = maxScore > 0 ? (totalScore / maxScore * 5).toFixed(1) : 0;

    return { count, totalScore, averageGrade };
}

function sendBirthdayGreetings() {
    const today = new Date();
    const todayStr = `${today.getMonth() + 1}-${today.getDate()}`;

    students.forEach(student => {
        if (student.birthDate) {
            const birthDate = new Date(student.birthDate);
            const birthStr = `${birthDate.getMonth() + 1}-${birthDate.getDate()}`;

            if (birthStr === todayStr && student.email) {
                sendPersonalizedEmail(student.email, 'birthday_greeting', {
                    student_name: `${student.firstName} ${student.lastName}`,
                    school_name: 'Talaba Menejeri'
                });
            }
        }
    });
}

function setupNotificationListeners() {
    const recipientsGroup = document.getElementById('recipientsGroup');
    const specificGroupContainer = document.getElementById('specificGroupContainer');

    recipientsGroup.addEventListener('change', function () {
        if (this.value === 'specific_group') {
            specificGroupContainer.classList.remove('hidden');
        } else {
            specificGroupContainer.classList.add('hidden');
        }
    });
}

function loadEmailSettings() {
    document.getElementById('autoAttendance').checked = emailSettings.autoAttendance;
    document.getElementById('autoExamResults').checked = emailSettings.autoExamResults;
    document.getElementById('autoMonthlyReport').checked = emailSettings.autoMonthlyReport;
    document.getElementById('autoBirthday').checked = emailSettings.autoBirthday;
}

// ==================== YORDAMCHI FUNKSIYALARI ====================

function updateStatistics() {
    document.getElementById('sidebarGroups').textContent = groups.length;
    document.getElementById('sidebarStudents').textContent = students.length;

    const presentCount = students.filter(s => s.attendance === 'present').length;
    const attendanceRate = students.length > 0 ?
        Math.round((presentCount / students.length) * 100) : 0;
    document.getElementById('sidebarAttendance').textContent = attendanceRate + '%';
}

function saveToLocalStorage() {
    localStorage.setItem('users', JSON.stringify(users));
    localStorage.setItem('groups', JSON.stringify(groups));
    localStorage.setItem('students', JSON.stringify(students));
    localStorage.setItem('attendance', JSON.stringify(attendance));
}

function showModal(content) {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = content;
    document.body.appendChild(modal);

    modal.addEventListener('click', function (e) {
        if (e.target === modal || e.target.classList.contains('close-modal')) {
            document.body.removeChild(modal);
        }
    });
}

function closeModal() {
    const modal = document.querySelector('.modal-overlay');
    if (modal && modal.parentElement) {
        document.body.removeChild(modal);
    }
}

function showNotification(message, type = 'info') {
    const oldNotification = document.querySelector('.notification');
    if (oldNotification) {
        oldNotification.remove();
    }

    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div class="flex items-center">
            <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'} mr-3"></i>
            ${message}
        </div>
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.remove();
    }, 3000);
}

function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    sidebar.classList.toggle('active');
}

function setupEventListeners() {
    const searchInput = document.getElementById('globalSearch');
    if (searchInput) {
        searchInput.addEventListener('input', function (e) {
            const searchTerm = e.target.value.toLowerCase();
            console.log('Qidiruv:', searchTerm);
        });
    }

    const modals = document.querySelectorAll('.modal-overlay');
    modals.forEach(modal => {
        modal.addEventListener('click', function (e) {
            if (e.target === modal) {
                modal.classList.add('hidden');
            }
        });
    });

    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
            closeModal();
            document.getElementById('groupModal').classList.add('hidden');
            document.getElementById('studentModal').classList.add('hidden');
            document.getElementById('registerModal').classList.add('hidden');
        }
    });

    document.getElementById('reportType')?.addEventListener('change', toggleReportFields);
    document.getElementById('emailTemplate')?.addEventListener('change', loadEmailTemplate);
}

// ==================== BOSHQA FUNKSIYALAR ====================

function generatePDF() {
    showNotification('PDF hisobot yaratildi! (Simulyatsiya)', 'success');
}

function generateExcel() {
    showNotification('Excel hisobot yaratildi! (Simulyatsiya)', 'success');
}

function sendEmails() {
    const message = document.getElementById('emailMessage').value;
    if (!message) {
        showNotification('Xabar matnini kiriting!', 'error');
        return;
    }

    showNotification('Email\'lar yuborildi! (Simulyatsiya)', 'success');
}

function saveProfile() {
    const name = document.getElementById('profileName').value;
    const email = document.getElementById('profileEmail').value;
    const phone = document.getElementById('profilePhone').value;
    const newPassword = document.getElementById('newPassword').value;

    const userIndex = users.findIndex(u => u.id === currentUser.id);
    if (userIndex !== -1) {
        users[userIndex].name = name;
        users[userIndex].email = email;
        users[userIndex].phone = phone;

        if (newPassword) {
            users[userIndex].password = newPassword;
        }

        currentUser = users[userIndex];
        localStorage.setItem('users', JSON.stringify(users));
        localStorage.setItem('currentUser', JSON.stringify(currentUser));

        updateUserInfo();
        showNotification('Profil yangilandi!', 'success');
        document.getElementById('newPassword').value = '';
    }
}

function changeProfilePhoto() {
    showNotification('Rasm yuklash funksiyasi keyingi versiyada!', 'info');
}