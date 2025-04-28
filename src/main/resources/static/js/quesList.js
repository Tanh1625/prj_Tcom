// Gửi form xóa
document.getElementById("deleteUserForm").addEventListener("submit", function (event) {
    event.preventDefault(); // Prevent the default form submission

    const quesId = document.getElementById("deleteUserId").value;

    //đổi button thành loading
    const deleteButton = document.getElementById("deleteUserButton");
    const copyDeleleButton = deleteButton.innerHTML;
    deleteButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang xóa...';
    deleteButton.disabled = true;


    fetch(`/admin/deleteQues?quesId=${quesId}`, {
        method: 'POST',
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Có vấn đề khi xóa câu hỏi!' + response.statusText);
            }
        })
        .then(data => {
            closeDeleteModal();


            // xóa dòng khỏi bảng để ko phải ấn reload (thực tế database
            // đã xóa r nhưng trang ch reload lên không thay đổi)
            const deleteRow = document.querySelector(`tr[data-id="${quesId}"]`);
            if(deleteRow){
                console.log(deleteRow);
                deleteRow.remove();
            }
            console.log('Câu hỏi đã được xóa thành công!');

        })
        .catch(error => {
            console.error('Có lỗi xảy ra:', error);
        })
        .finally(() => {
            // Reset button to original state
            deleteButton.innerHTML = copyDeleleButton;
            deleteButton.disabled = false;
        });
});


// Maximum number of answers allowed
const MAX_ANSWERS = 4;

// Delete User button event listeners
const deleteButtons = document.querySelectorAll('.delete-btn');
deleteButtons.forEach(button => {
    button.addEventListener('click', function (event) {
        event.preventDefault();

        // Get user data from data attributes
        const quesData = this.dataset;

        // Populate the delete confirmation modal
        document.getElementById('deleteUserId').value = quesData.id;

        // Show the delete modal
        document.getElementById('deleteUserModal').classList.remove('hidden');
    });
});

// Function to close delete modal
function closeDeleteModal() {
    document.getElementById('deleteUserModal').classList.add('hidden');
}

// add ques button event listeners
const editButtons = document.querySelectorAll('.add-btn');
editButtons.forEach(button => {
    button.addEventListener('click', function (event) {
        event.preventDefault();

        // Initialize the add question form
        const addAnswersList = document.getElementById('add-answers-list');
        addAnswersList.innerHTML = '';

        // Add initial answer field
        addNewAnswerInput(addAnswersList, '', false, 0);
        updateAddAnswerCounter(1);

        // Show the modal
        document.getElementById('addModel').classList.remove('hidden');
    });
});

// Function to close edit modal
function closeEditModal() {
    document.getElementById('addModel').classList.add('hidden');
}

// View Details button event listeners
const viewDetailsButtons = document.querySelectorAll('.view-details-btn');
viewDetailsButtons.forEach(button => {
    button.addEventListener('click', function (event) {
        event.preventDefault();

        // Get question data from data attributes
        const questionId = this.dataset.id;
        const questionContent = this.dataset.content;

        // Populate the question details modal
        document.getElementById('question-id').textContent = questionId;
        document.getElementById('question-content').textContent = questionContent;

        // Show the details modal
        document.getElementById('questionDetailsModal').classList.remove('hidden');

        // Fetch additional details using AJAX
        fetchQuestionDetails(questionId);
    });
});

// Function to close details modal
function closeDetailsModal() {
    document.getElementById('questionDetailsModal').classList.add('hidden');
}

// Edit Question button event listeners
const questionEditButtons = document.querySelectorAll('.edit-btn');
questionEditButtons.forEach(button => {
    button.addEventListener('click', function (event) {
        event.preventDefault();

        // Lấy dữ liệu câu hỏi từ data attributes
        const questionId = this.dataset.id;
        const questionContent = this.dataset.content;

        // Điền thông tin cơ bản vào modal
        document.getElementById('edit-question-id').value = questionId;
        document.getElementById('edit-question-content').value = questionContent;

        // Làm trống container đáp án trước khi thêm mới
        document.getElementById('answers-list').innerHTML = '';

        // Hiển thị modal
        document.getElementById('editQuestionModal').classList.remove('hidden');

        // Lấy đáp án từ API
        fetchAnswersForEdit(questionId);
    });
});

