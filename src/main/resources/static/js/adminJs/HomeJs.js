document.addEventListener('DOMContentLoaded', function () {
    // Initial setup of event listeners
    setupEventListeners();
    setupPaginationListeners();

    // Search functionality with AJAX
    const input = document.getElementById('searchInput');
    const suggestionsBox = document.getElementById('suggestions');
    let searchTimeout;

    input.addEventListener('input', function () {
        const query = this.value.trim();
        clearTimeout(searchTimeout);

        if (query.length < 2) {
            suggestionsBox.innerHTML = '';
            suggestionsBox.classList.add('hidden');
            return;
        }

        // Delay the API call slightly to prevent too many requests while typing
        searchTimeout = setTimeout(() => {
            fetch(`/api/suggestions?query=${encodeURIComponent(query)}`)
                .then(response => response.json())
                .then(data => {
                    suggestionsBox.innerHTML = '';
                    if (data.length > 0) {
                        data.forEach(item => {
                            const div = document.createElement('div');
                            div.textContent = item;
                            div.className = 'px-4 py-2 hover:bg-gray-100 cursor-pointer';
                            div.addEventListener('click', () => {
                                input.value = item;
                                suggestionsBox.classList.add('hidden');
                                // Search with the selected suggestion
                                performSearch(item);
                            });
                            suggestionsBox.appendChild(div);
                        });
                        suggestionsBox.classList.remove('hidden');
                    } else {
                        suggestionsBox.classList.add('hidden');
                    }
                })
                .catch(error => {
                    console.error('Error fetching suggestions:', error);
                });
        }, 300);
    });

    // Search on Enter key
    input.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            suggestionsBox.classList.add('hidden');
            performSearch(this.value.trim());
        }
    });

    // Hide dropdown when clicking outside
    document.addEventListener('click', function (e) {
        if (!suggestionsBox.contains(e.target) && e.target !== input) {
            suggestionsBox.classList.add('hidden');
        }
    });
});

// Function to perform search
function performSearch(query) {
    if (query) {
        loadUserData(1, query);
    }
}

// Function to setup event listeners for components
function setupEventListeners() {
    // Password Reset button event listeners
    const changePassButtons = document.querySelectorAll('.change-pass-btn');
    changePassButtons.forEach(button => {
        button.addEventListener('click', function (event) {
            event.preventDefault();

            // Get user data from data attributes
            const userData = this.dataset;

            // Populate form fields
            document.getElementById('userId1').value = userData.id;

            // Show the password reset modal
            document.getElementById('changePassModal').classList.remove('hidden');
        });
    });

    // Edit User button event listeners
    const editButtons = document.querySelectorAll('.edit-btn');
    editButtons.forEach(button => {
        button.addEventListener('click', function (event) {
            event.preventDefault();

            // Get user data from data attributes
            const userData = this.dataset;

            const userId = userData.id;
            fetch(`/admin/update?userId=${userId}`, {
                method: 'GET',
            })
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Có vấn đề khi tải dữ liệu người dùng' + response.status);
                    }
                    return response.json();
                })
                .then(data => {
                    // Set data attributes for the modal
                    document.getElementById('userId').value = data.userID;
                    document.getElementById('name').value = data.fullName;
                    document.getElementById('employeeId').value = data.userID;
                    document.getElementById('email').value = data.email;
                    // Set select elements
                    const roleSelect = document.getElementById('role');
                    for (let i = 0; i < roleSelect.options.length; i++) {
                        if (roleSelect.options[i].value === userData.role) {
                            roleSelect.selectedIndex = i;
                            break;
                        }
                    }
                    // Set select elements
                    const statusSelect = document.getElementById('status');
                    for (let i = 0; i < statusSelect.options.length; i++) {
                        if (statusSelect.options[i].value === userData.status) {
                            statusSelect.selectedIndex = i;
                            break;
                        }
                    }
                })


            // Show the modal
            document.getElementById('editUserModal').classList.remove('hidden');
        });
    });

    // Delete User button event listeners
    const deleteButtons = document.querySelectorAll('.delete-btn');
    deleteButtons.forEach(button => {
        button.addEventListener('click', function (event) {
            event.preventDefault();

            // Get user data from data attributes
            const userData = this.dataset;

            // Populate the delete confirmation modal
            document.getElementById('deleteUserId').value = userData.id;
            document.getElementById('deleteUserName').textContent = userData.id;

            // Show the delete modal
            document.getElementById('deleteUserModal').classList.remove('hidden');
        });
    });
}

