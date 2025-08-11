// Batch Management
class BatchManager {
    constructor() {
        this.isInitialized = false;
        this.init();
    }

    init() {
        if (this.isInitialized) return;
        this.isInitialized = true;
        this.bindEvents();
        this.refresh();
    }

    bindEvents() {
        // Create Batch Form
        const createBatchForm = document.getElementById('createBatchForm');
        if (createBatchForm) {
            // Remove any existing event listeners
            createBatchForm.removeEventListener('submit', this.handleBatchSubmit);
            this.handleBatchSubmit = (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.createBatch();
                return false;
            };
            createBatchForm.addEventListener('submit', this.handleBatchSubmit);
        }

        // Create Course Form
        const createCourseForm = document.getElementById('createCourseForm');
        if (createCourseForm) {
            // Remove any existing event listeners
            createCourseForm.removeEventListener('submit', this.handleCourseSubmit);
            this.handleCourseSubmit = (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.createCourse();
                return false;
            };
            createCourseForm.addEventListener('submit', this.handleCourseSubmit);
        }

        // Create Month Form
        const createMonthForm = document.getElementById('createMonthForm');
        if (createMonthForm) {
            // Remove any existing event listeners
            createMonthForm.removeEventListener('submit', this.handleMonthSubmit);
            this.handleMonthSubmit = (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.createMonth();
                return false;
            };
            createMonthForm.addEventListener('submit', this.handleMonthSubmit);
        }
    }

    createBatch() {
        const batchName = Utils.sanitizeInput(document.getElementById('batchName').value);

        if (!batchName) {
            Utils.showToast('Please enter batch name', 'error');
            return;
        }

        // Check if batch already exists
        const existingBatch = window.storageManager.getBatches().find(b => 
            b.name.toLowerCase() === batchName.toLowerCase()
        );

        if (existingBatch) {
            Utils.showToast('Batch with this name already exists', 'error');
            return;
        }

        const batch = window.storageManager.addBatch({ name: batchName });
        Utils.showToast('Batch created successfully', 'success');
        
        document.getElementById('createBatchForm').reset();
        this.refresh();
    }

    createCourse() {
        const courseName = Utils.sanitizeInput(document.getElementById('courseName').value);
        const batchId = document.getElementById('courseBatch').value;

        if (!courseName || !batchId) {
            Utils.showToast('Please fill all fields', 'error');
            return;
        }

        // Check if course already exists in this batch
        const existingCourse = window.storageManager.getCourses().find(c => 
            c.name.toLowerCase() === courseName.toLowerCase() && c.batchId === batchId
        );

        if (existingCourse) {
            Utils.showToast('Course with this name already exists in the selected batch', 'error');
            return;
        }

        const course = window.storageManager.addCourse({ 
            name: courseName, 
            batchId 
        });
        
        Utils.showToast('Course created successfully', 'success');
        
        document.getElementById('createCourseForm').reset();
        this.refresh();
    }

    createMonth() {
        const monthName = Utils.sanitizeInput(document.getElementById('monthName').value);
        const monthNumber = parseInt(document.getElementById('monthNumber').value);
        const courseId = document.getElementById('monthCourse').value;
        const payment = parseFloat(document.getElementById('coursePayment').value);

        if (!monthName || !monthNumber || !courseId || !payment || payment <= 0) {
            Utils.showToast('Please fill all fields with valid values', 'error');
            return;
        }

        // Check if month already exists for this course
        const existingMonth = window.storageManager.getMonths().find(m => 
            (m.name.toLowerCase() === monthName.toLowerCase() || m.monthNumber === monthNumber) && m.courseId === courseId
        );

        if (existingMonth) {
            Utils.showToast('Month with this name or number already exists for the selected course', 'error');
            return;
        }

        const month = window.storageManager.addMonth({ 
            name: monthName, 
            monthNumber,
            courseId, 
            payment 
        });
        
        Utils.showToast('Month created successfully', 'success');
        
        document.getElementById('createMonthForm').reset();
        this.refresh();
    }

    refresh() {
        this.loadBatches();
        this.loadCourses();
        this.loadMonths();
        this.updateDropdowns();
    }

    loadBatches() {
        const batchList = document.getElementById('batchList');
        const batches = window.storageManager.getBatches();

        batchList.innerHTML = batches.map(batch => `
            <div class="entity-item">
                <div class="entity-info">
                    <div class="entity-name">${batch.name}</div>
                    <div class="entity-details">Created: ${Utils.formatDate(batch.createdAt)}</div>
                </div>
                <div class="entity-actions">
                    <button class="btn btn-small btn-outline" onclick="batchManager.editBatch('${batch.id}')">Edit</button>
                    <button class="btn btn-small btn-danger" onclick="batchManager.deleteBatch('${batch.id}')">Delete</button>
                </div>
            </div>
        `).join('');
    }

