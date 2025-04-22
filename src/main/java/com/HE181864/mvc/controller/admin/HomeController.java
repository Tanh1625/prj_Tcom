package com.HE181864.mvc.controller.admin;

import com.HE181864.mvc.model.User;
import com.HE181864.mvc.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import javax.servlet.http.HttpServletRequest;

@Controller
public class HomeController {
    @Autowired
    private UserService userService;

    @GetMapping("/admin/home")
    public String home(Model model,
                       @RequestParam(name = "pageNo", defaultValue = "1") int pageNo,
                       @ModelAttribute("search") String search,
                       HttpServletRequest request) {

        Page<User> userList;

        if (search != null && !search.isEmpty()) {
            userList = userService.getUsersByName(pageNo, search);
            model.addAttribute("search", search);
        } else {
            userList = userService.getUsersByStatus(pageNo);
        }

        model.addAttribute("userList", userList);
        model.addAttribute("totalPage", userList.getTotalPages());
        model.addAttribute("currentPage", pageNo);
        return "Home";
    }

    @PostMapping("/admin/home/search")
    public String search(@RequestParam("search") String search,
                         RedirectAttributes redirectAttributes) {
        redirectAttributes.addFlashAttribute("search", search);
        return "redirect:/admin/home";
    }
}

