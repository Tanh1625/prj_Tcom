package com.HE181864.mvc.controller.admin;

import com.HE181864.mvc.model.Answer;
import com.HE181864.mvc.model.Question;
import com.HE181864.mvc.service.AnswerService;
import com.HE181864.mvc.service.QuestionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import javax.servlet.http.HttpServletRequest;
import java.util.List;

@Controller
public class Questioncontroller {
    @Autowired
    private QuestionService questionService;

    @Autowired
    private AnswerService answerService;


    @GetMapping("/admin/question")
    public String question(HttpServletRequest request,
                           Model model,
                           @ModelAttribute("search") String search) {
        List<String> questionTypes = questionService.getTypeQues();
        model.addAttribute("questionTypes", questionTypes);
        return "admin/ManageQues";
    }

    @GetMapping("/admin/questionList/{key}")
    public String questionList(HttpServletRequest request,
                                Model model,
                                @PathVariable int key,
                                @RequestParam(value = "pageNo", defaultValue = "1") int pageNo,
                                @ModelAttribute("search") String search) {

        Authentication authen = SecurityContextHolder.getContext().getAuthentication();
//        UserDetailsImpl userDetails = (UserDetailsImpl) authen.getPrincipal();
//        String userId = userDetails.getUsername();
        String email = authen.getName();
        model.addAttribute("userId", email);


        Page<Question> questionList = questionService.getQuesbyType(pageNo, key);
        model.addAttribute("questionTypes", key);
        model.addAttribute("currentPage", pageNo);
        model.addAttribute("totalPage", questionList.getTotalPages());
        model.addAttribute("questionList", questionList);
        return "admin/quesList";
    }

    @PostMapping("/admin/deleteQues")
    public String deleteQues(HttpServletRequest request,
                             Model model,
                             RedirectAttributes redirectAttributes,
                             @RequestParam("quesId") int quesId
                             ) {
        Question ques = questionService.getQuesById(quesId);
        String link = "redirect:/admin/questionList/" + ques.getQuestionType();
        if(ques == null) {
            redirectAttributes.addFlashAttribute("message", "Câu hỏi không tồn tại");
            return link;
        }
        questionService.deleteQues(quesId);
        redirectAttributes.addFlashAttribute("message", "Xóa câu hỏi thành công");
        return link;
    }

    @PostMapping("/admin/addQues")
    public String addQues(HttpServletRequest request,
                          Model model,
                          RedirectAttributes redirectAttributes,
                            @RequestParam("quesContent") String quesContent,
                            @RequestParam("quesType") int quesType) {
        String link = "redirect:/admin/questionList/" + quesType;
        if(quesContent == null) {
            redirectAttributes.addFlashAttribute("message", "Câu hỏi không tồn tại");
            return link;
        }

        Authentication authen = SecurityContextHolder.getContext().getAuthentication();
        String email = authen.getName();

        questionService.addQues(quesContent, quesType, email);
        redirectAttributes.addFlashAttribute("message", "Thêm câu hỏi thành công");
        return link;
    }

    @GetMapping("/api/questions/{id}")
    public ResponseEntity<List<Answer>> getAnswersByQuestionId(@PathVariable int id) {
        List<Answer> answers = answerService.getAnswersByQuestionId(id);
        if (answers.isEmpty()) {
            System.err.println("Answer not found");
            return ResponseEntity.notFound().build();
        }
        System.err.println("Answer found and size:" + answers);
        return ResponseEntity.ok(answers);
    }

}
