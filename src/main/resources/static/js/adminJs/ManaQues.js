
    const MAX_ANSWERS = 4;
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


    //submit form add bộ câu hỏi
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
// Lấy thông tin câu hỏi mới
    const question = data.question;

// Tạo phần tử mới cho bộ câu hỏi
    const newQuestionCard = document.createElement('a');
    newQuestionCard.href = `/admin/questionList/${question.questionType}`;
    newQuestionCard.className = 'block bg-white rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.1)] h-28 flex items-center justify-center text-center px-4 hover:shadow-lg transition no-underline text-gray-900 font-normal';
    newQuestionCard.innerHTML = `<span>${question.examName}</span>`;  // bạn có thể đổi thành question.questionContent nếu muốn

// Thêm vào danh sách
    document.querySelector('.grid').appendChild(newQuestionCard);
    const quesTypeInput = document.getElementById('quesType');
    quesTypeInput.value = parseInt(quesTypeInput.value) + 1;

    // Cập nhật lại tiêu đề modal
    const modalTitleSpan = document.querySelector('#modal-title span');
    modalTitleSpan.textContent = quesTypeInput.value;
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


    // submit form import câu hỏi
    const importForm = document.getElementById('formSubmit');
    importForm.addEventListener('submit', function (event) {
        event.preventDefault();
       const fileInput = document.getElementById('fileInput');
         const file = fileInput.files[0];
         const formData = new FormData();
         formData.append('file', file);
         if(!file){
                showNotification("Thất bại", "Vui lòng chọn file để import!", "error");
                return;
         }

         fetch(`/admin/import-horizontal`,{
             method: `POST`,
                body: formData
         })
             .then(response => {
                    if(!response.ok){
                        throw new Error('Server returned status: ' + response.status);
                    }
                    return response.json();
             })
             .then(data => {
                 if(data.success){
                     console.log("data:", data);
                     loadData();
                     showNotification("Thành công", data.message, "success");
                 }else{
                        showNotification("Thất bại", data.message, "error");
                 }
             })
                .catch(error => {
                    console.error('Error importing questions:', error);
                    showNotification('Lỗi', 'Có lỗi khi nhập câu hỏi. Vui lòng thử lại sau.', 'error');
                })
    });



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
        },5000);
    }

    // load data

    async function loadData() {
        const response = await fetch(`/admin/questionList`, {
            method: 'GET',
            headers: {
                "Content-Type": "application/json",
            },
        });
        if (response.ok) {
            const data = await response.json();
            console.log(data);
            renderTable(data.examList);
        } else {
            const errorData = await response.json();
            console.error("Error loading data:", errorData);
            showNotification("Lỗi", errorData.message, "error");
        }
    }

    // render table
    function renderTable(data) {
        const tableBody = document.getElementById("listExam");
        tableBody.innerHTML = ''; // Clear existing rows
        for(const item of data) {
            tableBody.innerHTML += `
            <a href="/admin/questionList/${item.examId}"
               class="block bg-white rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.1)] h-28 flex items-center justify-center text-center px-4 hover:shadow-lg transition no-underline text-gray-900 font-normal">
                <span>${item.examName}</span>
            </a>
            `;
        }
    }


    document.addEventListener('DOMContentLoaded', () => {
        loadData();
    })