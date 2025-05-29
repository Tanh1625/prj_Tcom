/**
 * Change Management System for Question Management
 * Adds the ability to stage changes before saving to database
 * Date: 2025-05-28
 */

// Global state for tracking changes
const changeManager = {
    addedQuestions: [],
    editedQuestions: {},
    deletedQuestions: [],
    uploadedPdfs: null,
    hasChanges: function() {
        return this.addedQuestions.length > 0 ||
            Object.keys(this.editedQuestions).length > 0 ||
            this.deletedQuestions.length > 0 ||
            this.uploadedPdfs !== null;
    },
    reset: function() {
        this.addedQuestions = [];
        this.editedQuestions = {};
        this.deletedQuestions = [];
        this.uploadedPdfs = null;
        updateChangeSummary();
    }
};

// Set up the change manager when the page loads
document.addEventListener('DOMContentLoaded', function() {
    // Create the save changes UI
    createSaveChangesUI();

    // Override existing handlers
    overrideExistingHandlers();

    // Call existing functions if needed
    if (typeof loadPdf === 'function') {
        loadPdf();
    }

    // Add PDF preview container
    createPdfPreviewContainer();
});

// Create PDF preview container
function createPdfPreviewContainer() {
    // Create a container for PDF preview that will appear when a file is selected
    const pdfUploadSection = document.querySelector('.col-md-6');
    if (pdfUploadSection) {
        const previewContainer = document.createElement('div');
        previewContainer.id = 'pdfPreviewContainer';
        previewContainer.className = 'mt-3';

        // Insert it before the pdfContainer
        const pdfContainer = document.getElementById('pdfContainer');
        pdfUploadSection.insertBefore(previewContainer, pdfContainer);
    }
}

// Create the UI for saving changes
function createSaveChangesUI() {
    // Create floating save changes panel
    const savePanel = document.createElement('div');
    savePanel.id = 'saveChangesPanel';
    savePanel.className = 'fixed bottom-0 left-0 right-0 bg-white shadow-lg border-t border-gray-300 p-4 hidden z-50';

    savePanel.innerHTML = `
        <div class="container mx-auto flex items-center justify-between">
            <div>
                <h3 class="font-bold text-lg">Thay đổi chưa được lưu</h3>
                <div id="changeSummary" class="text-sm text-gray-600 cursor-pointer"></div>
            </div>
            <div class="flex space-x-3">
                <button id="cancelChangesBtn" class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500">
                    Hủy thay đổi
                </button>
                <button id="saveAllChangesBtn" class="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
                    Lưu tất cả thay đổi
                </button>
            </div>
        </div>
    `;

    document.body.appendChild(savePanel);

    // Add event listeners for save/cancel buttons
    document.getElementById('saveAllChangesBtn').addEventListener('click', saveAllChanges);
    document.getElementById('cancelChangesBtn').addEventListener('click', cancelAllChanges);

    // Create details panel for changes
    const detailPanel = document.createElement('div');
    detailPanel.id = 'changeDetailsPanel';
    detailPanel.className = 'fixed bottom-20 left-4 right-4 bg-white shadow-lg border border-gray-300 rounded-lg p-4 hidden max-h-96 overflow-y-auto z-50';

    detailPanel.innerHTML = `
        <div class="flex justify-between items-center mb-4">
            <h3 class="font-bold text-lg">Chi tiết thay đổi</h3>
            <button id="closeDetailsBtn" class="text-gray-500 hover:text-gray-700">
                <i class="fas fa-times"></i>
            </button>
        </div>
        <div id="changeDetailContent"></div>
    `;

    document.body.appendChild(detailPanel);

    // Add event listener to close details panel
    document.getElementById('closeDetailsBtn').addEventListener('click', function() {
        document.getElementById('changeDetailsPanel').classList.add('hidden');
    });

    // Add click handler to summary to show details
    document.getElementById('changeSummary').addEventListener('click', function() {
        if (changeManager.hasChanges()) {
            showChangeDetails();
        }
    });
}

