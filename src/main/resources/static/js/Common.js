// Hiển thị thông báo thành công hay thất bại
export function showNotification(title, message, type) {
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
