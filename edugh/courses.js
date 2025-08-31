// Courses Page JavaScript

// Course Data
const coursesData = [
    {
        id: 1,
        title: "Web Development Fundamentals",
        description: "Master HTML, CSS, and JavaScript to build modern websites from scratch. Learn responsive design and modern web development practices.",
        category: "technology",
        level: "beginner",
        duration: "12 hours",
        price: 99,
        originalPrice: 199,
        rating: 4.8,
        students: 2500,
        instructor: {
            name: "Sarah Johnson",
            title: "Senior Web Developer at TechCorp"
        },
        curriculum: [
            "HTML5 structure and semantics",
            "CSS3 styling and layouts",
            "JavaScript fundamentals",
            "Responsive design principles",
            "Modern development tools"
        ],
        icon: "fas fa-code"
    },
    {
        id: 2,
        title: "Machine Learning Basics",
        description: "Introduction to AI and machine learning concepts with Python implementation. Build your first ML models.",
        category: "technology",
        level: "intermediate",
        duration: "16 hours",
        price: 149,
        originalPrice: 249,
        rating: 4.9,
        students: 1800,
        instructor: {
            name: "Michael Chen",
            title: "Data Scientist at DataFlow"
        },
        curriculum: [
            "Python for ML",
            "Statistical concepts",
            "Supervised learning",
            "Unsupervised learning",
            "Model evaluation"
        ],
        icon: "fas fa-robot"
    },
    {
        id: 3,
        title: "UI/UX Design Mastery",
        description: "Create stunning user interfaces and exceptional user experiences with modern design tools and principles.",
        category: "design",
        level: "advanced",
        duration: "14 hours",
        price: 129,
        originalPrice: 179,
        rating: 4.7,
        students: 1200,
        instructor: {
            name: "Emily Rodriguez",
            title: "Lead UX Designer at CreativeStudio"
        },
        curriculum: [
            "Design principles",
            "User research methods",
            "Wireframing and prototyping",
            "Visual design fundamentals",
            "Usability testing"
        ],
        icon: "fas fa-palette"
    },
    {
        id: 4,
        title: "Digital Marketing Strategy",
        description: "Learn comprehensive digital marketing strategies including SEO, social media, and content marketing.",
        category: "business",
        level: "beginner",
        duration: "10 hours",
        price: 89,
        originalPrice: 149,
        rating: 4.6,
        students: 2100,
        instructor: {
            name: "David Wilson",
            title: "Marketing Director at GrowthCo"
        },
        curriculum: [
            "SEO fundamentals",
            "Social media marketing",
            "Content strategy",
            "Email marketing",
            "Analytics and reporting"
        ],
        icon: "fas fa-bullhorn"
    },
    {
        id: 5,
        title: "Python Programming Complete",
        description: "From basics to advanced Python programming. Build real-world applications and automate tasks.",
        category: "technology",
        level: "beginner",
        duration: "20 hours",
        price: 119,
        originalPrice: 199,
        rating: 4.8,
        students: 3200,
        instructor: {
            name: "Alex Thompson",
            title: "Python Developer at CodeWorks"
        },
        curriculum: [
            "Python syntax and basics",
            "Data structures",
            "Object-oriented programming",
            "File handling",
            "Web scraping and APIs"
        ],
        icon: "fas fa-python"
    },
    {
        id: 6,
        title: "Financial Analysis Fundamentals",
        description: "Master financial analysis, budgeting, and investment strategies for personal and business finance.",
        category: "business",
        level: "intermediate",
        duration: "12 hours",
        price: 109,
        originalPrice: 169,
        rating: 4.7,
        students: 1500,
        instructor: {
            name: "Lisa Park",
            title: "Financial Analyst at FinancePro"
        },
        curriculum: [
            "Financial statements analysis",
            "Budgeting techniques",
            "Investment strategies",
            "Risk management",
            "Financial modeling"
        ],
        icon: "fas fa-chart-line"
    },
    {
        id: 7,
        title: "Spanish for Beginners",
        description: "Learn Spanish from scratch with native speakers. Master basic conversations and grammar.",
        category: "languages",
        level: "beginner",
        duration: "15 hours",
        price: 79,
        originalPrice: 129,
        rating: 4.5,
        students: 2800,
        instructor: {
            name: "Carlos Mendez",
            title: "Spanish Language Instructor"
        },
        curriculum: [
            "Basic greetings and introductions",
            "Essential vocabulary",
            "Grammar fundamentals",
            "Conversation practice",
            "Cultural insights"
        ],
        icon: "fas fa-globe"
    },
    {
        id: 8,
        title: "Photography Masterclass",
        description: "Capture stunning photos with any camera. Learn composition, lighting, and post-processing.",
        category: "music",
        level: "intermediate",
        duration: "18 hours",
        price: 139,
        originalPrice: 199,
        rating: 4.8,
        students: 1900,
        instructor: {
            name: "Rachel Green",
            title: "Professional Photographer"
        },
        curriculum: [
            "Camera fundamentals",
            "Composition techniques",
            "Lighting principles",
            "Portrait photography",
            "Photo editing basics"
        ],
        icon: "fas fa-camera"
    }
];