    loadCourses() {
        const courseList = document.getElementById('courseList');
        const courses = window.storageManager.getCourses();

        courseList.innerHTML = courses.map(course => {
            const batch = window.storageManager.getBatchById(course.batchId);
            return `
                <div class="entity-item">
                    <div class="entity-info">
                        <div class="entity-name">${course.name}</div>
                        <div class="entity-details">Batch: ${batch?.name || 'Unknown'} | Created: ${Utils.formatDate(course.createdAt)}</div>
                    </div>
                    <div class="entity-actions">
                        <button class="btn btn-small btn-outline" onclick="batchManager.editCourse('${course.id}')">Edit</button>
                        <button class="btn btn-small btn-danger" onclick="batchManager.deleteCourse('${course.id}')">Delete</button>
                    </div>
                </div>
            `;
        }).join('');
    }

    loadMonths() {
        const monthList = document.getElementById('monthList');
        const months = window.storageManager.getMonths();

        monthList.innerHTML = months.map(month => {
            const course = window.storageManager.getCourseById(month.courseId);
            const batch = course ? window.storageManager.getBatchById(course.batchId) : null;
            return `
                <div class="entity-item">
                    <div class="entity-info">
                        <div class="entity-name">${month.name}</div>
                        <div class="entity-details">
                            Course: ${course?.name || 'Unknown'} | 
                            Batch: ${batch?.name || 'Unknown'} | 
                            Month #: ${month.monthNumber || 'N/A'} |
                            Fee: ${Utils.formatCurrency(month.payment)}
                        </div>
                    </div>
                    <div class="entity-actions">
                        <button class="btn btn-small btn-outline" onclick="batchManager.editMonth('${month.id}')">Edit</button>
                        <button class="btn btn-small btn-danger" onclick="batchManager.deleteMonth('${month.id}')">Delete</button>
                    </div>
                </div>
            `;
        }).join('');
    }

    updateDropdowns() {
        // Update course batch dropdown
        const courseBatchSelect = document.getElementById('courseBatch');
        const batches = window.storageManager.getBatches();
        
        courseBatchSelect.innerHTML = '<option value="">Select Batch</option>' +
            batches.map(batch => `<option value="${batch.id}">${batch.name}</option>`).join('');

        // Update month course dropdown
        const monthCourseSelect = document.getElementById('monthCourse');
        const courses = window.storageManager.getCourses();
        
        monthCourseSelect.innerHTML = '<option value="">Select Course</option>' +
            courses.map(course => {
                const batch = window.storageManager.getBatchById(course.batchId);
                return `<option value="${course.id}">${course.name} (${batch?.name || 'Unknown Batch'})</option>`;
            }).join('');
    }

    editBatch(id) {
        const batch = window.storageManager.getBatchById(id);
        if (!batch) return;

        const editForm = `
            <form id="editBatchForm">
                <div class="form-group">
                    <label for="editBatchName">Batch Name</label>
                    <input type="text" id="editBatchName" value="${batch.name}" required>
                </div>
                <div class="form-group">
                    <button type="submit" class="btn btn-primary">Update Batch</button>
                    <button type="button" class="btn btn-outline" onclick="navigationManager.closeModal(document.getElementById('editModal'))">Cancel</button>
                </div>
            </form>
        `;

        window.navigationManager.showModal('editModal', 'Edit Batch', editForm);

        document.getElementById('editBatchForm').addEventListener('submit', (e) => {
            e.preventDefault();
            const newName = document.getElementById('editBatchName').value.trim();
            
            if (!newName) {
                Utils.showToast('Please enter batch name', 'error');
                return;
            }

            if (newName !== batch.name) {
                const sanitizedName = Utils.sanitizeInput(newName);
                
                // Check if new name already exists
                const existingBatch = window.storageManager.getBatches().find(b => 
                    b.name.toLowerCase() === sanitizedName.toLowerCase() && b.id !== id
                );

                if (existingBatch) {
                    Utils.showToast('Batch with this name already exists', 'error');
                    return;
                }

                window.storageManager.updateBatch(id, { name: sanitizedName });
                Utils.showToast('Batch updated successfully', 'success');
                window.navigationManager.closeModal(document.getElementById('editModal'));
                this.refresh();
            }
        });
    }

