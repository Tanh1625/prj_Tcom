const submitForm = document.getElementById("submitForm");
submitForm.addEventListener("submit", function(event){
    event.preventDefault();
   const token = document.getElementById("token").value;
    const password = document.getElementById("newPassword").value;
    const confirmPassword = document.getElementById("confirmPassword").value;
    if(token && password && confirmPassword){
        if(password !== confirmPassword){
            const errorMessage = document.getElementById("message");
            errorMessage.textContent = "*Mật khẩu không khớp!";
            console.log("Mật khẩu không khớp!");
        }else{

            fetch(`/auth/resetPassword?token=${encodeURIComponent(token)}&newPassword=${encodeURIComponent(password)}`, {
                method: 'POST',
            })
                .then(response =>{
                    if(!response.ok){
                        const text = response.text();
                        console.error("Lỗi từ server:", response.status, text);
                    }
                    return response.json();
                })
                .then(data => {
                    if(data.success){
                        const container = document.getElementById("container");
                        container.innerHTML = '';
                        container.innerHTML =
                            '<h2 class="text-center text-lg font-medium mb-4" style="color: rgb(249, 162, 0);">Đặt lại mật khẩu thành công!</h2>\n';
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
    }
});