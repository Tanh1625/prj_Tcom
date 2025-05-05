document.addEventListener("DOMContentLoaded", () => {

    loadData(pageNo=1);
});


async function loadData(pageNo) {
    try {
        const response = await fetch(`/admin/logtracking1?pageNo=${pageNo}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        });
        if(response.ok) {
            const data = await response.json();
            console.log(data);
            renderTableHistory(data);
            renderPaginational(data.currentPage,data.totalPage);
            console.log("oke rồi");
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


function renderTableHistory(data) {
    const tablebody = document.getElementById("tableHistory");
    tablebody.innerHTML = ""; // Clear previous data
    const historyList = data.logTrackingList;
    const totalPage = data.totalPages;
    const currentPage = data.currentPage;
    const content = historyList.content;
    for(let i =0; i< content.length; i++){
        const row = document.createElement("tr");
        row.innerHTML = `
                    <td class="border border-gray-300 py-3 px-4">${(currentPage-1)*10+i+1}</td>
                    <td class="border border-gray-300 py-3 px-4">${formatDateTime(content[i].time)}</td>
                    <td class="border border-gray-300 py-3 px-4">${content[i].content}</td>
        `;
        tablebody.appendChild(row);
    }
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


// phân trang
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