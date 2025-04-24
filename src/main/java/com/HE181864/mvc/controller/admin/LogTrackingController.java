package com.HE181864.mvc.controller.admin;

import com.HE181864.mvc.model.Logtracking;
import com.HE181864.mvc.model.User;
import com.HE181864.mvc.service.LogTrackingService;
import com.HE181864.mvc.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

import javax.servlet.http.HttpServletRequest;

@Controller
public class LogTrackingController {
    @Autowired
    private LogTrackingService logTrackingService;
    @Autowired
    private UserService userService;

    @GetMapping("/admin/logtracking")
    public String logTracking(HttpServletRequest request,
                              Model model,
                              @RequestParam(name = "page", defaultValue = "1") int page) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        User userCur = userService.getUserByEmail(email);
        Page<Logtracking> logTrackingList = logTrackingService.getLogTrackingByUser(userCur, page);

        model.addAttribute("logTrackingList", logTrackingList);
        model.addAttribute("totalPage", logTrackingList.getTotalPages());
        model.addAttribute("currentPage", page);
        return "admin/Logtracking";
    }
}
