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
let groups = JSON.parse(localStorage.getItem('groups')) || [
    // {
    //     id: 1,
    //     name: "Frontend 101",
    //     course: "1",
    //     description: "Frontend dasturlash asoslari",
    //     color: "blue",
    //     createdAt: "2024-01-01",
    //     students: [1, 2]
    // },
    // {
    //     id: 2,
    //     name: "Backend Group",
    //     course: "2",
    //     description: "Backend dasturlash",
    //     color: "green",
    //     createdAt: "2024-01-02",
    //     students: [3]
    // }
];

// O'quvchilar
let students = JSON.parse(localStorage.getItem('students')) || [
    // {
    //     id: 1,
    //     firstName: "Ali",
    //     lastName: "Valiyev",
    //     phone: "+998901234567",
    //     email: "ali@example.com",
    //     groupId: 1,
    //     attendance: "present",
    //     grade: 4.5,
    //     birthDate: "2000-05-15",
    //     notes: "A'lo o'quvchi",
    //     photo: null
    // },
    // {
    //     id: 2,
    //     firstName: "Gulnora",
    //     lastName: "Karimova",
    //     phone: "+998902345678",
    //     email: "gulnora@example.com",
    //     groupId: 1,
    //     attendance: "absent",
    //     grade: 3.8,
    //     birthDate: "2001-08-22",
    //     notes: "Ijodiy yondashuv",
    //     photo: null
    // },
    // {
    //     id: 3,
    //     firstName: "Hasan",
    //     lastName: "Rahimov",
    //     phone: "+998903456789",
    //     email: "hasan@example.com",
    //     groupId: 2,
    //     attendance: "late",
    //     grade: 4.2,
    //     birthDate: "1999-12-10",
    //     notes: "Sportchi",
    //     photo: null
    // }
];

// Davomat ma'lumotlari
let attendance = JSON.parse(localStorage.getItem('attendance')) || {};

// ==================== SAHIFA YUKLANGANDA ====================

document.addEventListener('DOMContentLoaded', function() {
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
    
    // Sahifa yuklanganda foydalanuvchini tekshirish
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        showDashboard();
        initDashboard();
    }
    
    // Event listenerlarni sozlash
    setupEventListeners();
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
        button.addEventListener('click', function() {
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
        'reports': 'Hisobotlar',
        'settings': 'Sozlamalar'
    };
    
    const descriptions = {
        'groups': 'Guruhlarni boshqarish',
        'students': 'O\'quvchilar ro\'yxati',
        'attendance': 'Davomat nazorati',
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
    // Guruh o'quvchilarini ko'rish uchun modal ochish
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
    } else {
        title.textContent = 'Yangi O\'quvchi';
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
        showNotification('Yangi o\'quvchi qo\'shildi!', 'success');
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

// ==================== HISOBOTLAR FUNKSIYALARI ====================

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

// ==================== SOZLAMALAR FUNKSIYALARI ====================

function saveProfile() {
    const name = document.getElementById('profileName').value;
    const email = document.getElementById('profileEmail').value;
    const phone = document.getElementById('profilePhone').value;
    const newPassword = document.getElementById('newPassword').value;
    
    // Foydalanuvchini yangilash
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

// ==================== YORDAMCHI FUNKSIYALAR ====================

function updateStatistics() {
    // Guruhlar soni
    document.getElementById('sidebarGroups').textContent = groups.length;
    
    // O'quvchilar soni
    document.getElementById('sidebarStudents').textContent = students.length;
    
    // Davomat foizi
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
    
    // Modal ichidagi yopish tugmasi
    modal.addEventListener('click', function(e) {
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
    // Eski notificationni o'chirish
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
    // Global qidiruv
    const searchInput = document.getElementById('globalSearch');
    if (searchInput) {
        searchInput.addEventListener('input', function(e) {
            const searchTerm = e.target.value.toLowerCase();
            // Qidiruv funksiyasi
            console.log('Qidiruv:', searchTerm);
        });
    }
    
    // Modal overlay
    const modals = document.querySelectorAll('.modal-overlay');
    modals.forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                modal.classList.add('hidden');
            }
        });
    });
    
    // ESC tugmasi bilan modal yopish
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeModal();
            document.getElementById('groupModal').classList.add('hidden');
            document.getElementById('studentModal').classList.add('hidden');
            document.getElementById('registerModal').classList.add('hidden');
        }
    });
}

