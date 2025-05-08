document.addEventListener("DOMContentLoaded", () => {
    loadData();
    activateExamMode();
});
// Constants
const quizForm = document.getElementById("quiz-form");
let questionNavButtons = document.querySelectorAll(".question-nav-btn");
let questionFieldsets = document.querySelectorAll(".question-fieldset");
const endTestBtn = document.getElementById("end-test-btn");
const nextQuestionBtn = document.getElementById("next-question-btn");

let testEnded = false;
let currentQuestionNum = "1"; // Theo dõi câu hỏi hiện tại

// Hàm chuyển câu hỏi
function showQuestion(num) {
    // Cập nhật biến theo dõi câu hỏi hiện tại
    currentQuestionNum = num;

    // Ẩn tất cả các câu hỏi và hiển thị câu hỏi được chọn
    questionFieldsets = document.querySelectorAll(".question-fieldset"); // Update reference
    questionFieldsets.forEach((fs) => {
        if (fs.dataset.question === num) {
            fs.classList.remove("d-none");
        } else {
            fs.classList.add("d-none");
        }
    });

    // Cập nhật trạng thái active cho các nút điều hướng
    questionNavButtons = document.querySelectorAll(".question-nav-btn"); // Update reference
    questionNavButtons.forEach((btn) => {
        if (btn.dataset.question === num) {
            btn.classList.add("active");
            btn.setAttribute("aria-current", "true");
            btn.tabIndex = 0;
        } else {
            btn.classList.remove("active");
            btn.removeAttribute("aria-current");
            btn.tabIndex = -1;
        }
    });

    // Cập nhật trạng thái nút "Câu Tiếp Theo"
    updateNextButton(num);

    // Chỉ tập trung vào phần tử câu hỏi (không focus nút)
    const currentFieldset = document.querySelector(`.question-fieldset[data-question="${num}"]`);
    if (currentFieldset) {
        currentFieldset.focus();
    }
}

// Cập nhật trạng thái nút "Câu Tiếp Theo"
function updateNextButton(currentNum) {
    questionFieldsets = document.querySelectorAll(".question-fieldset"); // Update reference
    const current = parseInt(currentNum, 10);
    if (current >= questionFieldsets.length) {
        nextQuestionBtn.disabled = true;
        nextQuestionBtn.classList.add("disabled");
        nextQuestionBtn.classList.add("d-none");
        nextQuestionBtn.textContent = "Đã là câu cuối";
    } else {
        nextQuestionBtn.disabled = false;
        nextQuestionBtn.classList.remove("disabled");
        nextQuestionBtn.classList.remove("d-none");
        nextQuestionBtn.innerHTML = `Câu Tiếp Theo <i class="fas fa-arrow-right ms-2"></i>`;
    }
}

// Xử lý click chọn câu hỏi
function setupQuestionNavListeners() {
    questionNavButtons = document.querySelectorAll(".question-nav-btn");
    questionNavButtons.forEach((btn) => {
        btn.addEventListener("click", () => {
            if (!testEnded) {
                showQuestion(btn.dataset.question);
            } else {
                alert("Bạn đã kết thúc bài kiểm tra, không thể chuyển câu hỏi.");
            }
        });
    });
}

// Xử lý nút chuyển câu hỏi tiếp theo
nextQuestionBtn.addEventListener("click", () => {
    if (testEnded) {
        alert("Bạn đã kết thúc bài kiểm tra, không thể chuyển câu hỏi.");
        return;
    }

    // Sử dụng currentQuestionNum thay vì tìm nút active
    const currentNum = parseInt(currentQuestionNum, 10);
    const nextNum = currentNum + 1;

    // Kiểm tra xem có câu hỏi tiếp theo không
    questionFieldsets = document.querySelectorAll(".question-fieldset"); // Update reference
    if (nextNum <= questionFieldsets.length) {
        showQuestion(nextNum.toString());
    }
});

function renderScore(data) {
    const scoreContainer = document.getElementById("score-container");
    scoreContainer.classList.remove("d-none");
    scoreContainer.innerHTML = `
    <h3 class="fw-semibold mb-4 text-center">Tổng điểm:</h3>
    <h4 class="fw-semibold mb-4 text-center">${data.score}</h4>
        <div class="d-flex flex-column gap-4 text-center">
            <div>
                <div class="text-muted">Tổng số câu đúng:</div>
                <div id="total-correct" class="fw-bold fs-4 text-dark">${data.numCorrect}/${data.totalType}</div>
            </div>
            
            <button id="back-to-exam-list" class="btn btn-primary">
            Quay về danh sách đề thi
            </button>
        </div>`

    const backToExamListBtn = document.getElementById("back-to-exam-list");
    backToExamListBtn.addEventListener("click", () => {
        window.location.href = "/user/examList";
    })
}

