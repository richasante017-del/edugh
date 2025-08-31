// Dashboard JavaScript with Firebase Integration
class Dashboard {
    constructor() {
        this.auth = window.auth;
        this.db = window.db;
        this.currentUser = null;
        this.notes = [];
        this.todos = [];
        this.users = [];
        this.activeSection = 'overview';
        this.currentMonth = new Date(); // Add current month tracking
        
        this.init();
    }

    init() {
        // Check authentication
        this.checkAuth();
        
        // Initialize dashboard components
        this.initSidebar();
        this.initUserMenu();
        this.loadSampleData();
        this.renderActiveSection();
        
        // Initialize modals
        this.initModals();
        
        // Initialize search and filters
        this.initSearchAndFilters();
        
        // Initialize global event listeners
        this.initGlobalEventListeners();
        
        // Start auto-save functionality
        this.startAutoSave();
        
        // Initialize global event listeners
        this.initGlobalEventListeners();
    }

    // Check if user is authenticated
    checkAuth() {
        this.auth.onAuthStateChanged((user) => {
            if (user) {
                this.currentUser = user;
                this.loadUserData();
                this.loadUsers(); // Load all users for admin view
            } else {
                // Redirect to login if not authenticated
                window.location.href = 'login.html';
            }
        });
    }

    // Load current user data
    async loadUserData() {
        try {
            const userDoc = await this.db.collection('users').doc(this.currentUser.uid).get();
            if (userDoc.exists) {
                const userData = userDoc.data();
                this.updateUserDisplay(userData);
            }
        } catch (error) {
            console.error('Error loading user data:', error);
        }
    }

    // Load all users (for admin view)
    async loadUsers() {
        try {
            const usersSnapshot = await this.db.collection('users').get();
            this.users = usersSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            this.renderUsersSection();
        } catch (error) {
            console.error('Error loading users:', error);
        }
    }

    // Update user display in header
    updateUserDisplay(userData) {
        const userNameElement = document.querySelector('.user-name');
        const userEmailElement = document.querySelector('.user-email');
        
        if (userNameElement) {
            userNameElement.textContent = `${userData.firstName} ${userData.lastName}`;
        }
        
        if (userEmailElement) {
            userEmailElement.textContent = userData.email;
        }
    }