// Override existing event handlers to stage changes instead of saving immediately
function overrideExistingHandlers() {
    // Override delete form submission
    const deleteForm = document.getElementById("deleteUserForm");
    if (deleteForm) {
        // Store original event listeners
        const originalHandlers = deleteForm.onsubmit;

        // Remove existing listeners
        deleteForm.onsubmit = null;

        // Add new handler
        deleteForm.addEventListener("submit", function(event) {
            event.preventDefault();

            const quesId = document.getElementById("deleteUserId").value;

            // Show loading on button
            const deleteButton = document.getElementById("deleteUserButton");
            const copyDeleteButton = deleteButton.innerHTML;
            deleteButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang xử lý...';
            deleteButton.disabled = true;

            // Add to pending deletes instead of immediately deleting
            changeManager.deletedQuestions.push(quesId);

            // Hide the row from UI
            const deleteRow = document.querySelector(`tr[data-id="${quesId}"]`);
            if (deleteRow) {
                deleteRow.style.display = 'none';
            }

            // Close delete modal
            closeDeleteModal();

            // Update change summary
            updateChangeSummary();

            // Show notification
            showNotification('Đã thêm vào thay đổi', 'Câu hỏi sẽ bị xóa khi bạn lưu thay đổi', 'info');

            // Reset button
            deleteButton.innerHTML = copyDeleteButton;
            deleteButton.disabled = false;
        });
    }

    // Override add question form submission
    const addForm = document.getElementById('addQuestionForm');
    if (addForm) {
        // Store original handlers
        const originalHandlers = addForm.onsubmit;

        // Remove existing event listeners
        addForm.onsubmit = null;

        // Add new handler
        addForm.addEventListener('submit', function(event) {
            event.preventDefault();

            const answersList = document.getElementById('add-answers-list');
            const answers = answersList.querySelectorAll('div.flex.items-start');

            if (answers.length <= 1) {
                alert('Vui lòng thêm ít nhất hai đáp án cho câu hỏi.');
                return false;
            }

            // Ensure at least one answer is marked as correct
            const correctAnswer = answersList.querySelector('input[name="newCorrectAnswerIndex"]:checked');
            if (!correctAnswer) {
                alert('Vui lòng chọn một đáp án đúng.');
                return false;
            }

            // Get form data
            const questionContent = document.getElementById('quesContent').value;
            const questionType = document.getElementById('quesType').value;

            // Show loading indicator
            const submitButton = this.querySelector('button[type="submit"]');
            const originalButtonText = submitButton.innerHTML;
            submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang xử lý...';
            submitButton.disabled = true;

            // Create new question object
            const newQuestion = {
                questionContent: questionContent,
                questionType: questionType,
                correctAnswerIndex: correctAnswer.value,
                answers: []
            };

            // Add answers
            answers.forEach((element, index) => {
                const content = element.querySelector('input[type="text"]').value;
                newQuestion.answers.push({
                    content: content,
                    isCorrect: index.toString() === correctAnswer.value
                });
            });

            // Add to the change manager
            changeManager.addedQuestions.push(newQuestion);

            // Update UI with temporary row
            addTemporaryQuestionRow(newQuestion);

            // Close the modal and reset form
            closeEditModal();

            // Reset form
            event.target.reset();
            answersList.innerHTML = '';
            addNewAnswerInput(answersList, '', false, 0);
            updateAddAnswerCounter(1);

            // Update change summary
            updateChangeSummary();

            // Show notification
            showNotification('Đã thêm vào thay đổi', 'Câu hỏi mới sẽ được thêm khi bạn lưu thay đổi', 'info');

            // Restore button state
            submitButton.innerHTML = originalButtonText;
            submitButton.disabled = false;
        });
    }

    // Override edit question form submission
    const editForm = document.getElementById('editQuestionForm');
    if (editForm) {
        // Store original handlers
        const originalHandlers = editForm.onsubmit;

        // Remove existing handlers
        editForm.onsubmit = null;

        // Add new handler
        editForm.addEventListener('submit', function(event) {
            event.preventDefault();

            const answersList = document.getElementById('answers-list');

            // Ensure at least one answer is marked as correct
            const correctAnswer = answersList.querySelector('input[name="correctAnswerIndex"]:checked');
            if (!correctAnswer) {
                alert('Vui lòng chọn một đáp án đúng.');
                return false;
            }

            // Get form data
            const questionId = document.getElementById('edit-question-id').value;
            const questionContent = document.getElementById('edit-question-content').value;

            // Show loading indicator
            const submitButton = this.querySelector('button[type="submit"]');
            const originalButtonText = submitButton.innerHTML;
            submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang xử lý...';
            submitButton.disabled = true;

            // Create edited question object
            const editedQuestion = {
                questionId: questionId,
                questionContent: questionContent,
                correctAnswerIndex: correctAnswer.value,
                answers: []
            };

            // Add answer data
            const answerElements = answersList.querySelectorAll('div.flex.items-start');
            answerElements.forEach((element, index) => {
                const answerId = element.querySelector('input[name^="answers"][name$="answerId"]').value;
                const content = element.querySelector('input[name^="answers"][name$="answerContent"]').value;

                editedQuestion.answers.push({
                    answerId: answerId,
                    content: content,
                    isCorrect: index.toString() === correctAnswer.value
                });
            });

            // Add to change manager
            changeManager.editedQuestions[questionId] = editedQuestion;

            // Update UI to show pending edit
            updateRowAsPendingEdit(questionId, questionContent);

            // Close the modal
            closeEditQuestionModal();

            // Update change summary
            updateChangeSummary();

            // Show notification
            showNotification('Đã thêm vào thay đổi', 'Chỉnh sửa sẽ được áp dụng khi bạn lưu thay đổi', 'info');

            // Restore button state
            submitButton.innerHTML = originalButtonText;
            submitButton.disabled = false;
        });
    }

    // Override PDF upload function (handle the existing "Lưu chỉnh sửa" button)
    const pdfUploadButton = document.querySelector('button.btn.btn-primary');
    if (pdfUploadButton && pdfUploadButton.getAttribute('onclick') === 'uploadPdf()') {
        // Remove existing onclick handler
        pdfUploadButton.removeAttribute('onclick');

        // Add new click handler
        pdfUploadButton.addEventListener('click', function() {
            const fileInput = document.getElementById('pdfFile');
            const file = fileInput.files[0];
            if (!file) {
                alert('Vui lòng chọn một tệp PDF để tải lên.');
                return;
            }

            if (file.type !== 'application/pdf') {
                alert('Vui lòng chọn tệp PDF hợp lệ.');
                return;
            }

            if (file.size > 10 * 1024 * 1024) { // 10MB limit
                alert('Tệp PDF quá lớn. Vui lòng chọn tệp nhỏ hơn 10MB.');
                return;
            }

            // Store the file in the change manager
            changeManager.uploadedPdfs = file;

            // Preview the file
            const pdfPreviewContainer = document.getElementById('pdfPreviewContainer');
            if (pdfPreviewContainer) {
                const blobUrl = URL.createObjectURL(file);

                pdfPreviewContainer.innerHTML = `
                    <div class="alert alert-info">
                        <div class="d-flex justify-content-between align-items-center mb-2">
                            <div>
                                <i class="fas fa-file-pdf text-danger me-2"></i>
                                <span class="fw-medium">${file.name}</span>
                                <span class="text-muted small ms-2">(${(file.size / 1024).toFixed(2)} KB)</span>
                            </div>
                            <button type="button" onclick="cancelPdfUpload()" class="btn-close"></button>
                        </div>
                        <div class="small text-muted fst-italic mb-2">* PDF sẽ được tải lên sau khi bạn nhấn "Lưu tất cả thay đổi"</div>
                        <a href="${blobUrl}" target="_blank" class="text-primary small">
                            <i class="fas fa-external-link-alt me-1"></i> Mở tệp PDF trong tab mới
                        </a>
                    </div>
                `;
            }

            // Update change summary
            updateChangeSummary();

            // Show notification
            showNotification('Đã thêm vào thay đổi', 'PDF sẽ được tải lên khi bạn lưu thay đổi', 'info');
        });
    }

    // Add file input change handler to show file info
    const fileInput = document.getElementById('pdfFile');
    if (fileInput) {
        fileInput.addEventListener('change', function() {
            const file = this.files[0];
            if (file) {
                const pdfPreviewContainer = document.getElementById('pdfPreviewContainer');
                if (pdfPreviewContainer) {
                    const blobUrl = URL.createObjectURL(file);

                    pdfPreviewContainer.innerHTML = `
                        <div class="alert alert-info">
                            <div class="d-flex justify-content-between align-items-center">
                                <div>
                                    <i class="fas fa-file-pdf text-danger me-2"></i>
                                    <span class="fw-medium">${file.name}</span>
                                    <span class="text-muted small ms-2">(${(file.size / 1024).toFixed(2)} KB)</span>
                                </div>
                                <button type="button" onclick="this.parentElement.parentElement.remove(); document.getElementById('pdfFile').value = '';" class="btn-close"></button>
                            </div>
                            <div class="small text-muted mt-2">Nhấn "Lưu chỉnh sửa" để thêm file vào danh sách thay đổi.</div>
                        </div>
                    `;
                }
            }
        });
    }

    // Add cancelPdfUpload function
    window.cancelPdfUpload = function() {
        changeManager.uploadedPdfs = null;

        const fileInput = document.getElementById('pdfFile');
        const pdfPreviewContainer = document.getElementById('pdfPreviewContainer');

        if (fileInput) fileInput.value = '';
        if (pdfPreviewContainer) pdfPreviewContainer.innerHTML = '';

        updateChangeSummary();
    };
}