// Xử lý kết thúc bài kiểm tra
endTestBtn.addEventListener("click", () => {
    if (!testEnded) {
        if (
            confirm(
                "Bạn có chắc chắn muốn kết thúc bài kiểm tra? Sau khi kết thúc, bạn không thể thay đổi câu trả lời hoặc chuyển câu hỏi."
            )
        ) {
            // Gửi câu trả lời đến server
            const submit = {
                answers: {},
                startTime: startTime,
                type: keyExam,
            }

            const form = document.getElementById("quiz-form");
            const formData = new FormData(form);
            for (const [key, value] of formData.entries()) {
                submit.answers[key] = value;
            }


            fetch(`/api/exam/submitAnswer`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(submit),
            }).then(response => {
                if (response.ok) {
                    console.log("Đã gửi câu trả lời thành công.");
                    return response.json();

                } else {
                    alert("Đã xảy ra lỗi khi gửi câu trả lời.");
                }
            }).then(data => {
                renderScore(data);
                console.log("Kết quả bài kiểm tra: ", data.score);
                console.log("Số câu đúng: ", data.numCorrect);
                console.log("Tổng số câu: ", data.totalType);
            })
                .catch(error => {
                    console.error("Lỗi khi gửi câu trả lời:", error);
                    alert("Đã xảy ra lỗi khi gửi câu trả lời.");
                })

            // vô hiệu hóa  form
            testEnded = true;
            disableForm();
            alert("Bài kiểm tra đã được kết thúc.");
        }
    } else {
        alert("Bài kiểm tra đã được kết thúc trước đó.");
    }
});

// Vô hiệu hóa form và các nút chuyển câu hỏi khi kết thúc bài
function disableForm() {
    // Disable all inputs
    const inputs = quizForm.querySelectorAll("input");
    inputs.forEach((input) => {
        input.disabled = true;
    });
    // Disable next question button
    nextQuestionBtn.disabled = true;
    nextQuestionBtn.classList.add("disabled");
    // Disable question nav buttons
    questionNavButtons = document.querySelectorAll(".question-nav-btn"); // Update reference
    questionNavButtons.forEach((btn) => {
        btn.disabled = true;
        btn.classList.add("disabled");
    });
    // Disable end test button
    endTestBtn.disabled = true;
    endTestBtn.classList.add("disabled");
}


const keyExam = sessionStorage.getItem("key");
const startTime = sessionStorage.getItem("startTime");

