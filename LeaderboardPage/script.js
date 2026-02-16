document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const nameInput = document.getElementById('nameInput');
    const pointsInput = document.getElementById('pointsInput');
    const tagInput = document.getElementById('tagInput');
    const addBtn = document.getElementById('addBtn');
    const sortSelect = document.getElementById('sortSelect');
    const tagFilter = document.getElementById('tagFilter');
    const searchInput = document.getElementById('searchInput');
    const leaderboard = document.getElementById('leaderboard');
    const randomizeBtn = document.getElementById('randomizeBtn');
    const resultOverlay = document.getElementById('resultOverlay');
    const selectedStudent = document.getElementById('selectedStudent');
    const closeOverlayBtn = document.getElementById('closeOverlayBtn');
    const editOverlay = document.getElementById('editOverlay');
    const editNameInput = document.getElementById('editNameInput');
    const editTagInput = document.getElementById('editTagInput');
    const editPointsInput = document.getElementById('editPointsInput');
    const saveEditBtn = document.getElementById('saveEditBtn');
    const cancelEditBtn = document.getElementById('cancelEditBtn');
    const sidebar = document.getElementById('sidebar');
    const sidebarToggle = document.getElementById('sidebarToggle');
    const sidebarToggleBtn = document.getElementById('sidebarToggleBtn');
    const addGradeBtn = document.getElementById('addGradeBtn');
    const gradeList = document.getElementById('gradeList');
    const addGradeOverlay = document.getElementById('addGradeOverlay');
    const gradeNameInput = document.getElementById('gradeNameInput');
    const saveGradeBtn = document.getElementById('saveGradeBtn');
    const cancelGradeBtn = document.getElementById('cancelGradeBtn');
    const renameGradeOverlay = document.getElementById('renameGradeOverlay');
    const renameGradeInput = document.getElementById('renameGradeInput');
    const saveRenameGradeBtn = document.getElementById('saveRenameGradeBtn');
    const cancelRenameGradeBtn = document.getElementById('cancelRenameGradeBtn');
    const addClassOverlay = document.getElementById('addClassOverlay');
    const classNameInput = document.getElementById('classNameInput');
    const saveClassBtn = document.getElementById('saveClassBtn');
    const cancelClassBtn = document.getElementById('cancelClassBtn');
    const renameClassOverlay = document.getElementById('renameClassOverlay');
    const renameClassInput = document.getElementById('renameClassInput');
    const saveRenameClassBtn = document.getElementById('saveRenameClassBtn');
    const cancelRenameClassBtn = document.getElementById('cancelRenameClassBtn');
    const currentGradeClass = document.getElementById('currentGradeClass');
    
    // Data
    let grades = [];
    let currentGradeId = null;
    let currentClassId = null;
    let entries = [];
    let allTags = new Set();
    let isSpinning = false;
    let spinInterval;
    let currentIndex = 0;
    let targetIndex = 0;
    let filteredEntries = [];
    let editingEntryId = null;
    let editingGradeId = null;
    let editingClassGradeId = null;
    let editingClassId = null;
    
    // Initialize
    loadData();
    renderSidebar();
    if (currentGradeId && currentClassId) {
        loadClassEntries();
        renderLeaderboard();
        updateTagFilter();
    }
    updateSidebarToggleBtnVisibility();
    
    // Event Listeners
    sidebarToggle.addEventListener('click', toggleSidebar);
    sidebarToggleBtn.addEventListener('click', toggleSidebar);
    addGradeBtn.addEventListener('click', openAddGradeOverlay);
    saveGradeBtn.addEventListener('click', addGrade);
    cancelGradeBtn.addEventListener('click', closeAddGradeOverlay);
    saveRenameGradeBtn.addEventListener('click', renameGrade);
    cancelRenameGradeBtn.addEventListener('click', closeRenameGradeOverlay);
    saveClassBtn.addEventListener('click', addClass);
    cancelClassBtn.addEventListener('click', closeAddClassOverlay);
    saveRenameClassBtn.addEventListener('click', renameClass);
    cancelRenameClassBtn.addEventListener('click', closeRenameClassOverlay);
    addBtn.addEventListener('click', addEntry);
    nameInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') addEntry();
    });
    sortSelect.addEventListener('change', renderLeaderboard);
    tagFilter.addEventListener('change', renderLeaderboard);
    searchInput.addEventListener('input', renderLeaderboard);
    randomizeBtn.addEventListener('click', pickRandomStudent);
    closeOverlayBtn.addEventListener('click', closeOverlay);
    saveEditBtn.addEventListener('click', saveEdit);
    cancelEditBtn.addEventListener('click', closeEditOverlay);
    
    // Sidebar Functions
    function toggleSidebar() {
        sidebar.classList.toggle('collapsed');
        updateSidebarToggleBtnVisibility();
    }

    function updateSidebarToggleBtnVisibility() {
        if (sidebar.classList.contains('collapsed')) {
            sidebarToggleBtn.classList.add('visible');
        } else {
            sidebarToggleBtn.classList.remove('visible');
        }
    }
    
    function renderSidebar() {
        gradeList.innerHTML = '';
        grades.forEach(grade => {
            const gradeItem = document.createElement('div');
            gradeItem.className = 'grade-item';
            gradeItem.innerHTML = `
                <div class="grade-title">
                    <span>${grade.name}</span>
                    <div class="grade-actions">
                        <button class="rename-grade-btn" data-grade-id="${grade.id}">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="delete-grade-btn" data-grade-id="${grade.id}">
                            <i class="fas fa-trash"></i>
                        </button>
                        <button class="add-class-btn" data-grade-id="${grade.id}">
                            <i class="fas fa-plus"></i>
                        </button>
                    </div>
                </div>
                <div class="class-list"></div>
            `;
            const classList = gradeItem.querySelector('.class-list');
            grade.classes.forEach(cls => {
                const classItem = document.createElement('div');
                classItem.className = `class-item ${currentGradeId === grade.id && currentClassId === cls.id ? 'active' : ''}`;
                classItem.innerHTML = `
                    <span>${cls.name}</span>
                    <div class="class-actions">
                        <button class="rename-class-btn" data-grade-id="${grade.id}" data-class-id="${cls.id}">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="delete-class-btn" data-grade-id="${grade.id}" data-class-id="${cls.id}">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                `;
                classItem.addEventListener('click', (e) => {
                    if (e.target.closest('.delete-class-btn') || e.target.closest('.rename-class-btn')) return;
                    switchClass(grade.id, cls.id);
                });
                classList.appendChild(classItem);
            });
            gradeItem.querySelector('.add-class-btn').addEventListener('click', () => openAddClassOverlay(grade.id));
            gradeItem.querySelector('.rename-grade-btn').addEventListener('click', () => openRenameGradeOverlay(grade.id));
            gradeItem.querySelector('.delete-grade-btn').addEventListener('click', () => deleteGrade(grade.id));
            gradeList.appendChild(gradeItem);
        });
        // Add delete and rename class event listeners
        document.querySelectorAll('.delete-class-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const gradeId = btn.dataset.gradeId;
                const classId = btn.dataset.classId;
                deleteClass(gradeId, classId);
            });
        });
        document.querySelectorAll('.rename-class-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const gradeId = btn.dataset.gradeId;
                const classId = btn.dataset.classId;
                openRenameClassOverlay(gradeId, classId);
            });
        });
    }
    
    function openAddGradeOverlay() {
        gradeNameInput.value = '';
        addGradeOverlay.classList.add('visible');
    }
    
    function closeAddGradeOverlay() {
        addGradeOverlay.classList.remove('visible');
        gradeNameInput.value = '';
    }
    
    function addGrade() {
        const name = gradeNameInput.value.trim();
        if (name) {
            const newGrade = {
                id: Date.now(),
                name: name,
                classes: []
            };
            grades.push(newGrade);
            saveData();
            renderSidebar();
            closeAddGradeOverlay();
        }
    }

    function openRenameGradeOverlay(gradeId) {
        const grade = grades.find(g => g.id === gradeId);
        if (grade) {
            editingGradeId = gradeId;
            renameGradeInput.value = grade.name;
            renameGradeOverlay.classList.add('visible');
        }
    }

    function closeRenameGradeOverlay() {
        renameGradeOverlay.classList.remove('visible');
        renameGradeInput.value = '';
        editingGradeId = null;
    }

    function renameGrade() {
        const newName = renameGradeInput.value.trim();
        if (newName && editingGradeId) {
            const grade = grades.find(g => g.id === editingGradeId);
            if (grade) {
                grade.name = newName;
                saveData();
                renderSidebar();
                updateCurrentClassInfo();
                closeRenameGradeOverlay();
            }
        }
    }

    function deleteGrade(gradeId) {
        grades = grades.filter(g => g.id !== gradeId);
        if (currentGradeId === gradeId) {
            currentGradeId = null;
            currentClassId = null;
            entries = [];
            renderLeaderboard();
            updateTagFilter();
            updateCurrentClassInfo();
        }
        saveData();
        renderSidebar();
    }
    
    function openAddClassOverlay(gradeId) {
        classNameInput.value = '';
        addClassOverlay.dataset.gradeId = gradeId;
        addClassOverlay.classList.add('visible');
    }
    
    function closeAddClassOverlay() {
        addClassOverlay.classList.remove('visible');
        classNameInput.value = '';
        delete addClassOverlay.dataset.gradeId;
    }
    
    function addClass() {
        const name = classNameInput.value.trim();
        const gradeId = addClassOverlay.dataset.gradeId;
        if (name && gradeId) {
            const grade = grades.find(g => g.id === parseInt(gradeId));
            if (grade) {
                const newClass = {
                    id: Date.now(),
                    name: name,
                    entries: []
                };
                grade.classes.push(newClass);
                saveData();
                renderSidebar();
                closeAddClassOverlay();
            }
        }
    }

    function openRenameClassOverlay(gradeId, classId) {
        const grade = grades.find(g => g.id === parseInt(gradeId));
        if (grade) {
            const cls = grade.classes.find(c => c.id === parseInt(classId));
            if (cls) {
                editingClassGradeId = gradeId;
                editingClassId = classId;
                renameClassInput.value = cls.name;
                renameClassOverlay.classList.add('visible');
            }
        }
    }

    function closeRenameClassOverlay() {
        renameClassOverlay.classList.remove('visible');
        renameClassInput.value = '';
        editingClassGradeId = null;
        editingClassId = null;
    }

    function renameClass() {
        const newName = renameClassInput.value.trim();
        if (newName && editingClassGradeId && editingClassId) {
            const grade = grades.find(g => g.id === parseInt(editingClassGradeId));
            if (grade) {
                const cls = grade.classes.find(c => c.id === parseInt(editingClassId));
                if (cls) {
                    cls.name = newName;
                    saveData();
                    renderSidebar();
                    updateCurrentClassInfo();
                    closeRenameClassOverlay();
                }
            }
        }
    }
    
    function deleteClass(gradeId, classId) {
        const grade = grades.find(g => g.id === parseInt(gradeId));
        if (grade) {
            grade.classes = grade.classes.filter(cls => cls.id !== parseInt(classId));
            if (currentGradeId === parseInt(gradeId) && currentClassId === parseInt(classId)) {
                currentGradeId = null;
                currentClassId = null;
                entries = [];
                renderLeaderboard();
                updateTagFilter();
                updateCurrentClassInfo();
            }
            saveData();
            renderSidebar();
        }
    }
    
    function switchClass(gradeId, classId) {
        currentGradeId = gradeId;
        currentClassId = classId;
        loadClassEntries();
        renderLeaderboard();
        updateTagFilter();
        updateCurrentClassInfo();
        renderSidebar();
        saveData();
    }
    
    function loadClassEntries() {
        const grade = grades.find(g => g.id === currentGradeId);
        if (grade) {
            const cls = grade.classes.find(c => c.id === currentClassId);
            if (cls) {
                entries = cls.entries;
                allTags = new Set(entries.filter(e => e.tag).map(e => e.tag));
            } else {
                entries = [];
                allTags = new Set();
            }
        } else {
            entries = [];
            allTags = new Set();
        }
    }
    
    function updateCurrentClassInfo() {
        if (currentGradeId && currentClassId) {
            const grade = grades.find(g => g.id === currentGradeId);
            const cls = grade?.classes.find(c => c.id === currentClassId);
            currentGradeClass.textContent = `${grade?.name} - ${cls?.name}`;
        } else {
            currentGradeClass.textContent = 'Select a grade and class';
        }
    }
    
    // Leaderboard Functions
    function addEntry() {
        if (!currentGradeId || !currentClassId) {
            alert('Please select a grade and class first.');
            return;
        }
        const name = nameInput.value.trim();
        const points = parseInt(pointsInput.value) || 0;
        const tag = tagInput.value.trim();
        
        if (name) {
            const newEntry = {
                id: Date.now(),
                name: name,
                points: points,
                tag: tag || null
            };
            
            entries.push(newEntry);
            if (tag) allTags.add(tag);
            
            saveClassEntries();
            renderLeaderboard();
            updateTagFilter();
            
            nameInput.value = '';
            pointsInput.value = '';
            tagInput.value = '';
            nameInput.focus();
        }
    }
    
    function renderLeaderboard() {
        leaderboard.innerHTML = '';
        
        if (!currentGradeId || !currentClassId) {
            leaderboard.innerHTML = '<div class="empty-message">Please select a grade and class</div>';
            randomizeBtn.disabled = true;
            return;
        }
        
        if (entries.length === 0) {
            leaderboard.innerHTML = '<div class="empty-message">No entries yet</div>';
            randomizeBtn.disabled = true;
            return;
        }
        
        randomizeBtn.disabled = false;
        
        // Filter entries
        const searchTerm = searchInput.value.toLowerCase();
        const selectedTag = tagFilter.value;
        
        filteredEntries = entries.filter(entry => {
            const matchesSearch = entry.name.toLowerCase().includes(searchTerm);
            const matchesTag = !selectedTag || entry.tag === selectedTag;
            return matchesSearch && matchesTag;
        });
        
        if (filteredEntries.length === 0) {
            leaderboard.innerHTML = '<div class="empty-message">No matching entries</div>';
            randomizeBtn.disabled = true;
            return;
        }
        
        // Sort entries
        const sortValue = sortSelect.value;
        filteredEntries.sort((a, b) => {
            switch(sortValue) {
                case 'points-desc': return b.points - a.points;
                case 'points-asc': return a.points - b.points;
                case 'name-asc': return a.name.localeCompare(b.name);
                case 'name-desc': return b.name.localeCompare(a.name);
                case 'tag-asc': return (a.tag || '').localeCompare(b.tag || '');
                case 'tag-desc': return (b.tag || '').localeCompare(a.tag || '');
                default: return 0;
            }
        });
        
        // Render entries
        filteredEntries.forEach((entry, index) => {
            const entryElement = document.createElement('div');
            entryElement.className = 'leaderboard-item';
            entryElement.dataset.index = index;
            entryElement.innerHTML = `
                <span class="leaderboard-rank">${index + 1}</span>
                <button class="edit-btn" data-id="${entry.id}">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="delete-btn" data-id="${entry.id}">
                    <i class="fas fa-trash"></i>
                </button>
                <span class="leaderboard-name">${entry.name}</span>
                ${entry.tag ? `<span class="leaderboard-tag">${entry.tag}</span>` : '<span></span>'}
                <span class="leaderboard-points">${entry.points}</span>
            `;
            leaderboard.appendChild(entryElement);
            
            // Add edit event listener
            entryElement.querySelector('.edit-btn').addEventListener('click', function() {
                openEditOverlay(entry.id);
            });
            
            // Add delete event listener
            entryElement.querySelector('.delete-btn').addEventListener('click', function() {
                deleteEntry(entry.id);
            });
        });
    }
    
    function deleteEntry(id) {
        const entryIndex = entries.findIndex(e => e.id === id);
        if (entryIndex !== -1) {
            const tag = entries[entryIndex].tag;
            entries.splice(entryIndex, 1);
            
            if (tag && !entries.some(e => e.tag === tag)) {
                allTags.delete(tag);
            }
            
            saveClassEntries();
            renderLeaderboard();
            updateTagFilter();
        }
    }
    
    function openEditOverlay(id) {
        const entry = entries.find(e => e.id === id);
        if (!entry) return;
        
        editingEntryId = id;
        editNameInput.value = entry.name;
        editTagInput.value = entry.tag || '';
        editPointsInput.value = entry.points;
        editOverlay.classList.add('visible');
    }
    
    function saveEdit() {
        const entry = entries.find(e => e.id === editingEntryId);
        if (!entry) return;
        
        const newName = editNameInput.value.trim();
        const newTag = editTagInput.value.trim() || null;
        const newPoints = parseInt(editPointsInput.value) || 0;
        
        if (newName) {
            const oldTag = entry.tag;
            entry.name = newName;
            entry.tag = newTag;
            entry.points = newPoints;
            
            if (oldTag && !entries.some(e => e.tag === oldTag && e.id !== entry.id)) {
                allTags.delete(oldTag);
            }
            if (newTag) allTags.add(newTag);
            
            saveClassEntries();
            renderLeaderboard();
            updateTagFilter();
            closeEditOverlay();
        }
    }
    
    function closeEditOverlay() {
        editOverlay.classList.remove('visible');
        editingEntryId = null;
        editNameInput.value = '';
        editTagInput.value = '';
        editPointsInput.value = '';
    }
    
    function updateTagFilter() {
        tagFilter.innerHTML = '<option value="">All Tags</option>';
        
        const sortedTags = Array.from(allTags).sort();
        sortedTags.forEach(tag => {
            const option = document.createElement('option');
            option.value = tag;
            option.textContent = tag;
            tagFilter.appendChild(option);
        });
    }
    
    function saveClassEntries() {
        const grade = grades.find(g => g.id === currentGradeId);
        if (grade) {
            const cls = grade.classes.find(c => c.id === currentClassId);
            if (cls) {
                cls.entries = entries;
                saveData();
            }
        }
    }
    
    function saveData() {
        localStorage.setItem('classCtrlData', JSON.stringify({
            grades: grades,
            currentGradeId: currentGradeId,
            currentClassId: currentClassId
        }));
    }
    
    function loadData() {
        const savedData = localStorage.getItem('classCtrlData');
        if (savedData) {
            const data = JSON.parse(savedData);
            grades = data.grades || [];
            currentGradeId = data.currentGradeId || null;
            currentClassId = data.currentClassId || null;
        }
    }
    
    function pickRandomStudent() {
        if (isSpinning || filteredEntries.length === 0) return;
        
        isSpinning = true;
        randomizeBtn.disabled = true;
        targetIndex = Math.floor(Math.random() * filteredEntries.length);
        currentIndex = 0;
        
        // Reset highlights
        document.querySelectorAll('.leaderboard-item').forEach(item => {
            item.classList.remove('highlight', 'slowing', 'selected');
        });
        
        // Start spinning with fast speed
        spinInterval = setInterval(spin, 80);
        
        // Slow down after 1 second
        setTimeout(() => {
            clearInterval(spinInterval);
            spinInterval = setInterval(spin, 150);
            
            // Slow down more after another 0.5 seconds
            setTimeout(() => {
                clearInterval(spinInterval);
                spinInterval = setInterval(spin, 300);
                
                // Stop on target after another 0.5 seconds
                setTimeout(() => {
                    clearInterval(spinInterval);
                    stopOnTarget();
                }, 500);
            }, 500);
        }, 1000);
    }
    
    function spin() {
        // Remove previous highlight
        document.querySelectorAll('.leaderboard-item').forEach(item => {
            item.classList.remove('highlight', 'slowing');
        });
        
        // Update current index
        currentIndex = (currentIndex + 1) % filteredEntries.length;
        
        // Apply highlight
        const currentItem = document.querySelector(`.leaderboard-item[data-index="${currentIndex}"]`);
        if (currentItem) {
            currentItem.classList.add('highlight');
        }
    }
    
    function stopOnTarget() {
        // Remove all highlights
        document.querySelectorAll('.leaderboard-item').forEach(item => {
            item.classList.remove('highlight', 'slowing');
        });
        
        // Animate to target
        let steps = 0;
        const animateToTarget = setInterval(() => {
            // Remove previous highlight
            document.querySelectorAll('.leaderboard-item').forEach(item => {
                item.classList.remove('highlight', 'slowing');
            });
            
            // Move to next index
            currentIndex = (currentIndex + 1) % filteredEntries.length;
            
            // Apply highlight
            const currentItem = document.querySelector(`.leaderboard-item[data-index="${currentIndex}"]`);
            if (currentItem) {
                currentItem.classList.add('slowing');
            }
            
            steps++;
            
            // Stop when we reach target
            if (currentIndex === targetIndex || steps > filteredEntries.length) {
                clearInterval(animateToTarget);
                highlightSelected();
            }
        }, 200);
    }
    
    function highlightSelected() {
        // Highlight selected student
        const selectedItem = document.querySelector(`.leaderboard-item[data-index="${targetIndex}"]`);
        if (selectedItem) {
            selectedItem.classList.add('selected');
            selectedStudent.textContent = filteredEntries[targetIndex].name;
            
            // Add 500ms delay before showing overlay
            setTimeout(() => {
                resultOverlay.classList.add('visible');
                isSpinning = false;
                randomizeBtn.disabled = false;
            }, 500);
        }
    }
    
    function closeOverlay() {
        resultOverlay.classList.remove('visible');
        document.querySelectorAll('.leaderboard-item').forEach(item => {
            item.classList.remove('selected');
        });
    }
});