// Update the change summary display
function updateChangeSummary() {
    const panel = document.getElementById('saveChangesPanel');
    const summary = document.getElementById('changeSummary');

    if (!panel || !summary) return;

    if (changeManager.hasChanges()) {
        // Build summary text
        let summaryText = [];

        if (changeManager.addedQuestions.length > 0) {
            summaryText.push(`Thêm ${changeManager.addedQuestions.length} câu hỏi mới`);
        }

        if (Object.keys(changeManager.editedQuestions).length > 0) {
            summaryText.push(`Chỉnh sửa ${Object.keys(changeManager.editedQuestions).length} câu hỏi`);
        }

        if (changeManager.deletedQuestions.length > 0) {
            summaryText.push(`Xóa ${changeManager.deletedQuestions.length} câu hỏi`);
        }

        if (changeManager.uploadedPdfs !== null) {
            summaryText.push(`Tải lên 1 tệp PDF`);
        }

        summary.innerHTML = `<span class="hover:text-blue-600">${summaryText.join(', ')} - <u>Xem chi tiết</u></span>`;
        panel.classList.remove('hidden');
    } else {
        summary.textContent = 'Không có thay đổi';
        panel.classList.add('hidden');
    }
}

// Show detailed view of all pending changes
function showChangeDetails() {
    const detailPanel = document.getElementById('changeDetailsPanel');
    const detailContent = document.getElementById('changeDetailContent');

    if (!detailPanel || !detailContent) return;

    detailContent.innerHTML = '';

    // Add questions section
    if (changeManager.addedQuestions.length > 0) {
        const addedSection = document.createElement('div');
        addedSection.className = 'mb-4';
        addedSection.innerHTML = `
            <h4 class="font-medium text-green-700 mb-2">Câu hỏi thêm mới (${changeManager.addedQuestions.length})</h4>
            <ul class="list-disc pl-5 space-y-1">
                ${changeManager.addedQuestions.map(q =>
            `<li class="text-sm">${q.questionContent} <span class="text-xs text-gray-500">(${q.answers.length} đáp án)</span></li>`
        ).join('')}
            </ul>
        `;
        detailContent.appendChild(addedSection);
    }

    // Edited questions section
    if (Object.keys(changeManager.editedQuestions).length > 0) {
        const editedSection = document.createElement('div');
        editedSection.className = 'mb-4';
        editedSection.innerHTML = `
            <h4 class="font-medium text-blue-700 mb-2">Câu hỏi đã chỉnh sửa (${Object.keys(changeManager.editedQuestions).length})</h4>
            <ul class="list-disc pl-5 space-y-1">
                ${Object.values(changeManager.editedQuestions).map(q =>
            `<li class="text-sm">${q.questionContent} <span class="text-xs text-gray-500">(ID: ${q.questionId})</span></li>`
        ).join('')}
            </ul>
        `;
        detailContent.appendChild(editedSection);
    }

    // Deleted questions section
    if (changeManager.deletedQuestions.length > 0) {
        const deletedSection = document.createElement('div');
        deletedSection.className = 'mb-4';
        deletedSection.innerHTML = `
            <h4 class="font-medium text-red-700 mb-2">Câu hỏi sẽ bị xóa (${changeManager.deletedQuestions.length})</h4>
            <ul class="list-disc pl-5 space-y-1">
                ${changeManager.deletedQuestions.map(id => {
            const row = document.querySelector(`tr[data-id="${id}"]`);
            let content = 'Câu hỏi không xác định';
            if (row) {
                const contentCell = row.querySelector('td:nth-child(2)');
                if (contentCell) content = contentCell.textContent;
            }
            return `<li class="text-sm">${content} <span class="text-xs text-gray-500">(ID: ${id})</span></li>`;
        }).join('')}
            </ul>
        `;
        detailContent.appendChild(deletedSection);
    }

    // PDF upload section
    if (changeManager.uploadedPdfs !== null) {
        const pdfSection = document.createElement('div');
        pdfSection.className = 'mb-4';
        pdfSection.innerHTML = `
            <h4 class="font-medium text-purple-700 mb-2">Tệp PDF sẽ được tải lên</h4>
            <div class="text-sm">
                <i class="fas fa-file-pdf text-red-600 mr-1"></i>
                ${changeManager.uploadedPdfs.name}
                <span class="text-gray-500 text-xs">(${(changeManager.uploadedPdfs.size / 1024).toFixed(2)} KB)</span>
            </div>
        `;
        detailContent.appendChild(pdfSection);
    }

    detailPanel.classList.remove('hidden');
}

