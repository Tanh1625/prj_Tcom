package com.HE181864.mvc.controller.admin;

import com.HE181864.mvc.model.Logtracking;
import com.HE181864.mvc.model.User;
import com.HE181864.mvc.service.LogTrackingService;
import com.HE181864.mvc.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import javax.servlet.http.HttpServletRequest;
import java.time.LocalDateTime;

@Controller
public class AccountController {

    @Autowired
    private UserService userService;

    @Autowired
    private LogTrackingService logTrackingService;

    @PostMapping("/update")
    public String updateAccount(HttpServletRequest request,
                                Model model,
                                RedirectAttributes redirectAttributes,
                                @RequestParam String userId,
                                @RequestParam String name,
                                @RequestParam String email,
                                @RequestParam String employeeId,
                                @RequestParam String role,
                                @RequestParam String status
                                    ) {
        User user = userService.getUser(userId);
        redirectAttributes.addFlashAttribute("userId", userId);
        redirectAttributes.addFlashAttribute("name", name);
        redirectAttributes.addFlashAttribute("email", email);
        redirectAttributes.addFlashAttribute("employeeId", employeeId);
        redirectAttributes.addFlashAttribute("role", role);
        redirectAttributes.addFlashAttribute("status", status);

        if (user == null) {
            redirectAttributes.addFlashAttribute("errorUpdate", "Người dùng không tồn tại");
            return "redirect:/admin/home";
        }

        if(name != null && !name.isEmpty() && email != null && !email.isEmpty() && employeeId != null && !employeeId.isEmpty()) {
            if (userService.isExitEmail(email) && !user.getEmail().equals(email)) {
                redirectAttributes.addFlashAttribute("errorUpdate", "Thay đổi thất bại do email đã tồn tại");
                return "redirect:/admin/home";
            }
                userService.updateUser(userId, name, email, employeeId, role, status);
                redirectAttributes.addFlashAttribute("success", "Thay đổi thành công");
        }else{
            redirectAttributes.addFlashAttribute("errorUpdate", "Vui lòng điền đầy đủ thông tin");
            return "redirect:/admin/home";
        }

        //logTracking
        Authentication authen = SecurityContextHolder.getContext().getAuthentication();
        String emailCur = authen.getName();
        User userCur = userService.getUserByEmail(emailCur);
        Logtracking logTracking = new Logtracking();
        logTracking.setUser(userCur);
        logTracking.setContent("Cập nhật thông tin tài khoản: " + user.getFullName());
        logTracking.setTime(LocalDateTime.now());
        logTrackingService.saveLog(logTracking);


        return "redirect:/admin/home";
    }

    @PostMapping("/delete")
    public String deleteAccount(HttpServletRequest request,
                                 Model model,
                                 RedirectAttributes redirectAttributes,
                                 @RequestParam String userId) {
        if(userId != null && !userId.isEmpty()) {
            userService.deleteUser(userId);
            redirectAttributes.addFlashAttribute("success", "Đã xóa tài khoản thành công");

            // logTracking
            User userToDelete = userService.getUser(userId);
            Authentication authen = SecurityContextHolder.getContext().getAuthentication();
            String emailCur = authen.getName();
            User userCur = userService.getUserByEmail(emailCur);
            Logtracking logTracking = new Logtracking();
            logTracking.setUser(userCur);
            logTracking.setContent("Xóa tài khoản: " + (userToDelete != null ? userToDelete.getFullName() : "Unknown User"));
            logTracking.setTime(LocalDateTime.now());
            logTrackingService.saveLog(logTracking);

        }
        return "redirect:/admin/home";
    }