    // Initialize sidebar navigation
    initSidebar() {
        const sidebarItems = document.querySelectorAll('.sidebar-item');
        sidebarItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const section = item.getAttribute('data-section');
                this.switchSection(section);
            });
        });
    }

    // Initialize user menu
    initUserMenu() {
        const userMenuToggle = document.querySelector('.user-menu-toggle');
        const userMenu = document.querySelector('.user-menu');
        
        if (userMenuToggle && userMenu) {
            userMenuToggle.addEventListener('click', () => {
                userMenu.classList.toggle('active');
            });
        }

        // Logout functionality
        const logoutBtn = document.querySelector('.logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                this.logout();
            });
        }
    }

    // Load sample data
    loadSampleData() {
        // Load notes from localStorage
        const savedNotes = localStorage.getItem('eduguru_notes');
        if (savedNotes) {
            this.notes = JSON.parse(savedNotes);
        } else {
            // Load default sample notes
            this.notes = [
                {
                    id: 1,
                    title: 'JavaScript Fundamentals',
                    subject: 'math',
                    content: 'Variables, functions, and basic syntax. Important concepts for web development.',
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                },
                {
                    id: 2,
                    title: 'CSS Grid Layout',
                    subject: 'science',
                    content: 'Modern CSS layout system using grid. Great for responsive design.',
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                }
            ];
            localStorage.setItem('eduguru_notes', JSON.stringify(this.notes));
        }

        // Load todos from localStorage
        const savedTodos = localStorage.getItem('eduguru_todos');
        if (savedTodos) {
            this.todos = JSON.parse(savedTodos);
        } else {
            // Load default sample todos
            this.todos = [
                {
                    id: 1,
                    title: 'Complete JavaScript Assignment',
                    description: 'Finish the final project for JavaScript course',
                    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                    priority: 'high',
                    completed: false,
                    createdAt: new Date().toISOString()
                },
                {
                    id: 2,
                    title: 'Review CSS Concepts',
                    description: 'Go through CSS Grid and Flexbox tutorials',
                    dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                    priority: 'medium',
                    completed: false,
                    createdAt: new Date().toISOString()
                }
            ];
            localStorage.setItem('eduguru_todos', JSON.stringify(this.todos));
        }
    }

    // Initialize modals
    initModals() {
        // Note modal
        const noteModal = document.getElementById('noteModal');
        const noteForm = document.getElementById('noteForm');
        
        if (noteModal && noteForm) {
            // Close modal when clicking outside
            noteModal.addEventListener('click', (e) => {
                if (e.target === noteModal) {
                    this.closeNoteModal();
                }
            });

            // Form submission
            noteForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const formData = new FormData(noteForm);
                const noteData = {
                    title: formData.get('noteTitle'),
                    subject: formData.get('noteSubject'),
                    content: formData.get('noteContent')
                };

                const editId = noteForm.dataset.editId;
                if (editId) {
                    this.updateNote(parseInt(editId), noteData);
                } else {
                    this.addNote(noteData);
                }

                this.closeNoteModal();
            });
        }

        // Todo modal
        const todoModal = document.getElementById('todoModal');
        const todoForm = document.getElementById('todoForm');
        
        if (todoModal && todoForm) {
            // Close modal when clicking outside
            todoModal.addEventListener('click', (e) => {
                if (e.target === todoModal) {
                    this.closeTodoModal();
                }
            });

            // Form submission
            todoForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const formData = new FormData(todoForm);
                const todoData = {
                    title: formData.get('todoTitle'),
                    description: formData.get('todoDescription'),
                    dueDate: formData.get('todoDueDate'),
                    priority: formData.get('todoPriority')
                };

                const editId = todoForm.dataset.editId;
                if (editId) {
                    this.updateTodo(parseInt(editId), todoData);
                } else {
                    this.addTodo(todoData);
                }

                this.closeTodoModal();
            });
        }
    }

    // Initialize search and filters
    initSearchAndFilters() {
        // Search functionality
        const searchInput = document.querySelector('.search-input');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchNotes(e.target.value);
            });
        }

        // Filter functionality
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const filter = e.target.getAttribute('data-filter');
                this.filterTodos(filter);
            });
        });
    }

    // Initialize global event listeners
    initGlobalEventListeners() {
        // Close modals when clicking outside
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                e.target.classList.remove('active');
                document.body.style.overflow = '';
            }
        });

        // Close modals with escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                const activeModal = document.querySelector('.modal.active');
                if (activeModal) {
                    activeModal.classList.remove('active');
                    document.body.style.overflow = '';
                }
            }
        });
    }

    // Logout user
    async logout() {
        try {
            await this.auth.signOut();
            window.location.href = 'login.html';
        } catch (error) {
            console.error('Error logging out:', error);
        }
    }

    // Switch between dashboard sections
    switchSection(section) {
        this.activeSection = section;
        
        // Update active sidebar item
        document.querySelectorAll('.sidebar-item').forEach(item => {
            item.classList.remove('active');
        });
        document.querySelector(`[data-section="${section}"]`).classList.add('active');
        
        // Render the active section
        this.renderActiveSection();
    }

    // Render the active section
    renderActiveSection() {
        const mainContent = document.querySelector('.main-content');
        if (!mainContent) return;

        switch (this.activeSection) {
            case 'overview':
                this.renderOverview();
                break;
            case 'notes':
                this.renderNotes();
                break;
            case 'todos':
                this.renderTodos();
                break;
            case 'courses':
                this.renderCourses();
                break;
            case 'progress':
                this.renderProgress();
                break;
            case 'calendar':
                this.renderCalendar();
                break;
            case 'users':
                this.renderUsersSection();
                break;
        }
    }

    // Render overview section
    renderOverview() {
        const mainContent = document.querySelector('.main-content');
        mainContent.innerHTML = `
            <div class="section-header">
                <h2>Dashboard Overview</h2>
                <p>Welcome back! Here's what's happening with your learning journey.</p>
            </div>
            
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-icon">
                        <i class="fas fa-book"></i>
                    </div>
                    <div class="stat-content">
                        <h3>${this.notes.length}</h3>
                        <p>Total Notes</p>
                    </div>
                </div>
                
                <div class="stat-card">
                    <div class="stat-icon">
                        <i class="fas fa-tasks"></i>
                    </div>
                    <div class="stat-content">
                        <h3>${this.todos.filter(todo => !todo.completed).length}</h3>
                        <p>Pending Tasks</p>
                    </div>
                </div>
                
                <div class="stat-card">
                    <div class="stat-icon">
                        <i class="fas fa-graduation-cap"></i>
                    </div>
                    <div class="stat-content">
                        <h3>5</h3>
                        <p>Active Courses</p>
                    </div>
                </div>
                
                <div class="stat-card">
                    <div class="stat-icon">
                        <i class="fas fa-users"></i>
                    </div>
                    <div class="stat-content">
                        <h3>${this.users.length}</h3>
                        <p>Total Users</p>
                    </div>
                </div>
            </div>
            
            <div class="quick-actions">
                <h3>Quick Actions</h3>
                <div class="action-buttons">
                    <button class="btn btn-primary" onclick="dashboard.switchSection('notes')">
                        <i class="fas fa-plus"></i> Add Note
                    </button>
                    <button class="btn btn-secondary" onclick="dashboard.switchSection('todos')">
                        <i class="fas fa-plus"></i> Add Task
                    </button>
                    <button class="btn btn-outline" onclick="dashboard.switchSection('users')">
                        <i class="fas fa-users"></i> View Users
                    </button>
                </div>
            </div>
            
            <div class="recent-activity">
                <h3>Recent Activity</h3>
                <div class="activity-list">
                    ${this.getRecentActivity()}
                </div>
            </div>
        `;
    }

    // Render notes section
    renderNotes() {
        const mainContent = document.querySelector('.main-content');
        mainContent.innerHTML = `
            <div class="section-header">
                <h2>My Notes</h2>
                <p>Organize your learning with notes and study materials.</p>
                <button class="btn btn-primary" onclick="dashboard.openNoteModal()">
                    <i class="fas fa-plus"></i> Add Note
                </button>
            </div>
            
            <div class="notes-container">
                <div class="notes-header">
                    <div class="search-container">
                        <input type="text" class="search-input" placeholder="Search notes...">
                        <i class="fas fa-search"></i>
                    </div>
                </div>
                
                <div class="notes-grid" id="notesGrid">
                    ${this.notes.map(note => this.createNoteCard(note).outerHTML).join('')}
                </div>
            </div>
        `;

        // Initialize search
        const searchInput = mainContent.querySelector('.search-input');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchNotes(e.target.value);
            });
        }
    }

    // Render todos section
    renderTodos() {
        const mainContent = document.querySelector('.main-content');
        mainContent.innerHTML = `
            <div class="section-header">
                <h2>To-Do List</h2>
                <p>Track your tasks and assignments.</p>
                <button class="btn btn-primary" onclick="dashboard.openTodoModal()">
                    <i class="fas fa-plus"></i> Add Task
                </button>
            </div>
            
            <div class="todos-container">
                <div class="todos-header">
                    <div class="filter-buttons">
                        <button class="filter-btn active" data-filter="all">All</button>
                        <button class="filter-btn" data-filter="pending">Pending</button>
                        <button class="filter-btn" data-filter="completed">Completed</button>
                        <button class="filter-btn" data-filter="overdue">Overdue</button>
                    </div>
                </div>
                
                <div class="todo-list" id="todoList">
                    ${this.todos.map(todo => this.createTodoItem(todo).outerHTML).join('')}
                </div>
            </div>
        `;

        // Initialize filters
        const filterBtns = mainContent.querySelectorAll('.filter-btn');
        filterBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                filterBtns.forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                const filter = e.target.getAttribute('data-filter');
                this.filterTodos(filter);
            });
        });
    }

    // Render courses section
    renderCourses() {
        const mainContent = document.querySelector('.main-content');
        mainContent.innerHTML = `
            <div class="section-header">
                <h2>My Courses</h2>
                <p>Track your enrolled courses and progress.</p>
            </div>
            
            <div class="courses-grid">
                <div class="course-card">
                    <div class="course-image">
                        <i class="fas fa-code"></i>
                    </div>
                    <div class="course-content">
                        <h3>JavaScript Fundamentals</h3>
                        <p>Learn the basics of JavaScript programming</p>
                        <div class="course-progress">
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: 75%"></div>
                            </div>
                            <span>75% Complete</span>
                        </div>
                    </div>
                </div>
                
                <div class="course-card">
                    <div class="course-image">
                        <i class="fas fa-palette"></i>
                    </div>
                    <div class="course-content">
                        <h3>CSS Mastery</h3>
                        <p>Advanced CSS techniques and layouts</p>
                        <div class="course-progress">
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: 45%"></div>
                            </div>
                            <span>45% Complete</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // Render progress section
    renderProgress() {
        const mainContent = document.querySelector('.main-content');
        mainContent.innerHTML = `
            <div class="section-header">
                <h2>Learning Progress</h2>
                <p>Monitor your learning journey and achievements.</p>
            </div>
            
            <div class="progress-overview">
                <div class="progress-card">
                    <h3>Overall Progress</h3>
                    <div class="progress-circle">
                        <svg viewBox="0 0 36 36">
                            <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"/>
                            <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" stroke-dasharray="60, 100"/>
                        </svg>
                        <div class="progress-text">60%</div>
                    </div>
                </div>
                
                <div class="progress-stats">
                    <div class="stat-item">
                        <span class="stat-number">5</span>
                        <span class="stat-label">Courses Enrolled</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-number">12</span>
                        <span class="stat-label">Lessons Completed</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-number">8</span>
                        <span class="stat-label">Assignments Done</span>
                    </div>
                </div>
            </div>
        `;
    }

    // Render calendar section
    renderCalendar() {
        const mainContent = document.querySelector('.main-content');
        mainContent.innerHTML = `
            <div class="section-header">
                <h2>Calendar</h2>
                <p>View your schedule and upcoming deadlines.</p>
            </div>
            
            <div class="calendar-container">
                <div class="calendar-header">
                    <button class="btn btn-outline" onclick="dashboard.previousMonth()">
                        <i class="fas fa-chevron-left"></i>
                    </button>
                    <h3 id="currentMonth">${this.getCurrentMonthDisplay()}</h3>
                    <button class="btn btn-outline" onclick="dashboard.nextMonth()">
                        <i class="fas fa-chevron-right"></i>
                    </button>
                </div>
                
                <div class="calendar-grid" id="calendarGrid">
                    ${this.generateCalendarDays()}
                </div>
            </div>
        `;
    }

    // Get current month display
    getCurrentMonthDisplay() {
        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                           'July', 'August', 'September', 'October', 'November', 'December'];
        return `${monthNames[this.currentMonth.getMonth()]} ${this.currentMonth.getFullYear()}`;
    }

    // Generate calendar days
    generateCalendarDays() {
        const year = this.currentMonth.getFullYear();
        const month = this.currentMonth.getMonth();
        
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const startDate = new Date(firstDay);
        startDate.setDate(startDate.getDate() - firstDay.getDay());
        
        let calendarHTML = '';
        
        // Add day headers
        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        dayNames.forEach(day => {
            calendarHTML += `<div class="calendar-day-header">${day}</div>`;
        });
        
        // Generate calendar days
        for (let i = 0; i < 42; i++) {
            const currentDay = new Date(startDate);
            currentDay.setDate(startDate.getDate() + i);
            
            let dayClass = 'calendar-day';
            if (currentDay.getMonth() !== month) {
                dayClass += ' other-month';
            }
            
            const today = new Date();
            if (currentDay.toDateString() === today.toDateString()) {
                dayClass += ' today';
            }
            
            const hasEvents = this.checkDayEvents(currentDay);
            if (hasEvents) {
                dayClass += ' has-event';
            }
            
            calendarHTML += `
                <div class="${dayClass}">
                    <div class="calendar-day-number">${currentDay.getDate()}</div>
                    ${hasEvents ? '<div class="calendar-day-events">1 event</div>' : ''}
                </div>
            `;
        }
        
        return calendarHTML;
    }

    // Render users section
    renderUsersSection() {
        const mainContent = document.querySelector('.main-content');
        mainContent.innerHTML = `
            <div class="section-header">
                <h2>Users Management</h2>
                <p>View and manage all registered users in the system.</p>
            </div>
            
            <div class="users-stats">
                <div class="stat-card">
                    <h3>${this.users.length}</h3>
                    <p>Total Users</p>
                </div>
                <div class="stat-card">
                    <h3>${this.users.filter(user => user.newsletter).length}</h3>
                    <p>Newsletter Subscribers</p>
                </div>
            </div>
            
            <div class="users-table-container">
                <div class="table-header">
                    <h3>Registered Users</h3>
                    <div class="table-actions">
                        <input type="text" id="userSearch" placeholder="Search users..." class="search-input">
                        <select id="userFilter" class="filter-select">
                            <option value="all">All Users</option>
                            <option value="newsletter">Newsletter Subscribers</option>
                            <option value="recent">Recently Active</option>
                        </select>
                    </div>
                </div>
                
                <div class="users-table">
                    <table>
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Education Level</th>
                                <th>Newsletter</th>
                                <th>Joined</th>
                                <th>Last Login</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${this.renderUsersTableRows()}
                        </tbody>
                    </table>
                </div>
            </div>
        `;

        // Initialize search and filter functionality
        this.initUsersSearchAndFilter();
    }

    // Render users table rows
    renderUsersTableRows() {
        if (this.users.length === 0) {
            return '<tr><td colspan="6" class="no-data">No users found</td></tr>';
        }

        return this.users.map(user => `
            <tr>
                <td>
                    <div class="user-info">
                        <div class="user-avatar">
                            <i class="fas fa-user"></i>
                        </div>
                        <div class="user-details">
                            <strong>${user.firstName} ${user.lastName}</strong>
                        </div>
                    </div>
                </td>
                <td>${user.email}</td>
                <td>
                    <span class="education-badge ${user.educationLevel}">
                        ${this.formatEducationLevel(user.educationLevel)}
                    </span>
                </td>
                <td>
                    <span class="newsletter-status ${user.newsletter ? 'subscribed' : 'not-subscribed'}">
                        <i class="fas fa-${user.newsletter ? 'check' : 'times'}"></i>
                        ${user.newsletter ? 'Subscribed' : 'Not Subscribed'}
                    </span>
                </td>
                <td>${this.formatDate(user.createdAt)}</td>
                <td>${this.formatDate(user.lastLogin)}</td>
            </tr>
        `).join('');
    }

    // Initialize users search and filter
    initUsersSearchAndFilter() {
        const searchInput = document.getElementById('userSearch');
        const filterSelect = document.getElementById('userFilter');

        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.filterUsers(e.target.value, filterSelect?.value || 'all');
            });
        }

        if (filterSelect) {
            filterSelect.addEventListener('change', (e) => {
                this.filterUsers(searchInput?.value || '', e.target.value);
            });
        }
    }

    // Filter users based on search and filter criteria
    filterUsers(searchTerm, filterType) {
        let filteredUsers = [...this.users];

        // Apply search filter
        if (searchTerm) {
            filteredUsers = filteredUsers.filter(user => 
                user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.email.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Apply type filter
        switch (filterType) {
            case 'newsletter':
                filteredUsers = filteredUsers.filter(user => user.newsletter);
                break;
            case 'recent':
                const oneWeekAgo = new Date();
                oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
                filteredUsers = filteredUsers.filter(user => 
                    user.lastLogin && new Date(user.lastLogin.toDate()) > oneWeekAgo
                );
                break;
        }

        this.renderFilteredUsers(filteredUsers);
    }

    // Render filtered users
    renderFilteredUsers(filteredUsers) {
        const tbody = document.querySelector('.users-table tbody');
        if (tbody) {
            if (filteredUsers.length === 0) {
                tbody.innerHTML = '<tr><td colspan="6" class="no-data">No users match your criteria</td></tr>';
            } else {
                tbody.innerHTML = filteredUsers.map(user => `
                    <tr>
                        <td>
                            <div class="user-info">
                                <div class="user-avatar">
                                    <i class="fas fa-user"></i>
                                </div>
                                <div class="user-details">
                                    <strong>${user.firstName} ${user.lastName}</strong>
                                </div>
                            </div>
                        </td>
                        <td>${user.email}</td>
                        <td>
                            <span class="education-badge ${user.educationLevel}">
                                ${this.formatEducationLevel(user.educationLevel)}
                            </span>
                        </td>
                        <td>
                            <span class="newsletter-status ${user.newsletter ? 'subscribed' : 'not-subscribed'}">
                                <i class="fas fa-${user.newsletter ? 'check' : 'times'}"></i>
                                ${user.newsletter ? 'Subscribed' : 'Not Subscribed'}
                            </span>
                        </td>
                        <td>${this.formatDate(user.createdAt)}</td>
                        <td>${this.formatDate(user.lastLogin)}</td>
                    </tr>
                `).join('');
            }
        }
    }

    // Format education level for display
    formatEducationLevel(level) {
        const levels = {
            'high-school': 'High School',
            'bachelors': 'Bachelor\'s Degree',
            'masters': 'Master\'s Degree',
            'phd': 'PhD',
            'other': 'Other'
        };
        return levels[level] || level;
    }

    // Get recent activity
    getRecentActivity() {
        const activities = [];
        
        // Add recent notes
        const recentNotes = this.notes.slice(0, 3);
        recentNotes.forEach(note => {
            activities.push(`
                <div class="activity-item">
                    <div class="activity-icon note">
                        <i class="fas fa-book"></i>
                    </div>
                    <div class="activity-content">
                        <p>Created note: "${note.title}"</p>
                        <small>${this.formatDate(note.createdAt)}</small>
                    </div>
                </div>
            `);
        });
        
        // Add recent todos
        const recentTodos = this.todos.slice(0, 3);
        recentTodos.forEach(todo => {
            activities.push(`
                <div class="activity-item">
                    <div class="activity-icon todo">
                        <i class="fas fa-tasks"></i>
                    </div>
                    <div class="activity-content">
                        <p>${todo.completed ? 'Completed' : 'Added'} task: "${todo.title}"</p>
                        <small>${this.formatDate(todo.createdAt)}</small>
                    </div>
                </div>
            `);
        });
        
        if (activities.length === 0) {
            return '<p class="no-activity">No recent activity</p>';
        }
        
        return activities.join('');
    }

    // Notes Management
    createNoteCard(note) {
        const noteCard = document.createElement('div');
        noteCard.className = 'note-card';
        noteCard.innerHTML = `
            <div class="note-header">
                <div>
                    <div class="note-title">${note.title}</div>
                    <span class="note-subject">${this.getSubjectLabel(note.subject)}</span>
                </div>
            </div>
            <div class="note-content">${note.content}</div>
            <div class="note-footer">
                <span>${this.formatDate(note.updatedAt)}</span>
                <div class="note-actions">
                    <button onclick="dashboard.editNote(${note.id})" title="Edit Note">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button onclick="dashboard.deleteNote(${note.id})" title="Delete Note">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
        
        return noteCard;
    }

    // Global functions for onclick handlers (need to be accessible)
    editNote(noteId) {
        const note = this.notes.find(n => n.id === noteId);
        if (!note) return;
        
        // Populate modal with note data
        const noteTitle = document.getElementById('noteTitle');
        const noteSubject = document.getElementById('noteSubject');
        const noteContent = document.getElementById('noteContent');
        
        if (noteTitle && noteSubject && noteContent) {
            noteTitle.value = note.title;
            noteSubject.value = note.subject;
            noteContent.value = note.content;
        }
        
        // Change modal title and button
        const noteModal = document.getElementById('noteModal');
        const noteForm = document.getElementById('noteForm');
        
        if (noteModal && noteForm) {
            const modalTitle = noteModal.querySelector('.modal-header h2');
            const submitBtn = noteForm.querySelector('button[type="submit"]');
            
            if (modalTitle) modalTitle.textContent = 'Edit Note';
            if (submitBtn) submitBtn.textContent = 'Update Note';
            
            // Store note ID for update
            noteForm.dataset.editId = noteId;
            
            this.openNoteModal();
        }
    }

    deleteNote(noteId) {
        if (confirm('Are you sure you want to delete this note?')) {
            this.notes = this.notes.filter(n => n.id !== noteId);
            localStorage.setItem('eduguru_notes', JSON.stringify(this.notes));
            this.renderNotes();
        }
    }

    // Todo Management
    createTodoItem(todo) {
        const todoItem = document.createElement('div');
        todoItem.className = `todo-item ${todo.completed ? 'completed' : ''}`;
        todoItem.innerHTML = `
            <div class="todo-checkbox" onclick="dashboard.toggleTodo(${todo.id})">
                ${todo.completed ? '✓' : ''}
            </div>
            <div class="todo-content">
                <div class="todo-title">${todo.title}</div>
                ${todo.description ? `<div class="todo-description">${todo.description}</div>` : ''}
                <div class="todo-meta">
                    <span><i class="fas fa-calendar"></i> ${this.formatDate(todo.dueDate)}</span>
                    <span class="todo-priority ${todo.priority}">${todo.priority.toUpperCase()}</span>
                </div>
            </div>
            <div class="todo-actions">
                <button onclick="dashboard.editTodo(${todo.id})" title="Edit Task">
                    <i class="fas fa-edit"></i>
                </button>
                <button onclick="dashboard.deleteTodo(${todo.id})" title="Delete Task">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        
        return todoItem;
    }

    // Global functions for onclick handlers (need to be accessible)
    editTodo(todoId) {
        const todo = this.todos.find(t => t.id === todoId);
        if (!todo) return;
        
        // Populate modal with todo data
        const todoTitle = document.getElementById('todoTitle');
        const todoDescription = document.getElementById('todoDescription');
        const todoDueDate = document.getElementById('todoDueDate');
        const todoPriority = document.getElementById('todoPriority');
        
        if (todoTitle && todoDescription && todoDueDate && todoPriority) {
            todoTitle.value = todo.title;
            todoDescription.value = todo.description || '';
            todoDueDate.value = todo.dueDate;
            todoPriority.value = todo.priority;
        }
        
        // Change modal title and button
        const todoModal = document.getElementById('todoModal');
        const todoForm = document.getElementById('todoForm');
        
        if (todoModal && todoForm) {
            const modalTitle = todoModal.querySelector('.modal-header h2');
            const submitBtn = todoForm.querySelector('button[type="submit"]');
            
            if (modalTitle) modalTitle.textContent = 'Edit Task';
            if (submitBtn) submitBtn.textContent = 'Update Task';
            
            // Store todo ID for update
            todoForm.dataset.editId = todoId;
            
            this.openTodoModal();
        }
    }

    deleteTodo(todoId) {
        if (confirm('Are you sure you want to delete this task?')) {
            this.todos = this.todos.filter(t => t.id !== todoId);
            localStorage.setItem('eduguru_todos', JSON.stringify(this.todos));
            this.renderTodos();
        }
    }

    toggleTodo(todoId) {
        const todo = this.todos.find(t => t.id === todoId);
        if (!todo) return;
        
        todo.completed = !todo.completed;
        localStorage.setItem('eduguru_todos', JSON.stringify(this.todos));
        this.renderTodos();
    }

    // Modal Management
    openNoteModal() {
        const noteModal = document.getElementById('noteModal');
        if (noteModal) {
            noteModal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    }

    closeNoteModal() {
        const noteModal = document.getElementById('noteModal');
        const noteForm = document.getElementById('noteForm');
        if (noteModal && noteForm) {
            noteModal.classList.remove('active');
            document.body.style.overflow = '';
            noteForm.reset();
            delete noteForm.dataset.editId;
            
            // Reset modal title and button
            const modalTitle = noteModal.querySelector('.modal-header h2');
            const submitBtn = noteForm.querySelector('button[type="submit"]');
            if (modalTitle) modalTitle.textContent = 'Add New Note';
            if (submitBtn) submitBtn.textContent = 'Save Note';
        }
    }

    openTodoModal() {
        const todoModal = document.getElementById('todoModal');
        if (todoModal) {
            todoModal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    }

    closeTodoModal() {
        const todoModal = document.getElementById('todoModal');
        const todoForm = document.getElementById('todoForm');
        if (todoModal && todoForm) {
            todoModal.classList.remove('active');
            document.body.style.overflow = '';
            todoForm.reset();
            delete todoForm.dataset.editId;
            
            // Reset modal title and button
            const modalTitle = todoModal.querySelector('.modal-header h2');
            const submitBtn = todoForm.querySelector('button[type="submit"]');
            if (modalTitle) modalTitle.textContent = 'Add New Task';
            if (submitBtn) submitBtn.textContent = 'Add Task';
        }
    }

    // Utility Functions
    getSubjectLabel(subject) {
        const subjects = {
            'math': 'Mathematics',
            'science': 'Science',
            'history': 'History',
            'literature': 'Literature'
        };
        return subjects[subject] || subject;
    }

    formatDate(dateString) {
        if (!dateString) return 'N/A';
        
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return 'N/A';
            
            return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        } catch (error) {
            return 'N/A';
        }
    }

    // Search and Filter Functions
    searchNotes(query) {
        if (!query.trim()) {
            this.renderNotes();
            return;
        }
        
        const filteredNotes = this.notes.filter(note => 
            note.title.toLowerCase().includes(query.toLowerCase()) ||
            note.content.toLowerCase().includes(query.toLowerCase()) ||
            this.getSubjectLabel(note.subject).toLowerCase().includes(query.toLowerCase())
        );
        
        this.renderFilteredNotes(filteredNotes);
    }

    renderFilteredNotes(filteredNotes) {
        const notesGrid = document.getElementById('notesGrid');
        if (notesGrid) {
            if (filteredNotes.length === 0) {
                notesGrid.innerHTML = '<div class="no-data">No notes match your search</div>';
            } else {
                notesGrid.innerHTML = filteredNotes.map(note => this.createNoteCard(note).outerHTML).join('');
            }
        }
    }

    filterTodos(filter) {
        const filterBtns = document.querySelectorAll('.filter-btn');
        filterBtns.forEach(btn => btn.classList.remove('active'));
        
        const activeBtn = document.querySelector(`[data-filter="${filter}"]`);
        if (activeBtn) {
            activeBtn.classList.add('active');
        }
        
        let filteredTodos = this.todos;
        
        switch (filter) {
            case 'pending':
                filteredTodos = this.todos.filter(todo => !todo.completed);
                break;
            case 'completed':
                filteredTodos = this.todos.filter(todo => todo.completed);
                break;
            case 'overdue':
                const today = new Date().toISOString().split('T')[0];
                filteredTodos = this.todos.filter(todo => !todo.completed && todo.dueDate < today);
                break;
            default:
                filteredTodos = this.todos;
        }
        
        this.renderFilteredTodos(filteredTodos);
    }

    renderFilteredTodos(filteredTodos) {
        const todoList = document.getElementById('todoList');
        if (todoList) {
            if (filteredTodos.length === 0) {
                todoList.innerHTML = '<div class="no-data">No todos match your filter</div>';
            } else {
                todoList.innerHTML = filteredTodos.map(todo => this.createTodoItem(todo).outerHTML).join('');
            }
        }
    }

    // Calendar Management
    checkDayEvents(date) {
        const dateString = date.toISOString().split('T')[0];
        return this.todos.some(todo => todo.dueDate === dateString);
    }

    previousMonth() {
        this.currentMonth.setMonth(this.currentMonth.getMonth() - 1);
        this.renderCalendar();
    }

    nextMonth() {
        this.currentMonth.setMonth(this.currentMonth.getMonth() + 1);
        this.renderCalendar();
    }

    // Data Management
    addNote(noteData) {
        const newNote = {
            id: Date.now(),
            ...noteData,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        this.notes.push(newNote);
        localStorage.setItem('eduguru_notes', JSON.stringify(this.notes));
        this.renderNotes();
    }

    updateNote(noteId, noteData) {
        const noteIndex = this.notes.findIndex(n => n.id === noteId);
        if (noteIndex === -1) return;
        
        this.notes[noteIndex] = {
            ...this.notes[noteIndex],
            ...noteData,
            updatedAt: new Date().toISOString()
        };
        
        localStorage.setItem('eduguru_notes', JSON.stringify(this.notes));
        this.renderNotes();
    }

    addTodo(todoData) {
        const newTodo = {
            id: Date.now(),
            ...todoData,
            completed: false,
            createdAt: new Date().toISOString()
        };
        
        this.todos.push(newTodo);
        localStorage.setItem('eduguru_todos', JSON.stringify(this.todos));
        this.renderTodos();
    }

    updateTodo(todoId, todoData) {
        const todoIndex = this.todos.findIndex(t => t.id === todoId);
        if (todoIndex === -1) return;
        
        this.todos[todoIndex] = {
            ...this.todos[todoIndex],
            ...todoData
        };
        
        localStorage.setItem('eduguru_todos', JSON.stringify(this.todos));
        this.renderTodos();
    }

    // Auto-save functionality
    autoSave() {
        localStorage.setItem('eduguru_notes', JSON.stringify(this.notes));
        localStorage.setItem('eduguru_todos', JSON.stringify(this.todos));
    }

    // Auto-save every 30 seconds
    startAutoSave() {
        setInterval(() => this.autoSave(), 30000);
    }

    // Export data functionality
    exportData() {
        const data = {
            notes: this.notes,
            todos: this.todos,
            exportDate: new Date().toISOString()
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `eduguru-data-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }

    // Import data functionality
    importData(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                if (data.notes) {
                    this.notes = data.notes;
                    localStorage.setItem('eduguru_notes', JSON.stringify(this.notes));
                }
                if (data.todos) {
                    this.todos = data.todos;
                    localStorage.setItem('eduguru_todos', JSON.stringify(this.todos));
                }
                
                this.renderNotes();
                this.renderTodos();
                alert('Data imported successfully!');
            } catch (error) {
                alert('Error importing data. Please check the file format.');
            }
        };
        reader.readAsText(file);
    }

    // Add export/import buttons to dashboard
    addDataManagementButtons() {
        const overviewSection = document.getElementById('overview');
        if (overviewSection) {
            const quickActions = overviewSection.querySelector('.quick-actions');
            if (quickActions) {
                const actionsGrid = quickActions.querySelector('.actions-grid');
                
                const exportBtn = document.createElement('button');
                exportBtn.className = 'action-btn';
                exportBtn.innerHTML = '<i class="fas fa-download"></i><span>Export Data</span>';
                exportBtn.onclick = () => this.exportData();
                
                const importBtn = document.createElement('button');
                importBtn.className = 'action-btn';
                importBtn.innerHTML = '<i class="fas fa-upload"></i><span>Import Data</span>';
                importBtn.onclick = () => {
                    const input = document.createElement('input');
                    input.type = 'file';
                    input.accept = '.json';
                    input.onchange = (e) => this.importData(e.target.files[0]);
                    input.click();
                };
                
                if (actionsGrid) {
                    actionsGrid.appendChild(exportBtn);
                    actionsGrid.appendChild(importBtn);
                }
            }
        }
    }

    // Performance monitoring
    logPerformance() {
        const loadTime = performance.now();
        console.log(`Dashboard loaded in ${loadTime.toFixed(2)}ms`);
    }
}

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Check if Firebase is available
    if (typeof firebase !== 'undefined' && window.auth && window.db) {
        window.dashboard = new Dashboard();
    } else {
        console.error('Firebase not initialized. Please check your configuration.');
        // Show error message to user
        const errorDiv = document.createElement('div');
        errorDiv.className = 'auth-message auth-message-error';
        errorDiv.textContent = 'Firebase configuration error. Please check your setup.';
        document.body.appendChild(errorDiv);
    }
});

// Performance monitoring
function logPerformance() {
    const loadTime = performance.now();
    console.log(`Dashboard loaded in ${loadTime.toFixed(2)}ms`);
}

// Log performance on load
window.addEventListener('load', logPerformance);

console.log('EduGuru Dashboard System Loaded');
console.log('Features: Notes, Todo List, Calendar, Progress Tracking');