async function loadData() {
    //load câu hỏi từ server
    try {
        const response = await fetch(`/api/exam/getQuestion?key=${keyExam}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        });
        if (!response.ok) {
            throw new Error("Network response was not ok");
        }
        const data = await response.json();
        console.log("Dữ liệu câu hỏi: ", data);

        const title = document.getElementById("titleExam");
        const title2 = document.getElementById("quiz-title");
        title.textContent = "Bài kiểm tra: " + data[0].questionType;
        title2.textContent = "Bài kiểm tra: " + data[0].questionType;

        rendertime(data.length);


        // Render questions
        renderAllQuestions(data);
        // Render navigation buttons
        renderQuestionNavButtons(data.length);

        // Re-attach event listeners after rendering
        setupQuestionNavListeners();

        // Show first question by default
        showQuestion("1");

    } catch (error) {
        console.log("lỗi lấy dữ liệu câu hỏi: ", error);
        alert("Bộ câu hỏi " + keyExam + " hiện không khả dụng");
        window.location.href = "/user/examList";
    }
}

let timer = null;

function rendertime(totalTime) {
    const timeDo = document.getElementById("timer-text");
    let timeLeft = totalTime * 60;

    // Set the timer
    timer = setInterval(() => {
        const minute = Math.floor(timeLeft / 60);
        const second = timeLeft % 60;
        timeDo.textContent = `Thời gian còn lại: ${minute.toString().padStart(2, '0')}:${second.toString().padStart(2, '0')}`;

        if (!testEnded) {
            timeLeft--;

            if (testEnded) {
                clearInterval(timer);
                return;
            }

            if (timeLeft < 0) {
                clearInterval(timer);
                alert("Thời gian đã hết, bài kiểm tra sẽ tự động kết thúc.");

                // Gửi câu trả lời đến server
                const submit = {
                    answers: {},
                    startTime: startTime,
                    type: keyExam,
                }

                const form = document.getElementById("quiz-form");
                const formData = new FormData(form);
                for (const [key, value] of formData.entries()) {
                    submit.answers[key] = value;
                }

                fetch(`/api/exam/submitAnswer`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(submit),
                }).then(response => {
                    if (response.ok) {
                        console.log("Đã gửi câu trả lời thành công.");
                        return response.json();

                    } else {
                        alert("Đã xảy ra lỗi khi gửi câu trả lời.");
                    }
                }).then(data => {
                    renderScore(data);
                    console.log("Kết quả bài kiểm tra: ", data.score);
                    console.log("Số câu đúng: ", data.numCorrect);
                    console.log("Tổng số câu: ", data.totalType);
                })
                    .catch(error => {
                        console.error("Lỗi khi gửi câu trả lời:", error);
                        alert("Đã xảy ra lỗi khi gửi câu trả lời.");
                    })

                // vô hiệu hóa  form
                testEnded = true;
                disableForm();
            }

        }
    }, 1000);

}

function renderAllQuestions(data) {
    const quizForm = document.getElementById("quiz-form");
    quizForm.innerHTML = ""; // Xóa các câu cũ

    data.forEach((question, index) => {
        const qNumber = index + 1;
        const fieldset = document.createElement("fieldset");
        fieldset.className = `question-fieldset ${qNumber === 1 ? "" : "d-none"}`;
        fieldset.setAttribute("data-question", qNumber.toString());
        fieldset.setAttribute("tabindex", "-1");
        fieldset.setAttribute("role", "group");
        fieldset.setAttribute("aria-labelledby", `legend-q${qNumber}`);

        const legend = document.createElement("legend");
        legend.id = `legend-q${qNumber}`;
        legend.className = "mb-3";
        legend.textContent = `${qNumber}. ${question.questionContent}`;
        fieldset.appendChild(legend);

        question.answers.forEach((ans, idx) => {
            const wrapper = document.createElement("div");
            wrapper.className = "form-check mb-2";
            const inputId = `q${qNumber}a${idx + 1}`;

            wrapper.innerHTML = `
                <input
                    class="form-check-input"
                    type="radio"
                    name="q${qNumber}"
                    id="${inputId}"
                    value="${ans.answerId}"
                    ${idx === 0 ? 'required' : ''}
                />
                <label class="form-check-label" for="${inputId}">
                    ${ans.answerContent}
                </label>
            `;
            fieldset.appendChild(wrapper);
        });

        quizForm.appendChild(fieldset);
    });

    // Add next button container
    const nextButtonContainer = document.createElement("div");
    nextButtonContainer.className = "d-flex justify-content-center";
    nextButtonContainer.innerHTML = `
        <button
            type="button"
            id="next-question-btn"
            class="btn btn-primary px-3"
            aria-label="Chuyển câu hỏi tiếp theo"
            >
            Câu Tiếp Theo <i class="fas fa-arrow-right ms-2"></i>
        </button>
    `;
    quizForm.appendChild(nextButtonContainer);

    // Update references after rendering
    questionFieldsets = document.querySelectorAll(".question-fieldset");

    // Re-attach event listener to the new next button
    const newNextBtn = document.getElementById("next-question-btn");
    if (newNextBtn) {
        newNextBtn.addEventListener("click", () => {
            if (testEnded) {
                alert("Bạn đã kết thúc bài kiểm tra, không thể chuyển câu hỏi.");
                return;
            }

            // Sử dụng currentQuestionNum thay vì tìm nút active
            const currentNum = parseInt(currentQuestionNum, 10);
            const nextNum = currentNum + 1;

            // Kiểm tra xem có câu hỏi tiếp theo không
            if (nextNum <= questionFieldsets.length) {
                showQuestion(nextNum.toString());
            }
        });
    }
}

function renderQuestionNavButtons(numQuestions) {
    const questionNav = document.getElementById("question-nav");
    questionNav.innerHTML = ""; // Xóa các nút cũ

    for (let i = 1; i <= numQuestions; i++) {
        const li = document.createElement("li");
        const btn = document.createElement("button");

        btn.type = "button";
        btn.className = i === 1 ? "question-nav-btn active" : "question-nav-btn";
        btn.dataset.question = i.toString();
        btn.setAttribute("aria-current", i === 1 ? "true" : "false");
        btn.setAttribute("aria-label", `Chọn câu hỏi ${i}`);
        btn.tabIndex = i === 1 ? "0" : "-1";
        btn.textContent = i.toString();

        li.appendChild(btn);
        questionNav.appendChild(li);
    }
}



function activateExamMode() {
    // Ngăn thoát hoặc reload trang
    window.addEventListener("beforeunload", function (e){
        if(!testEnded){
            // Hiển thị hộp thoại xác nhận
            const message = "Bạn có chắc chắn muốn thoát bài kiểm tra? Tất cả câu trả lời sẽ không được lưu.";
            e.preventDefault();
            e.returnValue = message;
            return message;
        }
    });

    if(!testEnded){
        history.pushState(null, null, location.href);
        window.addEventListener("popstate", function (){
           history.pushState(null, null, location.href);
           alert("Bạn không thể quay lại trang trước đó trong bài kiểm tra.");
        });
    }

    // Ngăn không cho nhấn phím F5
    document.addEventListener("keydown", function (e) {
        if (e.key === "F5" || e.ctrlKey && e.key.toLowerCase() === "r"){
            e.preventDefault();
            alert("Bạn không thể tải lại trang trong khi làm bài kiểm tra!");
        }

    })
}