// Function to close edit question modal
function closeEditQuestionModal() {
    document.getElementById('editQuestionModal').classList.add('hidden');
}

// Function to update the answer counter for Add modal
function updateAddAnswerCounter(count) {
    const counterElement = document.getElementById('add-answers-count');
    counterElement.textContent = `${count}/${MAX_ANSWERS}`;

    const addNewAnswerBtn = document.getElementById('add-new-answer-btn');
    const limitMessage = document.getElementById('add-answer-limit-message');

    if (count >= MAX_ANSWERS) {
        addNewAnswerBtn.disabled = true;
        addNewAnswerBtn.classList.add('opacity-50', 'cursor-not-allowed');
        limitMessage.classList.remove('hidden');
    } else {
        addNewAnswerBtn.disabled = false;
        addNewAnswerBtn.classList.remove('opacity-50', 'cursor-not-allowed');
        limitMessage.classList.add('hidden');
    }
}

// Function to fetch answers for editing
function fetchAnswersForEdit(questionId) {
    const answersList = document.getElementById('answers-list');
    answersList.innerHTML = '<div class="text-center py-2"><i class="fas fa-spinner fa-spin text-blue-600"></i> Đang tải đáp án...</div>';

    fetch(`/api/questions/${questionId}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Không thể tải dữ liệu từ server');
            }
            return response.json();
        })
        .then(answers => {
            answersList.innerHTML = ''; // Xóa loading

            if (!answers || answers.length === 0) {
                answersList.innerHTML = '<p class="text-gray-500">Không có đáp án cho câu hỏi này.</p>';
                return;
            }

            // Thêm các đáp án hiện có vào form để chỉnh sửa
            answers.forEach((answer, index) => {
                addEditOnlyAnswerInput(answersList, answer.answerContent, answer.correct, index, answer.answerId);
            });
        })
        .catch(error => {
            console.error('Error fetching answers for edit:', error);
            answersList.innerHTML = '<p class="text-red-500">Không thể tải đáp án. Vui lòng thử lại sau.</p>';
        });
}

// Function to add editable answer inputs to the edit form
function addEditOnlyAnswerInput(container, content = '', isCorrect = false, index, answerId) {
    const answerDiv = document.createElement('div');
    answerDiv.className = 'flex items-start space-x-2';

    // Unique ID for each answer
    const uniqueId = Date.now() + '-' + index;

    // Hidden input for answer ID - luôn yêu cầu có answerId khi chỉnh sửa
    const hiddenInput = `<input type="hidden" name="answers[${index}].answerId" value="${answerId}">`;

    answerDiv.innerHTML = `
                ${hiddenInput}
                <div class="flex-grow">
                    <input
                        type="text"
                        name="answers[${index}].answerContent"
                        value="${content}"
                        class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                        placeholder="Nhập nội dung đáp án"
                        required
                    >
                </div>
                <div class="flex items-center space-x-2 pt-2">
                    <input
                        type="radio"
                        name="correctAnswerIndex"
                        id="correct-${uniqueId}"
                        value="${index}"
                        ${isCorrect ? 'checked' : ''}
                        class="h-4 w-4 text-blue-600 focus:ring-blue-500 cursor-pointer"
                    >
                    <label for="correct-${uniqueId}" class="text-xs text-gray-700 cursor-pointer">Đáp án đúng</label>
                </div>
            `;

    container.appendChild(answerDiv);
}

// Function to add answer input fields to the add form
function addNewAnswerInput(container, content = '', isCorrect = false, index) {
    const answerDiv = document.createElement('div');
    answerDiv.className = 'flex items-start space-x-2';

    // Unique ID for each answer
    const uniqueId = 'new-' + Date.now() + '-' + index;

    answerDiv.innerHTML = `
                <div class="flex-grow">
                    <input
                        type="text"
                        name="newAnswers[${index}].answerContent"
                        value="${content}"
                        class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                        placeholder="Nhập nội dung đáp án"
                        required
                    >
                </div>
                <div class="flex items-center space-x-2 pt-2">
                    <input
                        type="radio"
                        name="newCorrectAnswerIndex"
                        id="correct-${uniqueId}"
                        value="${index}"
                        ${isCorrect ? 'checked' : ''}
                        class="h-4 w-4 text-blue-600 focus:ring-blue-500 cursor-pointer"
                    >
                    <label for="correct-${uniqueId}" class="text-xs text-gray-700 cursor-pointer">Đáp án đúng</label>
                    <button
                        type="button"
                        class="text-red-500 hover:text-red-700 focus:outline-none delete-new-answer-btn"
                        aria-label="Xóa đáp án"
                    >
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </div>
            `;

    container.appendChild(answerDiv);

    // Add event listener to delete button
    const deleteBtn = answerDiv.querySelector('.delete-new-answer-btn');
    deleteBtn.addEventListener('click', function () {
        answerDiv.remove();
        // Renumber the answers
        renumberNewAnswers();
        // Update counter
        const currentCount = container.querySelectorAll('div.flex.items-start').length;
        updateAddAnswerCounter(currentCount);
    });
}

// Function to renumber answers after deletion in add form
function renumberNewAnswers() {
    const answersList = document.getElementById('add-answers-list');
    const answers = answersList.querySelectorAll('div.flex.items-start');

    answers.forEach((answer, index) => {
        // Update the name attributes to have sequential indices
        const textInput = answer.querySelector('input[type="text"]');
        textInput.name = `newAnswers[${index}].answerContent`;

        const radioInput = answer.querySelector('input[type="radio"]');
        radioInput.value = index;
    });
}

// Add Answer button event listener for add form
document.getElementById('add-new-answer-btn').addEventListener('click', function () {
    const answersList = document.getElementById('add-answers-list');
    const currentCount = answersList.querySelectorAll('div.flex.items-start').length;

    // Check if we've reached the maximum allowed answers
    if (currentCount < MAX_ANSWERS) {
        addNewAnswerInput(answersList, '', false, currentCount);
        updateAddAnswerCounter(currentCount + 1);
    }
});

// Function to fetch question details using AJAX
function fetchQuestionDetails(questionId) {
    const additionalDetails = document.getElementById('additional-details');
    additionalDetails.innerHTML = '<div class="text-center py-4"><i class="fas fa-spinner fa-spin text-blue-600"></i> Đang tải...</div>';

    // API trả về danh sách Answer[]
    fetch(`/api/questions/${questionId}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Không thể tải dữ liệu từ server');
            }
            return response.json();
        })
        .then(answers => {
            additionalDetails.innerHTML = ''; // Clear loading

            if (!answers || answers.length === 0) {
                additionalDetails.innerHTML = '<p class="text-gray-500">Không có đáp án cho câu hỏi này.</p>';
                return;
            }

            const answersContainer = document.createElement('div');
            answersContainer.className = 'mb-4';

            const answersTitle = document.createElement('h3');
            answersTitle.className = 'text-sm font-medium text-gray-700 mb-2';
            answersTitle.textContent = 'Các đáp án:';
            answersContainer.appendChild(answersTitle);

            const answersList = document.createElement('ul');
            answersList.className = 'list-disc pl-5 space-y-1';

            answers.forEach(answer => {
                const answerItem = document.createElement('li');
                answerItem.className = 'text-sm text-gray-600';
                answerItem.innerHTML = `${answer.answerContent} ${answer.correct ? '<span class="text-green-600 font-medium">(Đáp án đúng)</span>' : ''}`;
                answersList.appendChild(answerItem);
            });

            answersContainer.appendChild(answersList);
            additionalDetails.appendChild(answersContainer);
        })
        .catch(error => {
            console.error('Error fetching question details:', error);
            additionalDetails.innerHTML = '<p class="text-red-500">Không thể tải thông tin chi tiết. Vui lòng thử lại sau.</p>';
        });
}


