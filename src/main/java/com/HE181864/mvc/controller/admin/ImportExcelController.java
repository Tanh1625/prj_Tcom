package com.HE181864.mvc.controller.admin;

import com.HE181864.mvc.model.Answer;
import com.HE181864.mvc.model.Logtracking;
import com.HE181864.mvc.model.Question;
import com.HE181864.mvc.model.User;
import com.HE181864.mvc.service.*;
import com.HE181864.mvc.until.CsvFileGenerator;
import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVPrinter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.BufferedWriter;
import java.io.IOException;
import java.io.OutputStreamWriter;
import java.io.Writer;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Controller
public class ImportExcelController {
    @Autowired
    private ExcelService excelService;
    @Autowired
    private QuestionService questionService;
    @Autowired
    private ExamService examService;
    @Autowired
    private UserService userService;
    @Autowired
    private LogTrackingService logTrackingService;
    @Autowired
    private CsvFileGenerator csvFileGenerator;


    @PostMapping("/admin/import-horizontal")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> importHorizontal(@RequestParam("file") MultipartFile file) {
        Map<String, Object> response = new HashMap<>();
        int maxTypeExam = examService.getAllExam().size();
        try {
            List<Question> questions = excelService.importQues(file);
            if(questions.isEmpty()) {
                response.put("success", false);
                response.put("message", "Nhập file không thành công! Vui lòng kiểm tra lại đúng định dạng!");
                return ResponseEntity.badRequest().body(response);
            }
            int count = 0;
            for (Question question : questions) {
                // Save each question to the database
                // Assuming you have a method in your service to save questions
                System.out.println("Question: " + question.getQuestionContent());
                System.out.println("type: " + question.getQuestionType());
                for(Answer answer : question.getAnswers()) {
                    System.out.println("Answer: " + answer.getAnswerContent());
                    System.out.println("Correct: " + answer.isCorrect());
                }
                if(questionService.isExitQuestion(question.getQuestionContent(), question.getQuestionType())
                || question.getQuestionType() > maxTypeExam+1) {
                    count++;
                    continue;
                }
                // Save the question and its answers
                questionService.saveQuestion(question);
            }
            if(count == questions.size()) {
                response.put("success", false);
                response.put("message", "Câu hỏi đã tồn tại trong hệ thống! Hoặc bộ câu hỏi không hợp lệ!");
                return ResponseEntity.ok(response);
            }
            response.put("success", true);
            response.put("message", "Đã nhập "+ (questions.size()-count) + " câu hỏi thành công!");

            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            String username = auth.getName();
            User userCur = userService.getUserByEmail(username);
            Logtracking logTracking = new Logtracking();
            logTracking.setUser(userCur);
            logTracking.setContent("Thêm " + (questions.size()-count) + " câu hỏi từ file Excel");
            logTracking.setTime(LocalDateTime.now());
            logTrackingService.saveLog(logTracking);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Lỗi khi nhập file Excel: " + e.getMessage());
            return ResponseEntity.ok(response);
        }
    }


    @GetMapping("/download-excel-template")
    public ResponseEntity<Resource> downloadTemplate() throws IOException {
        ClassPathResource resource = new ClassPathResource("static/excel/importQues.xlsx");
        if(!resource.exists()) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"template-cau-hoi.xlsx\"")
                .body(resource);
    }

    @GetMapping("/admin/download-csv/{key}")
    public void downloadExcel(@PathVariable int key,
                              HttpServletResponse response) throws IOException {
        response.setContentType("text/csv");
        response.setHeader("Content-Disposition", "attachment; filename=question.csv");
        try{
            Writer writer = new BufferedWriter(new OutputStreamWriter(response.getOutputStream()));
            List<Question> questionList = questionService.getQuesbyType(key);
            csvFileGenerator.writeCsvFile(questionList, writer);
        } catch (Exception e) {
            throw new RuntimeException("Lỗi khi tải xuống file CSV: " + e.getMessage());

        }
    }

}