    @PostMapping("/changePassword")
    public String resetPassword(HttpServletRequest request,
                                 Model model,
                                 RedirectAttributes redirectAttributes,
                                 @RequestParam String userId,
                                @RequestParam String currentPassword,
                                @RequestParam String newPassword,
                                @RequestParam String confirmPassword) {
        redirectAttributes.addFlashAttribute("userId", userId);
        if(userId != null && !userId.isEmpty()) {
            if(currentPassword != null && !currentPassword.isEmpty()) {
                if(!userService.checkCurrentPassword(userId, currentPassword)) {
                    redirectAttributes.addFlashAttribute("errorChangePass", "Mật khẩu hiện tại không đúng");
                    return "redirect:/admin/home";
                }
            } else {
                redirectAttributes.addFlashAttribute("errorChangePass", "Vui lòng nhập mật khẩu hiện tại");
                return "redirect:/admin/home";
            }
            if(newPassword != null && !newPassword.isEmpty() && confirmPassword != null && !confirmPassword.isEmpty()) {
                if(newPassword.equals(confirmPassword)) {
                    userService.resetPassword(userId, newPassword);
                    redirectAttributes.addFlashAttribute("success", "Đổi mật khẩu thành công");


                    // logTracking
                    Authentication authen = SecurityContextHolder.getContext().getAuthentication();
                    String emailCur = authen.getName();
                    User userCur = userService.getUserByEmail(emailCur);
                    User userReset = userService.getUser(userId);
                    Logtracking logTracking = new Logtracking();
                    logTracking.setUser(userCur);
                    logTracking.setContent("Đổi mật khẩu cho tài khoản: " + (userReset != null ? userReset.getFullName() : "Unknown User"));
                    logTracking.setTime(LocalDateTime.now());
                    logTrackingService.saveLog(logTracking);

                } else {
                    redirectAttributes.addFlashAttribute("errorChangePass", "Mật khẩu không khớp");
                }
            } else {
                redirectAttributes.addFlashAttribute("errorChangePass", "Vui lòng nhập mật khẩu mới và xác nhận mật khẩu");
            }
        }
        return "redirect:/admin/home";
    }

    @GetMapping("/admin/addUser")
    public String addUser(HttpServletRequest request,
                          Model model) {
        String fullURI = request.getRequestURI().toString();
        model.addAttribute("currentURI", fullURI);
        return "admin/AddNew";
    }

    @PostMapping("/addUser")
    public String addUserProcess(HttpServletRequest request,
                                 Model model,
                                 RedirectAttributes redirectAttributes,
                                 @RequestParam String fullName,
                                 @RequestParam String password,
                                 @RequestParam String confirmPassword,
                                 @RequestParam String email,
                                 @RequestParam String role) {
        model.addAttribute("fullName", fullName);
        model.addAttribute("email", email);
        model.addAttribute("role", role);


        // Kiểm tra null hoặc rỗng
        if (fullName == null || fullName.trim().isEmpty() ||
                password == null || password.trim().isEmpty() ||
                confirmPassword == null || confirmPassword.trim().isEmpty() ||
                email == null || email.trim().isEmpty()) {

            redirectAttributes.addFlashAttribute("errorAdd", "Vui lòng điền đầy đủ thông tin.");
            model.addAttribute("errorAdd", "Vui lòng điền đầy đủ thông tin.");
            return "admin/AddNew";
        }

        // Kiểm tra tên hợp lệ
        if (fullName.length() <= 0 || fullName.length() > 50 || !fullName.matches("^[a-zA-Z\\s]+$")) {
            redirectAttributes.addFlashAttribute("errorAdd", "Vui lòng nhập tên hợp lệ (chỉ chữ cái, 1–50 ký tự)");
            model.addAttribute("errorAdd", "Vui lòng nhập tên hợp lệ (chỉ chữ cái, 1–50 ký tự)");
            return "admin/AddNew";
        }

        // Kiểm tra email tồn tại
        if (userService.isExitEmail(email)) {
            redirectAttributes.addFlashAttribute("errorAdd", "Email đã tồn tại");
            model.addAttribute("errorAdd", "Email đã tồn tại");
            return "admin/AddNew";
        }

        // Kiểm tra độ dài mật khẩu
        if (password.length() <= 0 || password.length() > 20) {
            redirectAttributes.addFlashAttribute("errorAdd", "Mật khẩu phải từ 1-20 ký tự");
            model.addAttribute("errorAdd", "Mật khẩu phải từ 1-20 ký tự");
            return "admin/AddNew";
        }

        // Kiểm tra mật khẩu trùng khớp
        if (!password.equals(confirmPassword)) {
            redirectAttributes.addFlashAttribute("errorAdd", "Mật khẩu không khớp");
            model.addAttribute("errorAdd", "Mật khẩu không khớp");
            return "admin/AddNew";
        }

        // Nếu mọi thứ hợp lệ thì thêm user
        userService.addUser(fullName.trim(), password, email.trim(), role);
        redirectAttributes.addFlashAttribute("success", "Tạo tài khoản thành công");

        // logTracking
        Authentication authen = SecurityContextHolder.getContext().getAuthentication();
        String emailCur = authen.getName();
        User userCur = userService.getUserByEmail(emailCur);
        Logtracking logTracking = new Logtracking();
        logTracking.setUser(userCur);
        logTracking.setContent("Thêm tài khoản mới: " + fullName);
        logTracking.setTime(LocalDateTime.now());
        logTrackingService.saveLog(logTracking);

        return "redirect:/admin/home";
    }


}