// Function to add temporary question row to the table
function addTemporaryQuestionRow(question) {
    const tbody = document.querySelector('tbody');
    if (!tbody) return;

    const newRowNumber = tbody.querySelectorAll('tr').length + 1;

    const newRow = document.createElement('tr');
    newRow.className = 'hover:bg-gray-50 bg-gray-100'; // Gray background to indicate pending
    newRow.setAttribute('data-new', 'true'); // Mark as a new row

    newRow.innerHTML = `
        <td class="border border-gray-300 py-3 px-4">${newRowNumber}</td>
        <td class="border border-gray-300 py-3 px-4">${question.questionContent}</td>
        <td class="border border-gray-300 py-3 px-4 space-x-2">
            <span class="text-orange-500 text-xs italic">
                <i class="fas fa-clock mr-1"></i> Chờ lưu
            </span>
        </td>
    `;

    tbody.appendChild(newRow);

    // Ẩn thông báo "không có câu hỏi nào" nếu có
    const noQuestionsMsg = document.querySelector('h2[style*="color: red; text-align: center;"]');
    if (noQuestionsMsg) {
        noQuestionsMsg.style.display = 'none';
    }
}

// Function to update row to show pending edit
function updateRowAsPendingEdit(questionId, newContent) {
    const questionRows = document.querySelectorAll('tbody tr');
    for (const row of questionRows) {
        if (row.getAttribute('data-id') === questionId) {
            // Update the question content in the table with indicator
            const contentCell = row.querySelector('td:nth-child(2)');
            if (contentCell) {
                const existingPendingIndicator = contentCell.querySelector('span.text-orange-500');
                if (existingPendingIndicator) {
                    existingPendingIndicator.remove();
                }

                contentCell.innerHTML = `${newContent} <span class="text-orange-500 text-xs italic ml-2"><i class="fas fa-clock"></i> Đã chỉnh sửa</span>`;
            }
            break;
        }
    }
}

