package com.HE181864.mvc.controller.admin;

import com.HE181864.mvc.model.Logtracking;
import com.HE181864.mvc.model.User;
import com.HE181864.mvc.service.LogTrackingService;
import com.HE181864.mvc.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import javax.servlet.http.HttpServletRequest;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Controller
public class AccountController {

    @Autowired
    private UserService userService;

    @Autowired
    private LogTrackingService logTrackingService;

    @GetMapping("/admin/update")
    @ResponseBody
    public ResponseEntity<User> updateAccount(HttpServletRequest request,
                                 Model model,
                                 @RequestParam String userId) {
        User user = userService.getUser(userId);
        if (user == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(user);
    }

    @PostMapping("/update")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> updateAccount(
            @RequestParam String userId,
            @RequestParam String name,
            @RequestParam String email,
            @RequestParam String employeeId,
            @RequestParam String role,
            @RequestParam String status
    ) {
        Map<String, Object> response = new HashMap<>();

        User user = userService.getUser(userId);
        if (user == null) {
            response.put("success", false);
            response.put("message", "Người dùng không tồn tại");
            return ResponseEntity.badRequest().body(response);
        }

        if (name != null && !name.isEmpty() && email != null && !email.isEmpty() && employeeId != null && !employeeId.isEmpty()) {
            if (userService.isExitEmail(email) && !user.getEmail().equals(email)) {
                response.put("success", false);
                response.put("message", "Email đã tồn tại");
                return ResponseEntity.badRequest().body(response);
            }
            userService.updateUser(userId, name, email, employeeId, role, status);
            response.put("success", true);
            response.put("message", "Cập nhật thành công");

            // logTracking
            Authentication authen = SecurityContextHolder.getContext().getAuthentication();
            String emailCur = authen.getName();
            User userCur = userService.getUserByEmail(emailCur);
            Logtracking logTracking = new Logtracking();
            logTracking.setUser(userCur);
            logTracking.setContent("Cập nhật thông tin tài khoản: " + user.getFullName());
            logTracking.setTime(LocalDateTime.now());
            logTrackingService.saveLog(logTracking);

            return ResponseEntity.ok(response);
        } else {
            response.put("success", false);
            response.put("message", "Vui lòng điền đầy đủ thông tin");
            return ResponseEntity.badRequest().body(response);
        }
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
    @ResponseBody
    public ResponseEntity<Map<String, Object>> changePassword(
            @RequestParam String userId,
            @RequestParam String currentPassword,
            @RequestParam String newPassword,
            @RequestParam String confirmPassword
    ) {
        Map<String, Object> response = new HashMap<>();

        if (userId == null || userId.isEmpty()) {
            response.put("success", false);
            response.put("message", "Thiếu userId");
            return ResponseEntity.ok(response);
        }

        if (currentPassword == null || currentPassword.isEmpty()) {
            response.put("success", false);
            response.put("message", "Vui lòng nhập mật khẩu hiện tại");
            return ResponseEntity.ok(response);
        }

        if (!userService.checkCurrentPassword(userId, currentPassword)) {
            response.put("success", false);
            response.put("message", "Mật khẩu hiện tại không đúng");
            return ResponseEntity.ok(response);
        }

        if (newPassword == null || newPassword.isEmpty() || confirmPassword == null || confirmPassword.isEmpty()) {
            response.put("success", false);
            response.put("message", "Vui lòng nhập mật khẩu mới và xác nhận mật khẩu");
            return ResponseEntity.ok(response);
        }

        if (!newPassword.equals(confirmPassword)) {
            response.put("success", false);
            response.put("message", "Mật khẩu mới và mật khẩu xác nhận không khớp");
            return ResponseEntity.ok(response);
        }
        if (!isStrongPassword(newPassword)) {
            response.put("success", false);
            response.put("message", "Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt");
            return ResponseEntity.ok(response);
        }

        // Cập nhật mật khẩu
        userService.resetPassword(userId, newPassword);
        response.put("success", true);
        response.put("message", "Đổi mật khẩu thành công");

        // Ghi logTracking
        Authentication authen = SecurityContextHolder.getContext().getAuthentication();
        String emailCur = authen.getName();
        User userCur = userService.getUserByEmail(emailCur);
        User userReset = userService.getUser(userId);
        Logtracking logTracking = new Logtracking();
        logTracking.setUser(userCur);
        logTracking.setContent("Đổi mật khẩu cho tài khoản: " + (userReset != null ? userReset.getFullName() : "Unknown User"));
        logTracking.setTime(LocalDateTime.now());
        logTrackingService.saveLog(logTracking);

        return ResponseEntity.ok(response);
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
    // Thêm vào AccountController.java
    private boolean isStrongPassword(String password) {
        // Ít nhất 8 ký tự, có chữ hoa, chữ thường, số và ký tự đặc biệt
        String regex = "^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=])(?=\\S+$).{8,}$";
        return password.matches(regex);
    }



}
