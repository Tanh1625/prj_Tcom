package com.HE181864.mvc.controller.admin;

import com.HE181864.mvc.model.Logtracking;
import com.HE181864.mvc.model.User;
import com.HE181864.mvc.service.LogTrackingService;
import com.HE181864.mvc.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

import javax.servlet.http.HttpServletRequest;
import java.util.HashMap;
import java.util.Map;

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


    @GetMapping("/admin/logtracking1")
    public ResponseEntity<Map<String, Object>> logTracking1(HttpServletRequest request,
                                            Model model,
                                            @RequestParam(name = "pageNo", defaultValue = "1") int page) {
        Map<String, Object> response = new HashMap<>();
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        User userCur = userService.getUserByEmail(email);
        Page<Logtracking> logTrackingList = logTrackingService.getLogTrackingByUser(userCur, page);

        if(logTrackingList.isEmpty()) {
            response.put("messageErr", "Không tìm thấy lịch sử cá nhân");
            return ResponseEntity.badRequest().body(response);
        }else{
            response.put("logTrackingList", logTrackingList);
            response.put("totalPage", logTrackingList.getTotalPages());
            response.put("currentPage", page);
        }

        return ResponseEntity.ok(response);
    }
}
