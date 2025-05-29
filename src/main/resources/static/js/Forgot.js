const submitButton = document.getElementById("submitButton");
submitButton.addEventListener("click", function (event) {
    const email = document.getElementById("email").value;
    event.preventDefault();
    if (email === "") {
        const errorMessage = document.getElementById("message");
        errorMessage.textContent = "*Email không được để trống!";
        console.log("Email không được để trống!");
    }else{
        fetch(`/auth/sendEmailResetPassword?email=${encodeURIComponent(email)}`, {
            method: 'POST',
        })
            .then(response =>{
                if(!response.ok){
                    const text = response.text();
                    console.error("Lỗi từ server:", response.status, text);
                }
                console.log("res"+response);
                return response.json();
            })
            .then(data => {
                console.log("data"+data);
                if(data.success){
                    const container = document.getElementById("container");
                    container.innerHTML = '';
                    container.innerHTML =
                        '<h2 class="text-center text-lg font-medium mb-4" style="color: rgb(249, 162, 0);">Vui lòng kiểm tra email của bạn để xác nhận đổi mật khẩukhẩu</h2>\n';
                }else{
                    const errorMessage = document.getElementById("message");
                    errorMessage.textContent = data.message;
                }
            })
            .catch(error => {
                console.error('Error:', error);
                const errorMessage = document.getElementById("message");
                errorMessage.textContent = "Có lỗi xảy ra, vui lòng thử lại sau.";
            })
    }
});