// Global Variables
let currentCourses = [...coursesData];
let displayedCourses = 6;
let currentFilters = {
    search: '',
    level: '',
    duration: '',
    price: '',
    category: ''
};

// DOM Elements
const coursesGrid = document.getElementById('coursesGrid');
const courseSearch = document.getElementById('courseSearch');
const levelFilter = document.getElementById('levelFilter');
const durationFilter = document.getElementById('durationFilter');
const priceFilter = document.getElementById('priceFilter');
const clearFiltersBtn = document.getElementById('clearFilters');
const sortCourses = document.getElementById('sortCourses');
const loadMoreBtn = document.getElementById('loadMoreBtn');
const courseModal = document.getElementById('courseModal');

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
    initializeCourses();
    setupEventListeners();
    setupCategoryFilters();
});

// Initialize courses display
function initializeCourses() {
    renderCourses(currentCourses.slice(0, displayedCourses));
    updateLoadMoreButton();
}

// Setup event listeners
function setupEventListeners() {
    // Search functionality
    courseSearch.addEventListener('input', function(e) {
        currentFilters.search = e.target.value;
        applyFilters();
    });

    // Filter changes
    levelFilter.addEventListener('change', function(e) {
        currentFilters.level = e.target.value;
        applyFilters();
    });

    durationFilter.addEventListener('change', function(e) {
        currentFilters.duration = e.target.value;
        applyFilters();
    });

    priceFilter.addEventListener('change', function(e) {
        currentFilters.price = e.target.value;
        applyFilters();
    });

    // Clear filters
    clearFiltersBtn.addEventListener('click', clearAllFilters);

    // Sort courses
    sortCourses.addEventListener('change', function(e) {
        sortCoursesList(e.target.value);
    });

    // Load more courses
    loadMoreBtn.addEventListener('click', loadMoreCourses);

    // Close modal when clicking outside
    courseModal.addEventListener('click', function(e) {
        if (e.target === courseModal) {
            closeCourseModal();
        }
    });

    // Close modal with Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeCourseModal();
        }
    });
}

// Setup category filters
function setupCategoryFilters() {
    const categoryCards = document.querySelectorAll('.category-card');
    categoryCards.forEach(card => {
        card.addEventListener('click', function() {
            const category = this.dataset.category;
            if (currentFilters.category === category) {
                currentFilters.category = '';
                this.style.borderColor = 'transparent';
            } else {
                // Remove active state from all cards
                categoryCards.forEach(c => c.style.borderColor = 'transparent');
                currentFilters.category = category;
                this.style.borderColor = 'var(--primary-yellow)';
            }
            applyFilters();
        });
    });
}

// Apply all filters
function applyFilters() {
    let filteredCourses = [...coursesData];

    // Search filter
    if (currentFilters.search) {
        const searchTerm = currentFilters.search.toLowerCase();
        filteredCourses = filteredCourses.filter(course => 
            course.title.toLowerCase().includes(searchTerm) ||
            course.description.toLowerCase().includes(searchTerm) ||
            course.instructor.name.toLowerCase().includes(searchTerm)
        );
    }

    // Level filter
    if (currentFilters.level) {
        filteredCourses = filteredCourses.filter(course => 
            course.level === currentFilters.level
        );
    }

    // Duration filter
    if (currentFilters.duration) {
        filteredCourses = filteredCourses.filter(course => {
            const duration = parseInt(course.duration);
            switch (currentFilters.duration) {
                case '0-5': return duration <= 5;
                case '5-10': return duration > 5 && duration <= 10;
                case '10-20': return duration > 10 && duration <= 20;
                case '20+': return duration > 20;
                default: return true;
            }
        });
    }

    // Price filter
    if (currentFilters.price) {
        filteredCourses = filteredCourses.filter(course => {
            if (currentFilters.price === 'free') return course.price === 0;
            if (currentFilters.price === 'paid') return course.price > 0;
            return true;
        });
    }

    // Category filter
    if (currentFilters.category) {
        filteredCourses = filteredCourses.filter(course => 
            course.category === currentFilters.category
        );
    }

    currentCourses = filteredCourses;
    displayedCourses = 6;
    renderCourses(currentCourses.slice(0, displayedCourses));
    updateLoadMoreButton();
}

// Clear all filters
function clearAllFilters() {
    currentFilters = {
        search: '',
        level: '',
        duration: '',
        price: '',
        category: ''
    };

    // Reset form elements
    courseSearch.value = '';
    levelFilter.value = '';
    durationFilter.value = '';
    priceFilter.value = '';

    // Reset category cards
    document.querySelectorAll('.category-card').forEach(card => {
        card.style.borderColor = 'transparent';
    });

    // Reset courses display
    currentCourses = [...coursesData];
    displayedCourses = 6;
    renderCourses(currentCourses.slice(0, displayedCourses));
    updateLoadMoreButton();
}