// Submit form edit question
document.getElementById('editQuestionForm').addEventListener('submit', function (event) {
    event.preventDefault(); // Prevent default form submission

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

    // tạo một formdata để gửi sang controller
    const formData = new FormData();
    formData.append('questionId', questionId);
    formData.append('questionContent', questionContent);
    formData.append('correctAnswerIndex', correctAnswer.value);

    // Add answer data
    const answerElements = answersList.querySelectorAll('div.flex.items-start');
    answerElements.forEach((element, index) => {
        const answerId = element.querySelector('input[name^="answers"][name$="answerId"]').value;
        const content = element.querySelector('input[name^="answers"][name$="answerContent"]').value;

        formData.append(`answers[${index}].answerId`, answerId);
        formData.append(`answers[${index}].answerContent`, content);
    });

    // Show loading indicator
    const submitButton = this.querySelector('button[type="submit"]');
    const originalButtonText = submitButton.innerHTML;
    submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang xử lý...';
    submitButton.disabled = true;

    // Submit using fetch
    fetch('/admin/updateQues', {
        method: 'POST',
        body: formData
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Server returned status: ' + response.status);
            }
            return response;
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Server returned status: ' + response.status);
            }
            return response.json(); // Parse JSON response
        })
        .then(data => {
            if (data.success) {
                // Handle success
                closeEditQuestionModal();

                // Update the UI to reflect the changes without page reload
                const questionRows = document.querySelectorAll('tbody tr');
                for (const row of questionRows) {
                    const actionCell = row.querySelector('td:last-child');
                    if (actionCell) {
                        const editBtn = actionCell.querySelector('.edit-btn');
                        if (editBtn && editBtn.dataset.id === questionId) {
                            // Update the question content in the table
                            const contentCell = row.querySelector('td:nth-child(2)');
                            if (contentCell) {
                                contentCell.textContent = questionContent;
                            }

                            // Update the data attributes for view and edit buttons
                            const viewBtn = actionCell.querySelector('.view-details-btn');
                            if (viewBtn) {
                                viewBtn.dataset.content = questionContent;
                            }
                            editBtn.dataset.content = questionContent;

                            // Show success message
                            showNotification('Cập nhật thành công', data.message, 'success');
                            break;
                        }
                    }
                }
            } else {
                showNotification('Cập nhật thất bại', data.message, 'error');
            }
        })
        .catch(error => {
            console.error('Error updating question:', error);
            showNotification('Lỗi', 'Có lỗi khi cập nhật câu hỏi. Vui lòng thử lại sau.', 'error');
        })
        .finally(() => {
            // Restore button state
            submitButton.innerHTML = originalButtonText;
            submitButton.disabled = false;
        });
});

