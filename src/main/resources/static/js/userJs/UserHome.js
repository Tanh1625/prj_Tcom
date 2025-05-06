document.addEventListener("DOMContentLoaded", () => {

   loadData(pageNo=1);
});

async function loadData(pageNo) {


    // load lịch sử làm bài từ sever và phân trang
    try {
        const response = await fetch(`/user/home1?pageNo=${pageNo}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        });
        if(response.ok) {
            const data = await response.json();
            console.log(data);
            renderTableHistory(data);
            renderPaginational(data.currentPage,data.totalPages);
        } else {
            const errorData = await response.json();
            console.error("Error loading data:", errorData);
            showNotification("Lỗi", errorData.messageErr, "error");
        }

    }catch (error) {
        console.error("Error loading data:", error);
        showNotification("Lỗi", "Lỗi ở ngoài Catch", "error");
    }

}




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

function renderTableHistory(data) {
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
                            ${(currentPage - 1) * 5 + i + 1}
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

function renderPaginational(currentPage, totalPage){
    const paginational = document.getElementById("paginational");
    paginational.innerHTML = ""; // Clear previous data
    paginational.classList.add('pagination-sm', 'no-margin', 'float-end', 'square-pagination', 'flex', 'justify-end', 'space-x-1');

    const pagination = document.createElement("ul");
    pagination.classList.add('flex', 'justify-center', 'items-center', 'space-x-1');

    if(currentPage > 1){
        const prev_item = document.createElement("li");
        const prevItem = document.createElement("a");
        prevItem.setAttribute("href", "javascript:void(0)");
        prevItem.classList.add('py-2', 'px-3', 'border', 'border-gray-300', 'rounded');
        prevItem.textContent = '«';
        prevItem.onclick = ()=> loadData(currentPage-1);
        prev_item.appendChild(prevItem);
        pagination.appendChild(prev_item);
    }

    for(let i = 1; i <= totalPage; i++){
        const page_item = document.createElement("li");
        const item = document.createElement("a");
        item.setAttribute("href", "javascript:void(0)");
        item.classList.add('py-2', 'px-3', 'border', 'border-gray-300', 'rounded');
        item.textContent = i;
        item.onclick = () => loadData(i);
        if(i === currentPage){
            item.classList.add('bg-blue-500', 'text-white');
        }
        page_item.appendChild(item);
        pagination.appendChild(page_item);
    }

    if(currentPage < totalPage){
        const next_item = document.createElement("li");
        const nextItem = document.createElement("a");
        nextItem.setAttribute("href", "javascript:void(0)");
        nextItem.classList.add('py-2', 'px-3', 'border', 'border-gray-300', 'rounded');
        nextItem.textContent = '»';
        nextItem.onclick = () => loadData(currentPage+1);
        next_item.appendChild(nextItem);
        pagination.appendChild(next_item);
    }
    paginational.appendChild(pagination);
}