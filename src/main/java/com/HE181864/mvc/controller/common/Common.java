package com.HE181864.mvc.controller.common;

import com.HE181864.mvc.model.User;
import com.HE181864.mvc.service.EmailService;
import com.HE181864.mvc.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Controller

public class Common {
    @Autowired
    private UserService userService;
    @Autowired
    private EmailService emailService;


    @GetMapping({"/user/profile", "/admin/profile"})
    public String profile() {
        return "common/Profile";
    }

    @GetMapping("/api/profile")
    public ResponseEntity<Map<String, Object>> getProfile() {
        Map<String, Object> response = new HashMap<>();
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        User user = userService.getUserByEmail(email);
        if (user == null) {
            response.put("messageErr", "Không tìm thấy thông tin người dùng!");
            return ResponseEntity.badRequest().body(response);
        }
        response.put("user", user);
        response.put("message", "Lấy thông tin người dùng thành công!");
        return ResponseEntity.ok(response);
    }

    @PostMapping("/auth/sendEmailResetPassword")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> resetPassword(@RequestParam("email") String email) {
        Map<String, Object> response = new HashMap<>();
        try {
            if(!userService.isExitEmail(email)) {
                response.put("success", false);
                response.put("message", "Email không tồn tại trong hệ thống!");
                System.err.println("Không tìm thấy thông tin người dùng!");

                return ResponseEntity.ok(response);
            }
            String token = UUID.randomUUID().toString();
            userService.updateToken(email, token);
            String linkChange = "http://localhost:8080/auth/resetPassword?token=" + token;
            emailService.sendHtmlEmail(email, linkChange);
            response.put("success", true);
            response.put("message", "Gửi mã thành công. Hãy kiểm tra email!");
            System.err.println("Gửi mã thành công. Hãy kiểm tra email!");
        }catch (Exception e){
            System.err.println("lỗi khi gửi email:" + e.getMessage());
            response.put("success", false);
            response.put("message", "Gửi mã thất bại.");
            System.err.println("Gửi mã thất bại.");
        }

        return ResponseEntity.ok(response);
    }


    @GetMapping("/auth/resetPassword")
    public String resetPasswordForm(@RequestParam("token") String token, Model model) {
        model.addAttribute("token", token);
        try{
            User user = userService.getUserByResetPasswordToken(token);
            if (user == null) {
                model.addAttribute("success", false);
                model.addAttribute("message", "Token không hợp lệ.");
                System.err.println("Token không hợp lệ.");
                return "ResetPassword";
            }
            model.addAttribute("user", user);
            model.addAttribute("success", true);
            model.addAttribute("message", "Token hợp lệ.");
            System.out.println("Token hợp lệ.");
        }catch(Exception e){
            System.err.println("lỗi khi lấy thông tin người dùng: " + e.getMessage());
        }
        return "ResetPassword";
    }

    @PostMapping("/auth/resetPassword")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> resetPass(@RequestParam("token") String token,
                                                         @RequestParam("newPassword") String newPassword) {
        Map<String, Object> response = new HashMap<>();
        try{
            User user = userService.getUserByResetPasswordToken(token);
            if (user == null) {
                response.put("success", false);
                response.put("message", "Token không hợp lệ.");
                System.err.println("Token không hợp lệ.");
                return ResponseEntity.ok(response);
            }
            userService.changePassword(user, newPassword);
            response.put("success", true);
            response.put("message", "Đổi mật khẩu thành công.");
            System.out.println("Token hợp lệ.");
        }catch(Exception e){
            System.err.println("lỗi khi lấy thông tin người dùng: " + e.getMessage());
            response.put("success", false);
            response.put("message", "Đổi mật khẩu thất bại.");
            return ResponseEntity.ok(response);
        }


        return ResponseEntity.ok(response);
    }

}