// Function to close change password modal
function closeChangeModal() {
    document.getElementById('changePassModal').classList.add('hidden');
}

// Function to close edit modal
function closeEditModal() {
    document.getElementById('editUserModal').classList.add('hidden');
}

// Function to close delete modal
function closeDeleteModal() {
    document.getElementById('deleteUserModal').classList.add('hidden');
}

// Function to setup pagination event listeners
function setupPaginationListeners() {
    document.querySelectorAll('.pagination-link').forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault();
            const page = this.getAttribute('data-page');
            const search = this.getAttribute('data-search') || document.getElementById('searchInput').value.trim();
            loadUserData(page, search);
        });
    });
}

// Function to load user data via AJAX
function loadUserData(page, search) {
    // Show loading indicator
    const tableBody = document.getElementById('userTableBody');
    tableBody.innerHTML = `
                <tr>
                    <td colspan="7" class="text-center py-4">
                        <div class="flex justify-center">
                            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                        </div>
                        <p class="mt-2 text-sm text-gray-500">Đang tải dữ liệu...</p>
                    </td>
                </tr>
            `;

    fetch(`/api/users?pageNo=${page}&search=${encodeURIComponent(search || '')}`)
        .then(response => response.json())
        .then(data => {
            updateTable(data.users, data.currentPage);
            updatePagination(data.currentPage, data.totalPage, search);

            // // Đoạn này để thay đổi URl bật nếu muốn
            // const url = new URL(window.location);
            // url.searchParams.set('pageNo', page);
            // if (search) url.searchParams.set('search', search);
            // else url.searchParams.delete('search');
            // window.history.pushState({}, '', url);
        })
        .catch(error => {
            console.error('Error loading user data:', error);
            tableBody.innerHTML = `
                        <tr>
                            <td colspan="7" class="text-center py-4 text-red-500">
                                Đã xảy ra lỗi khi tải dữ liệu. Vui lòng thử lại sau.
                            </td>
                        </tr>
                    `;
        });
}

// Function to update the table with new user data
function updateTable(users, currentPage) {
    const tableBody = document.getElementById('userTableBody');
    tableBody.innerHTML = '';

    if (!users || users.length === 0) {
        tableBody.innerHTML = `
                    <tr>
                        <td colspan="7" class="text-center py-4 text-gray-500">
                            Không tìm thấy người dùng nào phù hợp với tìm kiếm.
                        </td>
                    </tr>
                `;
        return;
    }

    users.forEach((user, index) => {
        const row = document.createElement('tr');

        // STT column
        const sttCell = document.createElement('td');
        sttCell.className = 'py-3 px-4 border-b';
        sttCell.textContent = index + 1 + ((currentPage - 1) * 10);
        row.appendChild(sttCell);

        // Name column
        const nameCell = document.createElement('td');
        nameCell.className = 'py-3 px-4 border-b';
        nameCell.textContent = user.fullName;
        row.appendChild(nameCell);

        // User ID column
        const userIdCell = document.createElement('td');
        userIdCell.className = 'py-3 px-4 border-b';
        userIdCell.textContent = user.userID;
        row.appendChild(userIdCell);

        // Email column
        const emailCell = document.createElement('td');
        emailCell.className = 'py-3 px-4 border-b';
        emailCell.textContent = user.email;
        row.appendChild(emailCell);

        // Role column
        const roleCell = document.createElement('td');
        roleCell.className = 'py-3 px-4 border-b';
        roleCell.textContent = user.role.roleName;
        row.appendChild(roleCell);

        // Status column
        const statusCell = document.createElement('td');
        statusCell.className = 'py-3 px-4 border-b';

        const statusSpan = document.createElement('span');
        if (user.status === 'ACTIVE') {
            statusSpan.className = 'bg-green-100 text-green-800 px-2 py-1 rounded-full';
            statusSpan.textContent = 'Active';
        } else {
            statusSpan.className = 'bg-gray-200 text-gray-800 px-2 py-1 rounded-full';
            statusSpan.textContent = 'Inactive';
        }
        statusCell.appendChild(statusSpan);
        row.appendChild(statusCell);

        // Actions column
        const actionsCell = document.createElement('td');
        actionsCell.className = 'py-3 px-4 border-b';

        // Reset password link
        const resetPasswordLink = document.createElement('a');
        resetPasswordLink.href = '#';
        resetPasswordLink.className = 'text-blue-500 mr-2 change-pass-btn';
        resetPasswordLink.textContent = 'Đặt lại mật khẩu';
        resetPasswordLink.dataset.id = user.userID;
        resetPasswordLink.dataset.name = user.fullName;
        actionsCell.appendChild(resetPasswordLink);

        // Edit link
        const editLink = document.createElement('a');
        editLink.href = '#';
        editLink.className = 'text-blue-500 mr-2 edit-btn';
        editLink.textContent = 'Chỉnh sửa';
        editLink.dataset.id = user.userID;
        editLink.dataset.name = user.fullName;
        editLink.dataset.email = user.email;
        editLink.dataset.role = user.role.roleName;
        editLink.dataset.status = user.status;
        actionsCell.appendChild(editLink);

        // Delete link
        const deleteLink = document.createElement('a');
        deleteLink.href = '#';
        deleteLink.className = 'text-red-500 delete-btn';
        deleteLink.textContent = 'Xóa';
        deleteLink.dataset.id = user.userID;
        deleteLink.dataset.name = user.fullName;
        actionsCell.appendChild(deleteLink);

        row.appendChild(actionsCell);
        tableBody.appendChild(row);
    });

    // Reattach event listeners to the newly created elements
    setupEventListeners();
}