// Sort courses
function sortCoursesList(sortBy) {
    switch (sortBy) {
        case 'popular':
            currentCourses.sort((a, b) => b.students - a.students);
            break;
        case 'newest':
            currentCourses.sort((a, b) => b.id - a.id);
            break;
        case 'rating':
            currentCourses.sort((a, b) => b.rating - a.rating);
            break;
        case 'price-low':
            currentCourses.sort((a, b) => a.price - b.price);
            break;
        case 'price-high':
            currentCourses.sort((a, b) => b.price - a.price);
            break;
    }
    
    displayedCourses = 6;
    renderCourses(currentCourses.slice(0, displayedCourses));
    updateLoadMoreButton();
}

// Render courses
function renderCourses(courses) {
    if (courses.length === 0) {
        coursesGrid.innerHTML = `
            <div class="no-courses">
                <i class="fas fa-search"></i>
                <h3>No courses found</h3>
                <p>Try adjusting your filters or search terms</p>
            </div>
        `;
        return;
    }

    coursesGrid.innerHTML = courses.map(course => `
        <div class="course-card" onclick="openCourseModal(${course.id})">
            <div class="course-image">
                <div class="course-overlay">
                    <span class="course-level">${course.level}</span>
                    <span class="course-rating">
                        <i class="fas fa-star"></i>
                        ${course.rating}
                    </span>
                </div>
                <i class="${course.icon}"></i>
            </div>
            <div class="course-content">
                <h3>${course.title}</h3>
                <p>${course.description}</p>
                <div class="course-meta">
                    <span><i class="fas fa-clock"></i> ${course.duration}</span>
                    <span><i class="fas fa-users"></i> ${course.students.toLocaleString()}</span>
                </div>
                <div class="course-footer">
                    <span class="course-price">$${course.price}</span>
                    ${course.originalPrice > course.price ? 
                        `<span class="original-price">$${course.originalPrice}</span>` : 
                        ''
                    }
                </div>
            </div>
        </div>
    `).join('');
}

// Load more courses
function loadMoreCourses() {
    displayedCourses += 6;
    renderCourses(currentCourses.slice(0, displayedCourses));
    updateLoadMoreButton();
}

// Update load more button
function updateLoadMoreButton() {
    if (displayedCourses >= currentCourses.length) {
        loadMoreBtn.style.display = 'none';
    } else {
        loadMoreBtn.style.display = 'inline-flex';
    }
}

// Open course modal
function openCourseModal(courseId) {
    const course = coursesData.find(c => c.id === courseId);
    if (!course) return;

    // Populate modal content
    document.getElementById('modalCourseTitle').textContent = course.title;
    document.getElementById('modalCourseDescription').textContent = course.description;
    document.getElementById('modalInstructorName').textContent = course.instructor.name;
    document.getElementById('modalInstructorTitle').textContent = course.instructor.title;
    document.getElementById('modalCoursePrice').textContent = `$${course.price}`;
    document.getElementById('modalOriginalPrice').textContent = `$${course.originalPrice}`;

    // Populate curriculum
    const curriculumList = document.getElementById('modalCourseCurriculum');
    curriculumList.innerHTML = course.curriculum.map(item => `<li>${item}</li>`).join('');

    // Update modal meta info
    const modalMeta = document.querySelector('.modal-body .course-meta');
    modalMeta.innerHTML = `
        <span class="course-level">${course.level}</span>
        <span class="course-duration"><i class="fas fa-clock"></i> ${course.duration}</span>
        <span class="course-students"><i class="fas fa-users"></i> ${course.students.toLocaleString()} students</span>
    `;

    // Show modal
    courseModal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

// Close course modal
function closeCourseModal() {
    courseModal.classList.remove('active');
    document.body.style.overflow = '';
}

// Enroll in course
function enrollCourse() {
    // Check if user is logged in
    if (!isUserLoggedIn()) {
        // Redirect to login page
        window.location.href = 'login.html';
        return;
    }

    // Here you would typically handle the enrollment process
    alert('Course enrollment functionality would be implemented here!');
    closeCourseModal();
}

// Check if user is logged in (placeholder function)
function isUserLoggedIn() {
    // This would check Firebase auth state
    // For now, return false to demonstrate redirect
    return false;
}

// Mobile navigation toggle
document.addEventListener('DOMContentLoaded', function() {
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');

    if (navToggle && navMenu) {
        navToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
        });
    }
});

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Add scroll animations
function addScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
            }
        });
    }, observerOptions);

    // Observe elements for animation
    document.querySelectorAll('.category-card, .course-card').forEach(el => {
        observer.observe(el);
    });
}

// Initialize scroll animations
document.addEventListener('DOMContentLoaded', addScrollAnimations);

// Performance monitoring
function logPerformance() {
    const loadTime = performance.now();
    console.log(`Courses page loaded in ${loadTime.toFixed(2)}ms`);
}

// Log performance on load
window.addEventListener('load', logPerformance);

console.log('EduGuru Courses System Loaded');
console.log('Features: Course browsing, filtering, search, and preview');