// Save all pending changes to server
function saveAllChanges() {
    // Show loading state
    const saveButton = document.getElementById('saveAllChangesBtn');
    if (!saveButton) return;

    const originalButtonText = saveButton.innerHTML;
    saveButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang lưu...';
    saveButton.disabled = true;

    // Create promises for all operations
    const allPromises = [];

    // Add operations
    changeManager.addedQuestions.forEach(question => {
        allPromises.push(addQuestionToServer(question));
    });

    // Edit operations
    Object.values(changeManager.editedQuestions).forEach(question => {
        allPromises.push(updateQuestionOnServer(question));
    });

    // Delete operations
    changeManager.deletedQuestions.forEach(questionId => {
        allPromises.push(deleteQuestionFromServer(questionId));
    });

    // PDF upload if any
    if (changeManager.uploadedPdfs) {
        allPromises.push(uploadPdfToServer(changeManager.uploadedPdfs));
    }

    // Execute all promises
    Promise.all(allPromises)
        .then(() => {
            // All operations succeeded
            showNotification('Thành công', 'Tất cả thay đổi đã được lưu', 'success');

            // Apply UI changes permanently
            applyUiChanges();

            // Reset change manager
            changeManager.reset();

            // Hide panel
            document.getElementById('saveChangesPanel').classList.add('hidden');
            document.getElementById('changeDetailsPanel').classList.add('hidden');

            // Reload PDF display if needed
            if (typeof loadPdf === 'function' && changeManager.uploadedPdfs) {
                loadPdf();
            }
        })
        .catch(error => {
            console.error('Error saving changes:', error);
            showNotification('Lỗi', 'Có lỗi xảy ra khi lưu thay đổi. Vui lòng thử lại.', 'error');
        })
        .finally(() => {
            // Restore button state
            saveButton.innerHTML = originalButtonText;
            saveButton.disabled = false;
        });
}