// Function to update pagination
function updatePagination(currentPage, totalPage, search) {
    const paginationContainer = document.getElementById('paginationContainer');
    if (totalPage < 1) {
        paginationContainer.innerHTML = '';
        return;
    }

    let paginationHTML = '<ul class="pagination pagination-sm no-margin float-end square-pagination flex justify-end space-x-1">';

    // Previous button
    paginationHTML += '<li class="page-item">';
    if (currentPage > 1) {
        paginationHTML += `<a class="page-link py-2 px-3 border border-gray-300 rounded pagination-link"
                                    href="javascript:void(0)" data-page="${currentPage - 1}" data-search="${search || ''}">«</a>`;
    } else {
        paginationHTML += '<span class="page-link py-2 px-3 border border-gray-300 rounded text-gray-400 cursor-not-allowed">«</span>';
    }
    paginationHTML += '</li>';

    // Page numbers
    if (totalPage > 1) {
        for (let i = 1; i <= totalPage; i++) {
            const isActive = i === parseInt(currentPage);

            paginationHTML += '<li class="page-item ' + (isActive ? 'active' : '') + '">';
            paginationHTML += `<a class="page-link py-2 px-3 border border-gray-300 rounded pagination-link ${isActive ? 'bg-blue-100' : ''}"
                                       href="javascript:void(0)" data-page="${i}" data-search="${search || ''}">${i}</a>`;
            paginationHTML += '</li>';
        }
    }

    // Next buttona
    paginationHTML += '<li class="page-item">';
    if (currentPage < totalPage) {
        paginationHTML += `<a class="page-link py-2 px-3 border border-gray-300 rounded pagination-link"
                                    href="javascript:void(0)" data-page="${currentPage + 1}" data-search="${search || ''}">»</a>`;
    } else {
        paginationHTML += '<span class="page-link py-2 px-3 border border-gray-300 rounded text-gray-400 cursor-not-allowed">»</span>';
    }
    paginationHTML += '</li>';

    paginationHTML += '</ul>';

    paginationContainer.innerHTML = paginationHTML;
    setupPaginationListeners();
}

// submit form delete không cần load trang
document.getElementById("deleteUserForm").addEventListener("submit", function (event) {
    event.preventDefault();

    const userId = document.getElementById("deleteUserId").value;

    //Đổi button thành loading
    const submitButton = document.getElementById("deleteUserButton");
    const copyDeleteButton = submitButton.innerHTML;
    submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang xóa...';
    submitButton.disabled = true;

    fetch(`/delete?userId=${userId}`, {
        method: 'POST',
    })
        .then(Response => {
            if (!Response.ok) {
                throw new Error('Có vấn đề khi xóa người dùng' + Response.status);
            }
        })
        .then(data => {
            closeDeleteModal();

            // Cập nhật danh sách người dùng
            const deleteRow = document.querySelector(`tr[data-id="${userId}"]`);
            if (deleteRow) {
                console.log("Xóa người dùng thành công" + userId);
                deleteRow.remove();
            }
        })
        .catch(error => {
            console.error('Lỗi:', error);
            alert('Có lỗi xảy ra khi xóa người dùng.');
        })
        .finally(() => {
            // Khôi phục nút submit
            submitButton.innerHTML = copyDeleteButton;
            submitButton.disabled = false;
        });
});