// ==================== DAVOMAT TARIXI FUNKSIYALARI ====================

// Davomat tarixi ma'lumotlari
let attendanceHistory = JSON.parse(localStorage.getItem('attendanceHistory')) || {};

// Joriy oy ko'rsatiladi
let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();

// Pagination
let currentPage = 1;
const recordsPerPage = 10;

// Davomat tarixini yangilash
function updateAttendanceHistory() {
    // Bugungi davomatni tarixga qo'shish
    const today = new Date().toISOString().split('T')[0];
    
    if (!attendanceHistory[today]) {
        attendanceHistory[today] = {};
    }
    
    // Har bir o'quvchining davomatini yozish
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

// Davomat kalendarini yuklash
function loadAttendanceCalendar() {
    const calendarContainer = document.getElementById('attendanceCalendar');
    if (!calendarContainer) return;
    
    // Oy nomini yangilash
    const monthNames = [
        'Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun',
        'Iyul', 'Avgust', 'Sentabr', 'Oktabr', 'Noyabr', 'Dekabr'
    ];
    
    document.getElementById('currentMonth').textContent = 
        `${monthNames[currentMonth]} ${currentYear}`;
    
    // Kalendar yaratish
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDay = firstDay.getDay(); // 0 - Yakshanba, 1 - Dushanba, ...
    
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
    
    // Bo'sh katakchalar
    for (let i = 0; i < startDay; i++) {
        calendarHTML += `<div class="calendar-day empty"></div>`;
    }
    
    // Kunlar
    const today = new Date();
    const isToday = (day) => {
        return day === today.getDate() && 
               currentMonth === today.getMonth() && 
               currentYear === today.getFullYear();
    };
    
    for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const dayAttendance = attendanceHistory[dateStr] || {};
        
        // Davomat statistikasi
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

// Oldingi oy
function prevMonth() {
    currentMonth--;
    if (currentMonth < 0) {
        currentMonth = 11;
        currentYear--;
    }
    loadAttendanceCalendar();
    loadAttendanceHistory();
}

// Keyingi oy
function nextMonth() {
    currentMonth++;
    if (currentMonth > 11) {
        currentMonth = 0;
        currentYear++;
    }
    loadAttendanceCalendar();
    loadAttendanceHistory();
}

// Kunlik davomatni ko'rsatish
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

// Kunlik davomatni tahrirlash
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

// Kunlik davomatni saqlash
function saveDayAttendance(dateStr) {
    if (!attendanceHistory[dateStr]) {
        attendanceHistory[dateStr] = {};
    }
    
    // Barcha o'quvchilardan ma'lumotlarni yig'ish
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
        
        // O'quvchining attendance maydonini yangilash (faqat bugungi bo'lsa)
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

// Davomat tarixini yuklash
function loadAttendanceHistory() {
    const table = document.getElementById('attendanceHistoryTable');
    const info = document.getElementById('historyInfo');
    const pagination = document.getElementById('pagination');
    
    if (!table) return;
    
    // Filtrlarni olish
    const selectedGroup = document.getElementById('historyGroup').value;
    const selectedStudent = document.getElementById('historyStudent').value;
    const selectedStatus = document.getElementById('historyStatus').value;
    
    // Barcha davomat yozuvlarini yig'ish
    let allRecords = [];
    
    Object.keys(attendanceHistory).forEach(dateStr => {
        Object.keys(attendanceHistory[dateStr]).forEach(studentId => {
            const record = attendanceHistory[dateStr][studentId];
            const student = students.find(s => s.id == studentId);
            const group = student ? groups.find(g => g.id === student.groupId) : null;
            
            // Filtrlash
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
    
    // Sana bo'yicha saralash (eng yangi birinchi)
    allRecords.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // Pagination hisoblash
    const totalRecords = allRecords.length;
    const totalPages = Math.ceil(totalRecords / recordsPerPage);
    const startIndex = (currentPage - 1) * recordsPerPage;
    const endIndex = startIndex + recordsPerPage;
    const pageRecords = allRecords.slice(startIndex, endIndex);
    
    // Jadvalni to'ldirish
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
    
    // Info yangilash
    info.textContent = `${startIndex + 1}-${Math.min(endIndex, totalRecords)} yozuv ${totalRecords} tadan ko'rsatilmoqda`;
    
    // Pagination yangilash
    pagination.innerHTML = '';
    
    if (totalPages > 1) {
        // Oldingi tugma
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
        
        // Sahifa raqamlari
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
        
        // Keyingi tugma
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

// Filtrlarni yangilash
function updateAttendanceFilters() {
    const groupSelect = document.getElementById('historyGroup');
    const studentSelect = document.getElementById('historyStudent');
    
    if (groupSelect) {
        // Guruhlar
        let groupOptions = '<option value="all">Barcha guruhlar</option>';
        groups.forEach(group => {
            groupOptions += `<option value="${group.id}">${group.name}</option>`;
        });
        groupSelect.innerHTML = groupOptions;
        
        // O'quvchilar
        let studentOptions = '<option value="all">Barcha o\'quvchilar</option>';
        students.forEach(student => {
            studentOptions += `<option value="${student.id}">${student.firstName} ${student.lastName}</option>`;
        });
        studentSelect.innerHTML = studentOptions;
    }
}

// Davomat tarixini Excel ga yuklash
function exportAttendanceHistory() {
    // Barcha davomat yozuvlarini yig'ish
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
    
    // CSV ga o'tkazish
    let csv = 'Sana,O\'quvchi,Guruh,Telefon,Holat,Izoh,Vaqt\n';
    
    allRecords.forEach(record => {
        csv += `"${record.Sana}","${record['O\'quvchi']}","${record.Guruh}","${record.Telefon}","${record.Holat}","${record.Izoh}","${record.Vaqt}"\n`;
    });
    
    // Yuklab olish
    const blob = new Blob(['\ufeff', csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `davomat-tarixi-${new Date().getTime()}.csv`;
    link.click();
    
    showNotification('Davomat tarixi Excel formatida yuklab olindi!', 'success');
}

// Davomat statistikasini hisoblash
function calculateAttendanceStats() {
    const stats = {
        totalDays: 0,
        presentDays: {},
        absentDays: {},
        lateDays: {},
        overallAttendance: {}
    };
    
    // Har bir o'quvchi uchun statistikani hisoblash
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

// Oylik statistikani ko'rsatish
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

// ==================== BO'SH SAHIFA FUNKSIYALARI ====================

// Bo'sh guruhlar ko'rinishi
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
                    <i class="fas fa-plus mr-2"></i> Birinchi Guruh Yaratish
                </button>
            </div>
        `;
        return;
    }
    
    // Mavjud guruhlar bo'lsa, ularni ko'rsatish
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

// Bo'sh o'quvchilar ko'rinishi
function loadStudents() {
    const table = document.getElementById('studentsTable');
    if (!table) return;
    
    table.innerHTML = '';
    
    if (students.length === 0) {
        table.innerHTML = `
            <tr>
                <td colspan="6" class="px-6 py-12 text-center">
                    <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <i class="fas fa-user-graduate text-2xl text-gray-400"></i>
                    </div>
                    <h3 class="text-lg font-medium text-gray-600 mb-2">Hali o'quvchilar yo'q</h3>
                    <p class="text-gray-500 mb-4">Avval guruh yarating, so'ng o'quvchi qo'shing</p>
                    <button onclick="openStudentModal()" 
                            class="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg">
                        <i class="fas fa-plus mr-2"></i> O'quvchi Qo'shish
                    </button>
                </td>
            </tr>
        `;
        document.getElementById('studentsCount').textContent = '0 ta o\'quvchi';
        return;
    }
    
    // Mavjud o'quvchilar bo'lsa, ularni ko'rsatish
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

// Bo'sh davomat ko'rinishi
function loadGroupButtons() {
    const container = document.getElementById('groupButtons');
    if (!container) return;
    
    container.innerHTML = '';
    
    if (groups.length === 0) {
        container.innerHTML = `
            <div class="w-full text-center p-6 bg-gray-50 rounded-lg">
                <i class="fas fa-users text-3xl text-gray-300 mb-3"></i>
                <p class="text-gray-500">Davomat qilish uchun avval guruh yarating</p>
                <button onclick="openGroupModal()" 
                        class="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg">
                    <i class="fas fa-plus mr-2"></i> Guruh Yaratish
                </button>
            </div>
        `;
        return;
    }
    
    // Mavjud guruhlar bo'lsa, ularni ko'rsatish
    groups.forEach(group => {
        const button = document.createElement('button');
        button.className = 'px-4 py-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition duration-300';
        button.textContent = group.name;
        button.onclick = () => loadGroupAttendance(group.id);
        container.appendChild(button);
    });
}

// Bo'sh davomat tarixi ko'rinishi
function loadAttendanceHistory() {
    const table = document.getElementById('attendanceHistoryTable');
    const info = document.getElementById('historyInfo');
    const pagination = document.getElementById('pagination');
    
    if (!table) return;
    
    // Filtrlarni olish
    const selectedGroup = document.getElementById('historyGroup').value;
    const selectedStudent = document.getElementById('historyStudent').value;
    const selectedStatus = document.getElementById('historyStatus').value;
    
    // Barcha davomat yozuvlarini yig'ish
    let allRecords = [];
    
    Object.keys(attendanceHistory).forEach(dateStr => {
        Object.keys(attendanceHistory[dateStr]).forEach(studentId => {
            const record = attendanceHistory[dateStr][studentId];
            const student = students.find(s => s.id == studentId);
            const group = student ? groups.find(g => g.id === student.groupId) : null;
            
            // Filtrlash
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
    
    // Sana bo'yicha saralash (eng yangi birinchi)
    allRecords.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // Agar yozuv bo'lmasa
    if (allRecords.length === 0) {
        table.innerHTML = `
            <tr>
                <td colspan="6" class="px-6 py-12 text-center">
                    <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <i class="fas fa-calendar-times text-2xl text-gray-400"></i>
                    </div>
                    <h3 class="text-lg font-medium text-gray-600 mb-2">Hali davomat qilinmagan</h3>
                    <p class="text-gray-500">Birorta guruh tanlab, davomat qiling</p>
                </td>
            </tr>
        `;
        
        info.textContent = '0 ta yozuv ko\'rsatilmoqda';
        pagination.innerHTML = '';
        return;
    }
    
    // Pagination hisoblash
    const totalRecords = allRecords.length;
    const totalPages = Math.ceil(totalRecords / recordsPerPage);
    const startIndex = (currentPage - 1) * recordsPerPage;
    const endIndex = startIndex + recordsPerPage;
    const pageRecords = allRecords.slice(startIndex, endIndex);
    
    // Jadvalni to'ldirish
    table.innerHTML = '';
    
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
    
    // Info yangilash
    info.textContent = `${startIndex + 1}-${Math.min(endIndex, totalRecords)} yozuv ${totalRecords} tadan ko'rsatilmoqda`;
    
    // Pagination yangilash
    pagination.innerHTML = '';
    
    if (totalPages > 1) {
        // Oldingi tugma
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
        
        // Sahifa raqamlari
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
        
        // Keyingi tugma
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

// Bo'sh kalendar ko'rinishi
function loadAttendanceCalendar() {
    const calendarContainer = document.getElementById('attendanceCalendar');
    if (!calendarContainer) return;
    
    // Oy nomini yangilash
    const monthNames = [
        'Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun',
        'Iyul', 'Avgust', 'Sentabr', 'Oktabr', 'Noyabr', 'Dekabr'
    ];
    
    document.getElementById('currentMonth').textContent = 
        `${monthNames[currentMonth]} ${currentYear}`;
    
    // Kalendar yaratish
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDay = firstDay.getDay(); // 0 - Yakshanba, 1 - Dushanba, ...
    
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
    
    // Bo'sh katakchalar
    for (let i = 0; i < startDay; i++) {
        calendarHTML += `<div class="calendar-day empty"></div>`;
    }
    
    // Kunlar
    const today = new Date();
    const isToday = (day) => {
        return day === today.getDate() && 
               currentMonth === today.getMonth() && 
               currentYear === today.getFullYear();
    };
    
    for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const dayAttendance = attendanceHistory[dateStr] || {};
        
        // Davomat statistikasi
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

// Bo'sh statistikani ko'rsatish
function showMonthlyStats() {
    const stats = calculateAttendanceStats();
    
    let modalContent = `
        <div class="modal-content">
            <h2 class="text-xl font-bold text-gray-800 mb-6">Oylik Davomat Statistikasi</h2>
    `;
    
    // Agar ma'lumot bo'lmasa
    if (students.length === 0) {
        modalContent += `
            <div class="text-center py-8">
                <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i class="fas fa-chart-bar text-2xl text-gray-400"></i>
                </div>
                <h3 class="text-lg font-medium text-gray-600 mb-2">Statistika yo'q</h3>
                <p class="text-gray-500">Avval o'quvchilar qo'shing</p>
            </div>
        `;
    } else {
        modalContent += `
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
            const studentStats = stats.overallAttendance[student.id] || { present: 0, total: 0, percentage: 0 };
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
    }
    
    modalContent += `
            </div>
        </div>
    `;
    
    showModal(modalContent);
}

// Barcha ma'lumotlarni tozalash funksiyasi
function clearAllData() {
    if (confirm('BARCHA ma\'lumotlarni o\'chirishni tasdiqlaysizmi? Bu amalni bekor qilib bo\'lmaydi!')) {
        // LocalStorage dan barcha ma'lumotlarni o'chirish
        localStorage.removeItem('groups');
        localStorage.removeItem('students');
        localStorage.removeItem('attendance');
        localStorage.removeItem('attendanceHistory');
        
        // O'zgaruvchilarni bo'sh qilish
        groups = [];
        students = [];
        attendance = {};
        attendanceHistory = {};
        
        // Sahifani yangilash
        loadGroups();
        loadStudents();
        loadGroupButtons();
        loadAttendanceCalendar();
        loadAttendanceHistory();
        updateStatistics();
        
        showNotification('Barcha ma\'lumotlar o\'chirildi!', 'success');
    }
}

// Dashboard yuklanganda davomat tarixini ishga tushirish
function initAttendanceHistory() {
    updateAttendanceHistory();
    loadAttendanceCalendar();
    loadAttendanceHistory();
    updateAttendanceFilters();
}

// ==================== initDashboard FUNKSIYASINI YANGILASH ====================

// initDashboard funksiyasiga faqat bitta qator qo'shing:

function initDashboard() {
    updateUserInfo();
    loadGroups();
    loadStudents();
    updateStatistics();
    setupTabs();
    updateTodayDate();
    initAttendanceHistory(); // ← FAQAT BU QATORNI QO'SHING
}