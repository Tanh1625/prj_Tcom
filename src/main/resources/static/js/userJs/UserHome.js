document.addEventListener("DOMContentLoaded", () => {
    const pageSize = document.getElementById("selectPageSize");
    loadData(pageNo=1,pageSize.value);

    pageSize.addEventListener("change", () => {
        const value = pageSize.value;
        loadData(pageNo=1, value);
    })
});

async function loadData(pageNo, pageSize) {
    // load lịch sử làm bài từ sever và phân trang
    try {
        const response = await fetch(`/user/home1?pageNo=${pageNo}&pageSize=${pageSize}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        });
        if(response.ok) {
            const data = await response.json();
            console.log(data);
            renderTableHistory(data, pageSize);
            renderPaginational(data.currentPage,data.totalPages, pageSize);
        } else {
            const errorData = await response.json();
            console.error("Error loading data:", errorData);
            showNotification("Lỗi", errorData.messageErr, "error");
        }

    }catch (error) {
        console.error("Error loading data:", error);
        showNotification("Lỗi", "Lỗi ở ngoài Catch", "error");
    }

}'/'




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

function formatDateTime(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN',{
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',

        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    })
}

function renderTableHistory(data, pageSize) {
    const tablebody = document.getElementById("tableHistory");
    tablebody.innerHTML = ""; // Clear previous data
    const historyList = data.examHistoryList;
    const totalPage = data.totalPages;
    const currentPage = data.currentPage;
    const content = historyList.content;
    for(let i =0; i< content.length; i++){
        const row = document.createElement("tr");
        row.innerHTML = `
                        <td class="py-3 px-4 font-semibold border-r border-gray-100">
                            ${(currentPage - 1) * pageSize + i + 1}
                        </td>
                        <td class="py-3 px-4 border-r border-gray-100">
                            ${content[i].exam.examName}
                        </td>
                        <td class="py-3 px-4 border-r border-gray-100">
                            ${formatDateTime(content[i].startAt)}
                        </td>
                        <td class="py-3 px-4 border-r border-gray-100">
                            ${formatDateTime(content[i].endAt)}
                        </td>
                        <td class="py-3 px-4 text-center text-green-500 border-r border-gray-100">
                            ${content[i].score}
                        </td>
        `;
        tablebody.appendChild(row);
    }
}



// phân trang
function renderPaginational(currentPage, totalPage, pageSize) {
    const paginational = document.getElementById("paginational");
    paginational.innerHTML = "";

    const pagination = document.createElement("ul");
    pagination.className = "pagination pagination-sm mb-0";

    // Prev button
    if (currentPage > 1) {
        pagination.appendChild(createPageItem("«", currentPage - 1, pageSize));
    }

    // Always show first page
    pagination.appendChild(createPageItem(1, 1, pageSize, currentPage === 1));

    // Show leading dots
    if (currentPage > 3) {
        pagination.appendChild(createEllipsisItem());
    }

    // Show 3 pages around currentPage
    for (let i = currentPage - 1; i <= currentPage + 1; i++) {
        if (i > 1 && i < totalPage) {
            pagination.appendChild(createPageItem(i, i, pageSize, i === currentPage));
        }
    }

    // Show trailing dots
    if (currentPage < totalPage - 2) {
        pagination.appendChild(createEllipsisItem());
    }

    // Always show last page
    if (totalPage > 1) {
        pagination.appendChild(createPageItem(totalPage, totalPage, pageSize, currentPage === totalPage));
    }

    // Next button
    if (currentPage < totalPage) {
        pagination.appendChild(createPageItem("»", currentPage + 1, pageSize));
    }

    paginational.appendChild(pagination);
}

function createPageItem(text, pageNo, pageSize, isActive = false) {
    const li = document.createElement("li");
    li.className = `page-item ${isActive ? 'active' : ''}`;

    const a = document.createElement("a");
    a.className = "page-link";
    a.href = "javascript:void(0)";
    a.textContent = text;
    a.onclick = () => loadData(pageNo, pageSize);

    li.appendChild(a);
    return li;
}

function createEllipsisItem() {
    const li = document.createElement("li");
    li.className = "page-item disabled";

    const span = document.createElement("span");
    span.className = "page-link";
    span.textContent = "...";

    li.appendChild(span);
    return li;
}
document.addEventListener("error", (event) => {
    console.error("Error loading data:", event);
    showNotification("Lỗi", "Lỗi ở ngoài Catch", "error");
})