package com.HE181864.mvc.controller.user;

import com.HE181864.mvc.service.QuestionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.RequestMapping;

import javax.servlet.http.HttpServletRequest;
import java.util.List;

@Controller
@RequestMapping("/user")
public class Home {

    @Autowired
    private QuestionService questionService;

    @GetMapping("/home")
    public String home() {
        return "user/UserHome";
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
