package com.HE181864.mvc.controller.admin;

import com.HE181864.mvc.model.Answer;
import com.HE181864.mvc.model.Logtracking;
import com.HE181864.mvc.model.Question;
import com.HE181864.mvc.model.User;
import com.HE181864.mvc.service.AnswerService;
import com.HE181864.mvc.service.LogTrackingService;
import com.HE181864.mvc.service.QuestionService;
import com.HE181864.mvc.service.UserService;
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
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Controller
public class Questioncontroller {
    @Autowired
    private QuestionService questionService;

    @Autowired
    private AnswerService answerService;

    @Autowired
    private LogTrackingService logTrackingService;

    @Autowired
    private UserService userService;


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
        String email = authen.getName();
        model.addAttribute("userId", email);


        List<Question> questionList = questionService.getQuesbyType(pageNo, key);
        System.err.println(questionList.size());
        model.addAttribute("totalQues", questionList.size());
        model.addAttribute("questionTypes", key);
//        model.addAttribute("currentPage", pageNo);
//        model.addAttribute("totalPage", questionList.getTotalPages());
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


        // logTracking
        Authentication authen = SecurityContextHolder.getContext().getAuthentication();
        String emailCur = authen.getName();
        User userCur = userService.getUserByEmail(emailCur);
        Logtracking logTracking = new Logtracking();
        logTracking.setUser(userCur);
        logTracking.setContent("Xóa câu hỏi: " + ques.getQuestionContent());
        logTracking.setTime(LocalDateTime.now());
        logTrackingService.saveLog(logTracking);
        return link;
    }

    @PostMapping("/admin/addQues")
    @ResponseBody
    public Map<String, Object> addQues(HttpServletRequest request,
                                       @RequestParam("quesContent") String quesContent,
                                       @RequestParam("quesType") int quesType,
                                       @RequestParam Map<String, String> formData) {

        Map<String, Object> response = new HashMap<>();

        try {
            if(quesContent == null) {
                response.put("success", false);
                response.put("message", "Câu hỏi không tồn tại");
                return response;
            }

            Authentication authen = SecurityContextHolder.getContext().getAuthentication();
            String email = authen.getName();

            if(questionService.isExitQuestion(quesContent, quesType)) {
                response.put("success", false);
                response.put("message", "Câu hỏi đã tồn tại");
                return response;
            }

            questionService.addQues(quesContent, quesType, email);
            Question ques = questionService.getQuesByContent(quesContent, quesType);

            //Add answer
            List<Answer> answers = new ArrayList<>();
            int answerCount = 0;

            // Find the highest index of answers in the form data
            for (String key : formData.keySet()) {
                if (key.matches("newAnswers\\[\\d+\\]\\.answerContent")) {
                    int index = Integer.parseInt(key.replaceAll("\\D+", ""));
                    answerCount = Math.max(answerCount, index + 1);
                }
            }

            // Get the correct answer index
            int correctAnswerIndex = -1;
            if (formData.containsKey("newCorrectAnswerIndex")) {
                correctAnswerIndex = Integer.parseInt(formData.get("newCorrectAnswerIndex"));
            }

            // Create answer objects
            for (int i = 0; i < answerCount; i++) {
                String answerContent = formData.get("newAnswers[" + i + "].answerContent");
                if (answerContent != null && !answerContent.trim().isEmpty()) {
                    Answer answer = new Answer();
                    answer.setAnswerContent(answerContent);
                    answer.setCorrect(i == correctAnswerIndex);
                    answer.setScore(1);
                    answer.setQuestion(ques);
                    answers.add(answer);
                }
            }

            // Save answers to the database
            for (Answer answer : answers) {
                answerService.addAnswer(answer);
            }

            // logTracking
            String emailCur = authen.getName();
            User userCur = userService.getUserByEmail(emailCur);
            Logtracking logTracking = new Logtracking();
            logTracking.setUser(userCur);
            logTracking.setContent("Thêm câu hỏi: " + quesContent);
            logTracking.setTime(LocalDateTime.now());
            logTrackingService.saveLog(logTracking);

            // Chuẩn bị response thành công
            Map<String, Object> questionData = new HashMap<>();
            questionData.put("questionId", ques.getQuestionId());
            questionData.put("questionContent", ques.getQuestionContent());
            questionData.put("questionType", ques.getQuestionType());

            response.put("success", true);
            response.put("message", "Thêm câu hỏi thành công");
            response.put("question", questionData);

        } catch (Exception e) {
            // Xử lý lỗi
            response.put("success", false);
            response.put("message", "Lỗi: " + e.getMessage());
        }

        return response;
    }

    @GetMapping("/api/questions/{id}")
    public ResponseEntity<List<Answer>> getAnswersByQuestionId(@PathVariable int id) {
        List<Answer> answers = answerService.getAnswersByQuestionId(id);
        if (answers.isEmpty()) {
            System.err.println("Answer not found");
            return ResponseEntity.notFound().build();
        }
        System.err.println("Answer found:" + answers);
        return ResponseEntity.ok(answers);
    }



    @PostMapping("/admin/updateQues")
    @ResponseBody
    public Map<String, Object> updateQuestion(@RequestParam("questionId") int questionId,
                                              @RequestParam("questionContent") String questionContent,
                                              @RequestParam Map<String, String> formData) {

        Map<String, Object> response = new HashMap<>();

        try {
            Question question = questionService.getQuesById(questionId);
            if (question == null) {
                response.put("success", false);
                response.put("message", "Không tìm thấy câu hỏi");
                return response;
            }

            if(questionService.isExitQuestion(questionContent, question.getQuestionType())
                    && !question.getQuestionContent().equals(questionContent)) {
                response.put("success", false);
                response.put("message", "Chỉnh sửa thất bại do câu hỏi đã tồn tại");
                return response;
            }

            questionService.updateQuestion(questionContent, questionId);

            //Add answer
            List<Answer> answers = new ArrayList<>();
            int answerCount = 0;

            // Find the highest index of answers in the form data
            for (String key : formData.keySet()) {
                if (key.matches("answers\\[\\d+\\]\\.answerContent")) {
                    int index = Integer.parseInt(key.replaceAll("\\D+", ""));
                    answerCount = Math.max(answerCount, index + 1);
                }
            }

            // Get the correct answer index
            int correctAnswerIndex = -1;
            if (formData.containsKey("correctAnswerIndex")) {
                correctAnswerIndex = Integer.parseInt(formData.get("correctAnswerIndex"));
            }

            // Update answer objects
            for (int i = 0; i < answerCount; i++) {
                String answerContent = formData.get("answers[" + i + "].answerContent");
                String answerIdStr = formData.get("answers[" + i + "].answerId");

                if (answerContent != null && !answerContent.trim().isEmpty() && answerIdStr != null) {
                    int answerId = Integer.parseInt(answerIdStr);
                    Answer answer = answerService.getAnswerbyId(answerId);

                    if (answer != null) {
                        answer.setAnswerContent(answerContent);
                        answer.setCorrect(i == correctAnswerIndex);
                        answers.add(answer);
                    }
                }
            }

            // Save answers to the database
            for (Answer answer : answers) {
                answerService.updateAnswer(answer);
            }

            // logTracking
            Authentication authen = SecurityContextHolder.getContext().getAuthentication();
            String emailCur = authen.getName();
            User userCur = userService.getUserByEmail(emailCur);
            Logtracking logTracking = new Logtracking();
            logTracking.setUser(userCur);
            logTracking.setContent("Chỉnh sửa câu hỏi: " + questionContent);
            logTracking.setTime(LocalDateTime.now());
            logTrackingService.saveLog(logTracking);

            response.put("success", true);
            response.put("message", "Chỉnh sửa câu hỏi thành công");
            response.put("questionType", question.getQuestionType());

        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Lỗi: " + e.getMessage());
        }

        return response;
    }

}
