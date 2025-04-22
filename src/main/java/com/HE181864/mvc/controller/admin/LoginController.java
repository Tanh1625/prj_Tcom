package com.HE181864.mvc.controller.admin;

import com.HE181864.mvc.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class LoginController {
    @Autowired
    private UserService userService;


    @GetMapping(value = {"/", "/login"})
    public String login() {
        return "login";
    }



    @GetMapping("/forgot")
    public String forgot() {
        return "Forgot";
    }
}
