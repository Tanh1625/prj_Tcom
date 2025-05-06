package com.HE181864.mvc.controller.user;

import com.HE181864.mvc.model.ExamHistory;
import com.HE181864.mvc.model.User;
import com.HE181864.mvc.service.ExamHistoryService;
import com.HE181864.mvc.service.QuestionService;
import com.HE181864.mvc.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;

import javax.servlet.http.HttpServletRequest;
import javax.transaction.Transactional;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Controller
@RequestMapping("/user")
public class Home {

    @Autowired
    private QuestionService questionService;
    @Autowired
    private UserService userService;
    @Autowired
    private ExamHistoryService examHistoryService;

    @GetMapping("/home")
    public String home(Model model) {
//        Authentication authen = SecurityContextHolder.getContext().getAuthentication();
//        String emailCur = authen.getName();
//        User userCur = userService.getUserByEmail(emailCur);
//
//        List<ExamHistory> examHistoryList = examHistoryService.getExamHistoryByUserId(userCur);
//        model.addAttribute("examHistoryList", examHistoryList);


        return "user/UserHome";
    }


    @GetMapping("/home1")
    @Transactional
    public ResponseEntity<Map<String, Object>> home1(Model model,
                                     @RequestParam(value = "pageNo", defaultValue = "1") int page){
        Map<String, Object> response = new HashMap<>();
        Authentication authen = SecurityContextHolder.getContext().getAuthentication();
        String emailCur = authen.getName();
        User userCur = userService.getUserByEmail(emailCur);

        Page<ExamHistory> examHistoryList = examHistoryService.getExamHistoryPagination(userCur, page, 5);
        model.addAttribute("examHistoryList", examHistoryList);

        if(examHistoryList.isEmpty()) {
            response.put("messageErr", "Không tìm thấy bải kiểm tra");
            return ResponseEntity.badRequest().body(response);
        }else{
            response.put("examHistoryList", examHistoryList);
            response.put("currentPage", page);
            response.put("totalPages", examHistoryList.getTotalPages());
            response.put("totalItems", examHistoryList.getTotalElements());
        }

        return ResponseEntity.ok(response);
    }


    @GetMapping("/examList")
    public String question(HttpServletRequest request,
                           Model model,
                           @ModelAttribute("search") String search) {
        List<String> questionTypes = questionService.getTypeQues();
        model.addAttribute("questionTypes", questionTypes);
        return "user/ExamList";
    }
}
