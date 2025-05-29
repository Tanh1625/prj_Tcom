document.addEventListener("DOMContentLoaded", () => {
   loadData();
});

async function loadData() {
    try{
        const response = await fetch("/api/profile", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        });
        if (!response.ok) {
            const errorData = await response.json();
            console.error("Error loading data:", errorData);
            showNotification("Lỗi", errorData.messageErr, "error");
        }else{
            const data = await response.json();
            renderProfile(data);
            console.log(data.message);
        }
    }catch (e) {
        console.error("Error loading data:", e);
        showNotification("Lỗi", "Lỗi ở ngoài Catch", "error");
    }
}

function renderProfile(data) {
    const profileContainer = document.getElementById("profileContainer");
    profileContainer.innerHTML = ""; // Clear previous data
    profileContainer.innerHTML = `
                <h2 class="text-2xl font-bold">${data.user.fullName}</h2>
                <p class="text-sm text-gray-600 mt-1">${data.user.role.roleName}</p>
                <p class="text-sm text-gray-600 mt-1">${data.user.email}</p>
                <div class="mt-3 flex flex-wrap justify-center md:justify-start gap-2">
                    <span class="bg-${data.user.status == 'ACTIVE'? 'green':'gray'}-100 text-green-800 px-2 py-1 rounded-full text-xs">
                        ${data.user.status == 'ACTIVE' ? 'Active' : 'Inactive'}
                    </span>
                    <span class="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                        ${data.user.userID}
                    </span>
                </div>
    `;

    const profileContainer2 = document.getElementById("fullInfoContainer");
    profileContainer2.innerHTML = ""; // Clear previous data
    profileContainer2.innerHTML = `
                <div class="bg-gray-50 p-4 rounded-lg">
                    <h4 class="text-sm font-medium text-gray-500 mb-1">Họ và tên</h4>
                    <p class="text-gray-800">${data.user.fullName}</p>
                </div>

                <div class="bg-gray-50 p-4 rounded-lg">
                    <h4 class="text-sm font-medium text-gray-500 mb-1">Mã nhân sự</h4>
                    <p class="text-gray-800">${data.user.userID}</p>
                </div>

                <div class="bg-gray-50 p-4 rounded-lg">
                    <h4 class="text-sm font-medium text-gray-500 mb-1">Email</h4>
                    <p class="text-gray-800">${data.user.email}</p>
                </div>
    `;

    const accountInfo = document.getElementById("accountInfo");
    accountInfo.innerHTML = ""; // Clear previous data
    accountInfo.innerHTML = `
        <h3 class="text-lg font-medium mb-4">Thông tin tài khoản</h3>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div class="bg-gray-50 p-4 rounded-lg">
                    <h4 class="text-sm font-medium text-gray-500 mb-1">Quyền hạn</h4>
                    <p class="text-gray-800">${data.user.role.roleName}</p>
                </div>

                <div class="bg-gray-50 p-4 rounded-lg">
                    <h4 class="text-sm font-medium text-gray-500 mb-1">Trạng thái</h4>
                    <div>
                        <span class="bg-${data.user.status == 'ACTIVE'? 'green':'gray'}-100 text-green-800 px-2 py-1 rounded-full text-xs">
                        ${data.user.status == 'ACTIVE' ? 'Active' : 'Inactive'}
                        </span>
                    </div>
                </div>

            </div>
        </div>
    `;
}