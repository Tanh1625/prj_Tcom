import * as common from '../Common.js';
window.closeEditQuestionModal = closeEditQuestionModal;
window.closeDetailsModal = closeDetailsModal;
window.closeDeleteModal = closeDeleteModal;
window.closeAddModal = closeAddModal;

let originalData = [];
let modifiedData = [];
const MAX_ANSWERS = 4;

document.addEventListener('DOMContentLoaded', async () => {
    await loadData();
    console.log("Modified Data:",modifiedData);
    console.log("Original Data:", originalData);

})

async function loadData() {
    try{
        const path = window.location.pathname.split('/');
        const id = path[path.length - 1];
        const response = await fetch(`/admin/api/questionList/${id}`);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        originalData = await response.json();
        modifiedData = JSON.parse(JSON.stringify(originalData)); // Deep copy

        renderTable(originalData.data);
    }catch(err){
        console.error('Error loading data:', err);
    }
}

function renderTable(data) {
    const tableBody = document.getElementById('tableBody');
    tableBody.innerHTML = '';


    data.filter((item) => item.statusChange !== 'deleted')
        .forEach((item, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="border border-gray-300 py-3 px-4">${index+1}</td>
                <td class="border border-gray-300 py-3 px-4">
                    ${item.questionContent}
                </td>
                <td class="border border-gray-300 py-3 px-4 space-x-2">
                    <a href="#" class="text-blue-600 hover:underline text-sm view-details-btn"
                       data-id="${item.questionId}" data-content="${item.questionContent}">Xem chi tiết</a>
                    <a href="#" class="text-blue-600 hover:underline text-sm edit-btn"
                       data-id="${item.questionId}">Chỉnh sửa</a>
                    <a href="#" class="text-red-600 hover:underline text-sm delete-btn"
                       data-id="${item.questionId}">Xóa</a>
                </td>
        `;
        tableBody.appendChild(row);
    });
}

// ----------_______________Xem chi tiết_____________-------------

document.getElementById('tableBody').addEventListener('click', (e) => {
    const btn = e.target.closest('.view-details-btn');
    if (!btn) return;

    e.preventDefault();
    const questionId = btn.dataset.id;
    let questionContent;
    const found = modifiedData.data.find(item => item.questionId == questionId);
    if (found) {
        questionContent = found.questionContent;
    }
    document.getElementById('question-id').textContent = questionId;
    document.getElementById('question-content').textContent = questionContent;

    //show answer
    const additionalDetails = document.getElementById('additional-details');
    additionalDetails.innerHTML = '';
    const answers = found.answers || [];
    if( answers.length > 0) {
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
    }else{
        additionalDetails.innerHTML = '<p class="text-gray-500">Không có đáp án cho câu hỏi này.</p>';
        return;
    }

    document.getElementById('questionDetailsModal').classList.remove('hidden');
});

function closeDetailsModal() {
    document.getElementById('questionDetailsModal').classList.add('hidden');
}


// ----------_______________Chỉnh sửa_____________-------------
document.getElementById('tableBody').addEventListener('click', (e) => {
    const btn = e.target.closest('.edit-btn');
    if (!btn) return;

    e.preventDefault();
    const questionId = btn.dataset.id;
    let questionContent;
    const found = modifiedData.data.find(item => item.questionId == questionId);
    if (found) {
        questionContent = found.questionContent;
    }

    // Show edit modal
    document.getElementById('edit-question-id').value = questionId;
    document.getElementById('edit-question-content').value = questionContent;

    // show answer
    const answersList = document.getElementById('answers-list');
    answersList.innerHTML = '';
    const answers = found.answers || [];
    renderAnswerInputs(answers, answersList);

    document.getElementById('editQuestionModal').classList.remove('hidden');
});

function closeEditQuestionModal() {
    renderTable(modifiedData.data);
    document.getElementById('editQuestionModal').classList.add('hidden');
}

// Hàm render input đáp án
function renderAnswerInputs(answers, container) {
    container.innerHTML = ''; // Xóa nội dung cũ nếu có
    answers.forEach((answer, index) => {
        addEditOnlyAnswerInput(
            container,
            answer.answerContent,
            answer.correct,
            index,
            answer.answerId
        );
    });
}

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

document.getElementById('editQuestionForm').addEventListener('submit',handleEditQuestion );

// lưu tạm thời
function handleEditQuestion(event){
    event.preventDefault();

    const answersList = document.getElementById('answers-list');
    const correctAnswer = answersList.querySelector('input[name="correctAnswerIndex"]:checked');
    if (!correctAnswer) {
        alert('Vui lòng chọn một đáp án đúng.');
        return;
    }

    const questionId = document.getElementById('edit-question-id').value;
    const questionContent = document.getElementById('edit-question-content').value;


    const found = modifiedData.data.find(item => item.questionId == questionId);
    if(!found){
        alert('Câu hỏi không tồn tại.');
        return;
    }
    found.questionContent = questionContent;


    const answerElements = answersList.querySelectorAll('div.flex.items-start');
    answerElements.forEach((element, index) => {
        const answerId = element.querySelector('input[name^="answers"][name$="answerId"]').value;
        const content = element.querySelector('input[name^="answers"][name$="answerContent"]').value;
        const answer = found.answers.find(item => item.answerId == answerId);
        if(answer){
            answer.answerContent = content;
            answer.correct = (index.toString() === correctAnswer.value);
        }


    });
    console.log("found:",found);


    closeEditQuestionModal();
}
// hàm kiểm tra và lấy những phần tử bị thay đổi
function getChangedQuestions(original, modified) {
    const changed = [];

    modified.data.forEach((modQ) => {
        let questionChanged = false;

        const origQ = original.data.find(o => o.questionId === modQ.questionId);

        if (!origQ) {
            // Câu hỏi mới thêm
            questionChanged = true;
        } else {
            // So sánh nội dung câu hỏi và trạng thái
            if (origQ.questionContent !== modQ.questionContent) {
                questionChanged = true;
            }
            if ((origQ.statusChange || '') !== (modQ.statusChange || '')) {
                questionChanged = true;
            }

            // So sánh đáp án
            const modifiedAnswers = modQ.answers || [];
            const originalAnswers = origQ.answers || [];

            // Kiểm tra đáp án mới hoặc thay đổi trong modifiedAnswers
            for (let i = 0; i < modifiedAnswers.length; i++) {
                const modA = modifiedAnswers[i];
                const origA = originalAnswers.find(a => a.answerId === modA.answerId);

                if (!origA || modA.answerContent !== origA.answerContent || modA.correct !== origA.correct) {
                    questionChanged = true;
                    break;
                }
            }

            // Kiểm tra đáp án bị xóa (có trong originalAnswers mà không có trong modifiedAnswers)
            if (!questionChanged) {
                for (let i = 0; i < originalAnswers.length; i++) {
                    const origA = originalAnswers[i];
                    const modA = modifiedAnswers.find(a => a.answerId === origA.answerId);
                    if (!modA) {
                        questionChanged = true;
                        break;
                    }
                }
            }
        }

        if (questionChanged) {
            changed.push(modQ);
        }
    });

    return changed;
}


// ----------_______________Test lưu toàn bô_____________-------------
const saveBtn = document.getElementById('saveChangesButton');
saveBtn.addEventListener('click', async () => {
    const changedQuestions = getChangedQuestions(originalData, modifiedData);
    console.log("change:",changedQuestions);

    const fileInput = document.getElementById('pdfFile');
    const file = fileInput.files[0];


    if( changedQuestions.length > 0 && !file ) {
        await saveChanges(changedQuestions);
    }else if(changedQuestions.length === 0 && file) {
        if ((file.type !== 'application/pdf') && !(!file)) {
            alert('Vui lòng chọn tệp PDF hợp lệ.');
        }
        else if (file.size > 10 * 1024 * 1024) { // 10MB limit
            alert('Tệp PDF quá lớn. Vui lòng chọn tệp nhỏ hơn 10MB.');
        }
        await savePdf(file);
    }else if (changedQuestions.length === 0 || !file) {
        alert("Không có thay đổi nào cần lưu.");
    }else{
        await savePdf_allChange(file, changedQuestions);
    }

});


// -----------// Gửi dữ liệu đã thay đổi đến server
async function saveChanges(changedQuestions) {
    try {
        const response = await fetch('/admin/api/questionList/update', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(changedQuestions)
        });

        if (!response.ok) {
            throw new Error('Lưu dữ liệu thất bại.');
        }
        const result = await response.json();
        if( result.success) {
            common.showNotification('Thành công', 'Dữ liệu đã được lưu thành công.', 'success');
            // Cập nhật lại dữ liệu gốc và hiển thị lại bảng
            originalData = JSON.parse(JSON.stringify(modifiedData));
            renderTable(originalData.data);
        } else{
            common.showNotification('Cảnh báo', result.message, 'error');
            await loadData();
        }

    } catch (err) {
        console.error('Lỗi khi lưu:', err);
        alert('Có lỗi xảy ra.');
    }
}


async function savePdf(file){
    const url = window.location.pathname.split('/');
    const id = url[url.length - 1]; // Lấy phần cuối của URL để xác định ID câu hỏi


    const formData = new FormData();
    formData.append('file', file);
    formData.append('examId', id);

    fetch(`/admin/pdf/upload`, {
        method: 'POST',
        body: formData
    }).then(response => {
        if (!response.ok) {
            throw new Error('Có vấn đề khi tải lên tệp PDF: ' + response.statusText);
        }
        return response.json();
    })
        .then(data => {
            if (data.success) {
                common.showNotification("Thành công", "Tải lên PDF thành công.", "success");
                // Cập nhật giao diện hoặc làm gì đó sau khi tải lên thành công
                loadPdf();
            } else {
                alert('Tải lên PDF thất bại: ' + data.message);
            }
        })
        .catch(error => {
            console.error('Có lỗi xảy ra:', error);
            alert('Có lỗi khi tải lên PDF. Vui lòng thử lại sau.');
        })
}

async function savePdf_allChange(file, changedQuestions){
    const formData = new FormData();
    formData.append('file', file);
    formData.append('changedQuestions', JSON.stringify(changedQuestions));
    const url = window.location.pathname.split('/');
    const id = url[url.length - 1];
    formData.append('examId', id);
    console.log(formData);
    fetch(`/admin/question/saveAll`, {
        method: 'POST',
        body: formData
    }).then(response => {
        if (!response.ok) {
            throw new Error('Có vấn đề khi tải lên tệp PDF: ' + response.statusText);
        }
        return response.json();
    })
        .then(data => {
            if (data.success) {
                common.showNotification("Thành công", "Dữ liệu đã được lưu thành công.", "success");
                // Cập nhật giao diện hoặc làm gì đó sau khi tải lên thành công
                originalData = JSON.parse(JSON.stringify(modifiedData));
                renderTable(originalData.data);
                loadPdf();

            } else {
                alert('Save All Failed: ' + data.message);
                common.showNotification("Cảnh báo", data.message, "error");
            }
        })
        .catch(error => {
            console.error('Có lỗi xảy ra:', error);
            alert('Có lỗi khi tải lên PDF. Vui lòng thử lại sau.');
        })
}




// --------------------loadData PDF_----------

function loadPdf(){
    const url = window.location.pathname.split('/');
    const id = url[url.length - 1];
    // Fetch the exam details to check if a PDF is already uploaded
    fetch(`/admin/pdf/${id}`, {
        method: 'GET',
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Không thể tải thông tin PDF: ' + response.statusText);
            }
            console.log("Đã tải thông tin PDF thành công");
            return response.json();
        })
        .then(data => {
            console.log(data);
            const pdfContainer = document.getElementById('pdfContainer');
            if (data.pdfFiles) {
                pdfContainer.innerHTML = '';
                // Hiển thị PDF
                for (const pdfFile of data.pdfFiles) {
                    const pdf = pdfFile;
                    const byteCharacters = atob(pdf.fileData);
                    const byteNumbers = new Array(byteCharacters.length);
                    for (let i = 0; i < byteCharacters.length; i++) {
                        byteNumbers[i] = byteCharacters.charCodeAt(i);
                    }
                    const byteArray = new Uint8Array(byteNumbers);
                    const blob = new Blob([byteArray], { type: pdf.fileType });
                    const blobUrl = URL.createObjectURL(blob);
                    // Gắn link nếu bạn muốn người dùng click:
                    pdfContainer.innerHTML += `
                    <a href="${blobUrl}" target="_blank" class="text-blue-600 hover:underline">
                     Mở PDF: ${pdf.fileName}
                     </a>
                     <br>
                  `;
                }

            } else {
                pdfContainer.innerHTML = '<p class="text-gray-500">Chưa có PDF nào được tải lên.</p>';
            }
        })
        .catch(error => {
            console.error('Có lỗi xảy ra khi tải thông tin PDF:', error);
            document.getElementById('pdfContainer').innerHTML = '<p class="text-red-500">Không thể tải thông tin PDF. Vui lòng thử lại sau.</p>';
        });
}

document.addEventListener('DOMContentLoaded', loadPdf);



// --------------------Xóa câu hỏi-------------------


document.getElementById('tableBody').addEventListener('click', (e) => {
    const btn = e.target.closest('.delete-btn');
    if (!btn) return;

    e.preventDefault();
    const questionId = btn.dataset.id;

    // Show edit modal
    document.getElementById('deleteQuesId').value = questionId;

    document.getElementById('deleteUserModal').classList.remove('hidden');
});

function closeDeleteModal() {
    renderTable(modifiedData.data);
    document.getElementById('deleteUserModal').classList.add('hidden');
}

document.getElementById('deleteQuesForm').addEventListener('submit',handleDelQuestion );

// lưu tạm thời
function handleDelQuestion(event){
    event.preventDefault();


    const questionId = document.getElementById('deleteQuesId').value;
    console.log("questionId:",questionId);


    const found = modifiedData.data.find(item => item.questionId == questionId);
    if(!found){
        alert('Câu hỏi không tồn tại.');
        return;
    }
    found.statusChange = "deleted";

    if(getChangedQuestions(originalData,modifiedData)){
        console.log("found:",getChangedQuestions(originalData, modifiedData));
    }

    closeDeleteModal();
}


// --------------------Thêm câu hỏi-------------------


document.getElementById('add-question').addEventListener('click', (e) => {

    e.preventDefault();

    // Initialize the add question form
    const addAnswersList = document.getElementById('add-answers-list');
    addAnswersList.innerHTML = '';

    // Add initial answer field
    addNewAnswerInput(addAnswersList, '', false, 0);
    updateAddAnswerCounter(1);

    // Show edit modal
    document.getElementById('addModel').classList.remove('hidden');
});

function closeAddModal() {
    renderTable(modifiedData.data);
    document.getElementById('addModel').classList.add('hidden');
}

document.getElementById('addQuestionForm').addEventListener('submit',handleAddQuestion );

// lưu tạm thời
function handleAddQuestion(event){
    event.preventDefault();

    const id = originalData.data[0].questionType;


    const questionContent = document.getElementById('quesContent').value.trim();
    console.log("questionContent:", questionContent);

    if (!questionContent) {
        alert("Vui lòng nhập nội dung câu hỏi");
        return;
    }
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


    const newQuestion = {
        questionId: 'new-' + Date.now(), // id tạm, bạn có thể sửa theo yêu cầu
        questionContent: questionContent,
        statusChange: "addNew",
        questionType: 1
    };



    modifiedData.data.push(newQuestion)
    if(getChangedQuestions(originalData,modifiedData)){
        console.log("change:",getChangedQuestions(originalData,modifiedData));
    }

    closeAddModal();
}


// -------------Hàm Add thêm câu hỏi mới -------------
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
document.getElementById('add-new-answer-btn').addEventListener('click', function () {
    const answersList = document.getElementById('add-answers-list');
    const currentCount = answersList.querySelectorAll('div.flex.items-start').length;

    // Check if we've reached the maximum allowed answers
    if (currentCount < MAX_ANSWERS) {
        addNewAnswerInput(answersList, '', false, currentCount);
        updateAddAnswerCounter(currentCount + 1);
    }
});
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