// Cancel all pending changes
function cancelAllChanges() {
    if (confirm('Bạn có chắc muốn hủy tất cả thay đổi chưa lưu không?')) {
        // Revert UI to match server state
        revertUIChanges();

        // Reset change manager
        changeManager.reset();

        // Hide panels
        document.getElementById('saveChangesPanel').classList.add('hidden');
        document.getElementById('changeDetailsPanel').classList.add('hidden');

        showNotification('Thông báo', 'Đã hủy tất cả thay đổi', 'info');
    }
}

// Apply all UI changes permanently after successful save
function applyUiChanges() {
    // Update added questions (now have IDs from server)
    const pendingRows = document.querySelectorAll('tr[data-new="true"]');
    pendingRows.forEach(row => {
        row.removeAttribute('data-new');
        row.classList.remove('bg-gray-100');

        // We'd normally update with actual data, but will need page reload for full update
        row.querySelector('td:last-child').innerHTML = '<span class="text-green-500">Đã lưu - Làm mới để xem đầy đủ</span>';
    });

    // Update edited questions (remove pending indicators)
    Object.keys(changeManager.editedQuestions).forEach(id => {
        const row = document.querySelector(`tr[data-id="${id}"]`);
        if (row) {
            const contentCell = row.querySelector('td:nth-child(2)');
            if (contentCell) {
                const pendingIndicator = contentCell.querySelector('span.text-orange-500');
                if (pendingIndicator) {
                    pendingIndicator.remove();
                }

                // Show save indicator
                contentCell.innerHTML += ' <span class="text-green-500 text-xs italic ml-2">(Đã lưu)</span>';

                // The indicator will disappear on page reload
                setTimeout(() => {
                    const savedIndicator = contentCell.querySelector('span.text-green-500');
                    if (savedIndicator) {
                        savedIndicator.style.opacity = '0';
                        savedIndicator.style.transition = 'opacity 1s';
                    }
                }, 3000);
            }
        }
    });

    // Finalize deleted questions (already hidden)
    changeManager.deletedQuestions.forEach(id => {
        const row = document.querySelector(`tr[data-id="${id}"]`);
        if (row) {
            row.remove(); // Remove completely now that delete is confirmed
        }
    });

    // Clear any PDF preview
    if (changeManager.uploadedPdfs) {
        const previewContainer = document.getElementById('pdfPreviewContainer');
        if (previewContainer) previewContainer.innerHTML = '';

        const fileInput = document.getElementById('pdfFile');
        if (fileInput) fileInput.value = '';
    }

    // Re-number table rows
    const tableRows = document.querySelectorAll('tbody tr:not([style*="display: none"])');
    tableRows.forEach((row, index) => {
        const numberCell = row.querySelector('td:first-child');
        if (numberCell) {
            numberCell.textContent = index + 1;
        }
    });
}