//submit form edit không cần load trang
document.getElementById("editUserForm").addEventListener("submit", function (event) {
    event.preventDefault(); // Ngăn chặn submit mặc định

    // Lấy dữ liệu từ các input
    const userId = document.getElementById('userId').value;
    const userName = document.getElementById('name').value;
    const userEmail = document.getElementById('email').value;
    const employeeId = document.getElementById('employeeId').value;
    const userRole = document.getElementById('role').value;
    const userStatus = document.getElementById('status').value;

    // Validate dữ liệu nếu cần (bạn có thể thêm)

    // Tạo form data
    const formData = new URLSearchParams();
    formData.append('userId', userId);
    formData.append('name', userName);
    formData.append('email', userEmail);
    formData.append('employeeId', employeeId);
    formData.append('role', userRole);
    formData.append('status', userStatus);

    // Hiện loading trên nút
    const submitButton = document.getElementById("editUserButton");
    const originalButtonText = submitButton.innerHTML;
    submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang lưu...';
    submitButton.disabled = true;

    // Gửi request
    fetch('/update', {
        method: 'POST', // Fix lỗi bạn ghi nhầm "mothod" → "method"
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Server trả về lỗi: ' + response.status);
            }
            console.log("console 1");
            return response.json();
        })
        .then(data => {
            console.log("console 2");
            if (data.success) {
                // Cập nhật thành công
                showNotification('Cập nhật thành công', data.message, 'success');
                updateUserRow(userId, userName, userEmail, userRole, userStatus);
            } else {
                showNotification('Cập nhật thất bại', data.message, 'error');
            }
        })
        .catch(error => {
            console.error('Lỗi cập nhật user:', error);
            showNotification('Lỗi', 'Có lỗi xảy ra khi cập nhật người dùng. Vui lòng thử lại.', 'error');
        })
        .finally(() => {
            // Khôi phục lại button
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


// Hàm cập nhật hàng trong bảng
function updateUserRow(userID, userName, userEmail, userRole, userStatus) {
    // Tìm hàng theo userID
    const rows = document.querySelectorAll('#userTableBody tr');
    rows.forEach(row => {
        const currentUserID = row.getAttribute('data-id');  // Lấy userID của hàng
        if (currentUserID === userID) {
            // Cập nhật tên người dùng
            row.querySelector('td:nth-child(2)').textContent = userName;

            // Cập nhật mã nhân sự
            row.querySelector('td:nth-child(3)').textContent = userID;

            // Cập nhật email
            row.querySelector('td:nth-child(4)').textContent = userEmail;

            // Cập nhật quyền
            row.querySelector('td:nth-child(5)').textContent = userRole;

            // Cập nhật trạng thái
            const statusSpan = row.querySelector('td:nth-child(6) span');
            if (userStatus === 'ACTIVE') {
                statusSpan.textContent = 'Active';
                statusSpan.className = 'bg-green-100 text-green-800 px-2 py-1 rounded-full';
            } else {
                statusSpan.textContent = 'Inactive';
                statusSpan.className = 'bg-gray-200 text-gray-800 px-2 py-1 rounded-full';
            }
        }
    });
}

//submit form change password không cần load trang
document.getElementById("changePassForm").addEventListener("submit", function (event) {
    event.preventDefault();

    const userId = document.getElementById("userId1").value;

    //Đổi button thành loading
    const submitButton = document.getElementById("changePassButton");
    const copyChangePassButton = submitButton.innerHTML;
    submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang đổi mật khẩu...';
    submitButton.disabled = true;

    const formData = new URLSearchParams();
    // formData.append('userId', userId);
    formData.append('currentPassword', document.getElementById("currentPassword").value);
    formData.append('newPassword', document.getElementById("newPassword").value);
    formData.append('confirmPassword', document.getElementById("confirmPassword").value);
    fetch(`/changePassword?userId=${userId}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Có vấn đề khi đổi mật khẩu' + response.status);
            }
            return response.json();
        })
        .then(data => {
            if (data.success) {
                console.log("console 2");
                closeChangeModal();
                showNotification('Đổi mật khẩu thành công', 'Mật khẩu đã được đổi thành công.', 'success');
            }
        // Reset các input fields
            document.getElementById("currentPassword").value = '';
            document.getElementById("newPassword").value = '';
            document.getElementById("confirmPassword").value = '';
        })
        .catch(error => {
            console.error('Lỗi:', error);
            showNotification('Có lỗi xảy ra khi đổi mật khẩu.', 'Vui lòng thử lại.', 'error');
        })
        .finally(() => {
            // Khôi phục nút submit
            submitButton.innerHTML = copyChangePassButton;
            submitButton.disabled = false;
        });
});
