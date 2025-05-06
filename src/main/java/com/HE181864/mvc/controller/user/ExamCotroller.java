package com.HE181864.mvc.controller.user;

import com.HE181864.mvc.model.Answer;
import com.HE181864.mvc.model.Question;
import com.HE181864.mvc.model.User;
import com.HE181864.mvc.service.AnswerService;
import com.HE181864.mvc.service.ExamHistoryService;
import com.HE181864.mvc.service.QuestionService;
import com.HE181864.mvc.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Controller
public class ExamCotroller {
    @Autowired
    private QuestionService questionService;

    @Autowired
    private AnswerService answerService;
    @Autowired
    private ExamHistoryService examHistoryService;
    @Autowired
    private UserService userService;

    @GetMapping("/user/examList/doExam")
    public String exam() {
        return "user/DoExam";
    }

    @GetMapping("/api/exam/getQuestion")
    public ResponseEntity<List<Question>> getQuestion(@RequestParam("key") int key) {
        System.out.println("Key: " + key);
        List<Question> questions = questionService.getQuesbyType(key);
        if (questions.isEmpty()) {
            System.err.println("No question found");
            return ResponseEntity.badRequest().build();
        }
        System.out.println("Found " + questions.size() + " questions");
        return ResponseEntity.ok(questions);
    }

    @GetMapping("/api/exam/getAnswer")
    public ResponseEntity<List<Answer>> getAnswer(@RequestParam("quesId") int quesId) {
        System.out.println("QuestionId: " + quesId);
        List<Answer> answers = answerService.getAnswersByQuestionId(quesId);
        if (answers.isEmpty()) {
            System.err.println("No answer found");
            return ResponseEntity.badRequest().build();
        }
        System.out.println("Found " + answers.size() + " answers");
        return ResponseEntity.ok(answers);
    }

    @PostMapping("/api/exam/submitAnswer")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> submitAnswer (@RequestBody Map<String, Object> submit) {
        Map<String, String> answers = (Map<String, String>) submit.get("answers");

        int numCorrect = 0;
        int quesTyoe = Integer.parseInt(submit.get("type").toString());
        for (Map.Entry<String, String> entry : answers.entrySet()) {
            String questionId = entry.getKey();
            String answerId = entry.getValue();
            System.out.println("Question ID: " + questionId + ", Answer ID: " + answerId);
            // Process the answer here
            if(answerService.isCorrectAnswer(Integer.parseInt(answerId))) {
                numCorrect++;
            }
        }
        int totalType = questionService.getQuesbyType(quesTyoe).size();
        double totalScore = (double) numCorrect / totalType * 10;
        BigDecimal rounded = new BigDecimal(totalScore).setScale(2, RoundingMode.HALF_UP);
        double score = rounded.doubleValue();



        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("HH:mm:ss d/M/yyyy");
        LocalDateTime startTime = LocalDateTime.parse(submit.get("startTime").toString(), formatter);
        LocalDateTime endTime = LocalDateTime.now();
        System.out.println("Start time: " + startTime);
        System.out.println("End time: " + endTime);

        Authentication authen = SecurityContextHolder.getContext().getAuthentication();
        String emailCur = authen.getName();
        User userCur = userService.getUserByEmail(emailCur);

        // Save exam history
        examHistoryService.saveExamHistory(
                userCur.getUserID(),
                startTime,
                endTime,
                score,
                quesTyoe
        );
        Map<String, Object> response = new HashMap<>();
        response.put("score", score);
        response.put("numCorrect", numCorrect);
        response.put("totalType", totalType);


        return ResponseEntity.ok(response);
    }

}