// Revert UI changes to match server state
function revertUIChanges() {
    // Revert added questions (remove from UI)
    const newRows = document.querySelectorAll('tbody tr[data-new="true"]');
    newRows.forEach(row => row.remove());

    // Revert edited questions (restore original content)
    Object.entries(changeManager.editedQuestions).forEach(([id, _]) => {
        const row = document.querySelector(`tr[data-id="${id}"]`);
        if (row) {
            // Find edit button to get original content
            const editBtn = row.querySelector('.edit-btn');
            if (editBtn) {
                const originalContent = editBtn.dataset.content;
                const contentCell = row.querySelector('td:nth-child(2)');
                if (contentCell) {
                    contentCell.textContent = originalContent;
                }
            }
        }
    });

    // Revert deleted questions (restore to UI)
    changeManager.deletedQuestions.forEach(id => {
        const row = document.querySelector(`tr[data-id="${id}"]`);
        if (row) {
            row.style.display = ''; // Restore row
        }
    });

    // Clear any PDF preview
    if (changeManager.uploadedPdfs) {
        const previewContainer = document.getElementById('pdfPreviewContainer');
        if (previewContainer) previewContainer.innerHTML = '';

        const fileInput = document.getElementById('pdfFile');
        if (fileInput) fileInput.value = '';
    }
}

// Server communication functions
function addQuestionToServer(question) {
    const formData = new FormData();
    formData.append('quesContent', question.questionContent);
    formData.append('quesType', question.questionType);
    formData.append('newCorrectAnswerIndex', question.correctAnswerIndex);

    // Add answer data
    question.answers.forEach((answer, index) => {
        formData.append(`newAnswers[${index}].answerContent`, answer.content);
    });

    return fetch('/admin/addQues', {
        method: 'POST',
        body: formData
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Server returned status: ' + response.status);
            }
            return response.json();
        });
}

function updateQuestionOnServer(question) {
    const formData = new FormData();
    formData.append('questionId', question.questionId);
    formData.append('questionContent', question.questionContent);
    formData.append('correctAnswerIndex', question.correctAnswerIndex);

    // Add answer data
    question.answers.forEach((answer, index) => {
        formData.append(`answers[${index}].answerId`, answer.answerId);
        formData.append(`answers[${index}].answerContent`, answer.content);
    });

    return fetch('/admin/updateQues', {
        method: 'POST',
        body: formData
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Server returned status: ' + response.status);
            }
            return response.json();
        });
}

function deleteQuestionFromServer(questionId) {
    return fetch(`/admin/deleteQues?quesId=${questionId}`, {
        method: 'POST'
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Có vấn đề khi xóa câu hỏi: ' + response.statusText);
            }
            return response;
        });
}

function uploadPdfToServer(file) {
    const url = window.location.pathname.split('/');
    const id = url[url.length - 1]; // Lấy phần cuối của URL để xác định ID

    const formData = new FormData();
    formData.append('file', file);
    formData.append('examId', id);

    return fetch(`/admin/pdf/upload`, {
        method: 'POST',
        body: formData
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Có vấn đề khi tải lên tệp PDF: ' + response.statusText);
            }
            return response.json();
        });
}