// Hiển thị thông báo thành công hay thất bại
function showNotification(title, message, type) {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 px-4 py-3 rounded shadow-lg z-50 ${
        type === 'success' ? 'bg-green-100 text-green-800 border-green-500' :
            'bg-red-100 text-red-800 border-red-500'
    } border-l-4`;

    notification.innerHTML = `
        <div class="flex items-center">
            <div class="mr-3">
                <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'} text-xl"></i>
            </div>
            <div>
                <p class="font-bold">${title}</p>
                <p class="text-sm">${message}</p>
            </div>
            <div class="ml-auto">
                <button class="text-gray-500 hover:text-gray-800" onclick="this.parentElement.parentElement.remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        </div>
    `;

    // Add to page
    document.body.appendChild(notification);

    // Auto remove after 5 seconds
    setTimeout(() => {
        notification.classList.add('opacity-0', 'transition-opacity', 'duration-500');
        setTimeout(() => notification.remove(), 500);
    }, 5000);
}

// Validate add form before submission
document.getElementById('addQuestionForm').addEventListener('submit', function (event) {
    const answersList = document.getElementById('add-answers-list');
    const answers = answersList.querySelectorAll('div.flex.items-start');

    if (answers.length <= 1) {
        event.preventDefault();
        alert('Vui lòng thêm ít nhất hai đáp án cho câu hỏi.');
        return false;
    }

    // Ensure at least one answer is marked as correct
    const correctAnswer = answersList.querySelector('input[name="newCorrectAnswerIndex"]:checked');
    if (!correctAnswer) {
        event.preventDefault();
        alert('Vui lòng chọn một đáp án đúng.');
        return false;
    }

    return true;
});

//Submit form add
document.getElementById('addQuestionForm').addEventListener('submit', function (event) {
    event.preventDefault(); // Prevent default form submission

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

    // tạo một formdata để gửi sang controller
    const formData = new FormData();
    formData.append('quesContent', questionContent);
    formData.append('quesType', questionType);
    formData.append('newCorrectAnswerIndex', correctAnswer.value);

    // Add answer data
    answers.forEach((element, index) => {
        const content = element.querySelector('input[type="text"]').value;
        formData.append(`newAnswers[${index}].answerContent`, content);
    });

    // Show loading indicator
    const submitButton = this.querySelector('button[type="submit"]');
    const originalButtonText = submitButton.innerHTML;
    submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang xử lý...';
    submitButton.disabled = true;

    // Submit using fetch
    fetch('/admin/addQues', {
        method: 'POST',
        body: formData
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Server returned status: ' + response.status);
            }
            return response.json();
        })
        .then(data => {
            if (data.success) {
                // Handle success
                closeEditModal();

                // Thêm câu hỏi mới vào bảng
                const tbody = document.querySelector('tbody');
                const newRowNumber = tbody.querySelectorAll('tr').length + 1;

                const newRow = document.createElement('tr');
                newRow.className = 'hover:bg-gray-50';
                newRow.setAttribute('data-id', data.question.questionId);

                newRow.innerHTML = `
                    <td class="border border-gray-300 py-3 px-4">${newRowNumber}</td>
                    <td class="border border-gray-300 py-3 px-4">${data.question.questionContent}</td>
                    <td class="border border-gray-300 py-3 px-4 space-x-2">
                        <a href="#" class="text-blue-600 hover:underline text-sm view-details-btn" 
                            data-id="${data.question.questionId}" data-content="${data.question.questionContent}">Xem chi tiết</a>
                        <a href="#" class="text-blue-600 hover:underline text-sm edit-btn" 
                            data-id="${data.question.questionId}" data-content="${data.question.questionContent}">Chỉnh sửa</a>
                        <a href="#" class="text-red-600 hover:underline text-sm delete-btn" 
                            data-id="${data.question.questionId}">Xóa</a>
                    </td>
                `;

                tbody.appendChild(newRow);

                // Ẩn thông báo "không có câu hỏi nào"
                const noQuestionsMsg = document.querySelector('h2[style*="color: red; text-align: center;"]');
                if (noQuestionsMsg) {
                    noQuestionsMsg.style.display = 'none';
                }

                // Thêm các event listener cho các button mới
                const viewBtn = newRow.querySelector('.view-details-btn');
                viewBtn.addEventListener('click', function(event) {
                    event.preventDefault();
                    document.getElementById('question-id').textContent = this.dataset.id;
                    document.getElementById('question-content').textContent = this.dataset.content;
                    document.getElementById('questionDetailsModal').classList.remove('hidden');
                    fetchQuestionDetails(this.dataset.id);
                });

                const editBtn = newRow.querySelector('.edit-btn');
                editBtn.addEventListener('click', function(event) {
                    event.preventDefault();
                    document.getElementById('edit-question-id').value = this.dataset.id;
                    document.getElementById('edit-question-content').value = this.dataset.content;
                    document.getElementById('answers-list').innerHTML = '';
                    document.getElementById('editQuestionModal').classList.remove('hidden');
                    fetchAnswersForEdit(this.dataset.id);
                });

                const deleteBtn = newRow.querySelector('.delete-btn');
                deleteBtn.addEventListener('click', function(event) {
                    event.preventDefault();
                    document.getElementById('deleteUserId').value = this.dataset.id;
                    document.getElementById('deleteUserModal').classList.remove('hidden');
                });

                // Reset form
                this.reset();
                answersList.innerHTML = '';
                addNewAnswerInput(answersList, '', false, 0);
                updateAddAnswerCounter(1);

                // Show success message
                showNotification('Thêm thành công', data.message, 'success');
            } else {
                showNotification('Thêm thất bại', data.message, 'error');
            }
        })
        .catch(error => {
            console.error('Error adding question:', error);
            showNotification('Lỗi', 'Có lỗi khi thêm câu hỏi. Vui lòng thử lại sau.', 'error');
        })
        .finally(() => {
            // Restore button state
            submitButton.innerHTML = originalButtonText;
            submitButton.disabled = false;
        });
});