    editCourse(id) {
        const course = window.storageManager.getCourseById(id);
        if (!course) return;

        const editForm = `
            <form id="editCourseForm">
                <div class="form-group">
                    <label for="editCourseName">Course Name</label>
                    <input type="text" id="editCourseName" value="${course.name}" required>
                </div>
                <div class="form-group">
                    <button type="submit" class="btn btn-primary">Update Course</button>
                    <button type="button" class="btn btn-outline" onclick="navigationManager.closeModal(document.getElementById('editModal'))">Cancel</button>
                </div>
            </form>
        `;

        window.navigationManager.showModal('editModal', 'Edit Course', editForm);

        document.getElementById('editCourseForm').addEventListener('submit', (e) => {
            e.preventDefault();
            const newName = document.getElementById('editCourseName').value.trim();
            
            if (!newName) {
                Utils.showToast('Please enter course name', 'error');
                return;
            }

            if (newName !== course.name) {
                const sanitizedName = Utils.sanitizeInput(newName);
                
                // Check if new name already exists in the same batch
                const existingCourse = window.storageManager.getCourses().find(c => 
                    c.name.toLowerCase() === sanitizedName.toLowerCase() && 
                    c.batchId === course.batchId && 
                    c.id !== id
                );

                if (existingCourse) {
                    Utils.showToast('Course with this name already exists in this batch', 'error');
                    return;
                }

                window.storageManager.updateCourse(id, { name: sanitizedName });
                Utils.showToast('Course updated successfully', 'success');
                window.navigationManager.closeModal(document.getElementById('editModal'));
                this.refresh();
            }
        });
    }

    editMonth(id) {
        const month = window.storageManager.getMonthById(id);
        if (!month) return;

        const editForm = `
            <form id="editMonthForm">
                <div class="form-group">
                    <label for="editMonthName">Month Name</label>
                    <input type="text" id="editMonthName" value="${month.name}" required>
                </div>
                <div class="form-group">
                    <label for="editMonthPayment">Payment Amount (৳)</label>
                    <input type="number" id="editMonthPayment" value="${month.payment}" required min="0" step="0.01">
                </div>
                <div class="form-group">
                    <button type="submit" class="btn btn-primary">Update Month</button>
                    <button type="button" class="btn btn-outline" onclick="navigationManager.closeModal(document.getElementById('editModal'))">Cancel</button>
                </div>
            </form>
        `;

        window.navigationManager.showModal('editModal', 'Edit Month', editForm);

        document.getElementById('editMonthForm').addEventListener('submit', (e) => {
            e.preventDefault();
            const newName = document.getElementById('editMonthName').value.trim();
            const newPayment = parseFloat(document.getElementById('editMonthPayment').value);
            
            if (!newName || !newPayment || newPayment <= 0) {
                Utils.showToast('Please fill all fields with valid values', 'error');
                return;
            }

            const updates = {};
            
            if (newName !== month.name) {
                const sanitizedName = Utils.sanitizeInput(newName);
                
                // Check if new name already exists for the same course
                const existingMonth = window.storageManager.getMonths().find(m => 
                    m.name.toLowerCase() === sanitizedName.toLowerCase() && 
                    m.courseId === month.courseId && 
                    m.id !== id
                );

                if (existingMonth) {
                    Utils.showToast('Month with this name already exists for this course', 'error');
                    return;
                }
                
                updates.name = sanitizedName;
            }

            if (newPayment !== month.payment) {
                updates.payment = newPayment;
            }

            if (Object.keys(updates).length > 0) {
                window.storageManager.updateMonth(id, updates);
                Utils.showToast('Month updated successfully', 'success');
                window.navigationManager.closeModal(document.getElementById('editModal'));
                this.refresh();
            }
        });
    }

    deleteBatch(id) {
        Utils.confirm('Are you sure you want to delete this batch? This will also delete all related courses and months.', () => {
            const result = window.storageManager.deleteBatch(id);
            if (result.success) {
                Utils.showToast('Batch deleted successfully', 'success');
                this.refresh();
            } else {
                Utils.showToast(result.message, 'error');
            }
        });
    }

    deleteCourse(id) {
        Utils.confirm('Are you sure you want to delete this course? This will also delete all related months.', () => {
            const result = window.storageManager.deleteCourse(id);
            if (result.success) {
                Utils.showToast('Course deleted successfully', 'success');
                this.refresh();
            } else {
                Utils.showToast(result.message, 'error');
            }
        });
    }

    deleteMonth(id) {
        Utils.confirm('Are you sure you want to delete this month?', () => {
            const result = window.storageManager.deleteMonth(id);
            if (result.success) {
                Utils.showToast('Month deleted successfully', 'success');
                this.refresh();
            } else {
                Utils.showToast(result.message, 'error');
            }
        });
    }
}

// Global batch manager instance
window.batchManager = new BatchManager();
