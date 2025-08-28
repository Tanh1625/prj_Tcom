package com.HE181864.mvc.controller.admin;

import com.HE181864.mvc.DTO.AnswerDTO;
import com.HE181864.mvc.DTO.ChangedQuestionDTO;
import com.HE181864.mvc.model.*;
import com.HE181864.mvc.repository.AnswerRepository;
import com.HE181864.mvc.repository.QuestionReporsitory;
import com.HE181864.mvc.service.*;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import javax.servlet.http.HttpServletRequest;
import javax.transaction.Transactional;
import java.io.IOException;
import java.time.LocalDateTime;
import java.util.*;

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
    @Autowired
    private ExamService examService;
    @Autowired
    private QuestionReporsitory questionRepository;
    @Autowired
    private AnswerRepository answerRepository;
    @Autowired
    private PdfService pdfService;


    @GetMapping("/admin/question")
    public String question(HttpServletRequest request,
                           Model model,
                           @ModelAttribute("search") String search) {
        List<Exam> examList = examService.getAllExam();
        model.addAttribute("examList", examList);

        List<String> questionTypes = questionService.getTypeQues();
        model.addAttribute("questionTypes", questionTypes);
        return "admin/ManageQues";
    }

    @GetMapping("/admin/questionList")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> getList(){
        Map<String, Object> response = new HashMap<>();
        List<Exam> examList = examService.getAllExam();

        if(examList.isEmpty()) {
            response.put("success", false);
            response.put("message", "Không có bài thi nào trong hệ thống");
            return ResponseEntity.ok(response);
        }
        response.put("examList", examList);
        response.put("success", true);
        response.put("message", "Lấy danh sách bài thi thành công");
        return ResponseEntity.ok(response);
    }

    @GetMapping("/admin/questionList/{key}")
    public String questionList(HttpServletRequest request,
                                Model model,
                                @PathVariable int key,
                                @RequestParam(value = "pageNo", defaultValue = "1") int pageNo,
                                @ModelAttribute("search") String search) {



//        List<Question> questionList = questionService.getQuesbyType(key);
//        System.err.println(questionList.size());
//        model.addAttribute("totalQues", questionList.size());
//        model.addAttribute("questionTypes", key);
//
//        model.addAttribute("questionList", questionList);
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
            questionData.put("examName", ques.getExam().getExamName());

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

    @PostMapping("/admin/update-question")
    @ResponseBody
    public Map<String, Object> updateQuestions(@RequestBody Map<String, Object> allQuestionsMap) {
        Map<String, Object> response = new HashMap<>();

        try {
            Map<String, Object> questionData = null;
            for (Map.Entry<String, Object> entry : allQuestionsMap.entrySet()) {
                int questionId = (int) Integer.parseInt(entry.getKey());

                questionData = (Map<String, Object>) entry.getValue();

                String questionContent = (String) questionData.get("questionContent");
                int correctAnswerIndex = Integer.parseInt(questionData.get("correctAnswerIndex").toString());


                List<Map<String, Object>> answers = (List<Map<String, Object>>) questionData.get("answers");

                Question question = questionService.getQuesById(questionId);

                if (question == null) {
                    response.put("success", false);
                    response.put("message", "Không tìm thấy câu hỏi ID: " + questionId);
                    return response;
                }

                if (questionService.isExitQuestion(questionContent, question.getQuestionType())
                        && !question.getQuestionContent().equals(questionContent)) {
                    response.put("success", false);
                    response.put("message", "Câu hỏi đã tồn tại: " + questionContent);
                    return response;
                }

                questionService.updateQuestion(questionContent, questionId);

                // Cập nhật các đáp án
                for (int i = 0; i < answers.size(); i++) {
                    Map<String, Object> answerMap = answers.get(i);
                    int answerId = Integer.parseInt(answerMap.get("answerId").toString());
                    String answerContent = answerMap.get("answerContent").toString();

                    Answer answer = answerService.getAnswerbyId(answerId);
                    if (answer != null) {
                        answer.setAnswerContent(answerContent);
                        answer.setCorrect(i == correctAnswerIndex);
                        answerService.updateAnswer(answer);
                    }
                }

                // Log tracking
                Authentication authen = SecurityContextHolder.getContext().getAuthentication();
                String emailCur = authen.getName();
                User userCur = userService.getUserByEmail(emailCur);

                Logtracking log = new Logtracking();
                log.setUser(userCur);
                log.setContent("Chỉnh sửa câu hỏi: " + questionContent);
                log.setTime(LocalDateTime.now());
                logTrackingService.saveLog(log);
            }
            response.put("success", true);
            response.put("message", "Cập nhật nhiều câu hỏi thành công");
            response.put("data", questionData);

        }catch (Exception e) {
            response.put("success", false);
            response.put("message", "Lỗi xử lý: " + e.getMessage());
        }
        return response;
    }


    @GetMapping("/admin/api/questionList/{id}")
    public ResponseEntity<Map<String, Object>> questionList1(HttpServletRequest request,
                               Model model,
                               @PathVariable int id,
                               @RequestParam(value = "pageNo", defaultValue = "1") int pageNo,
                               @ModelAttribute("search") String search) {

        Map<String, Object> response = new HashMap<>();
        try {
            List<Question> questionList = questionService.getQuesbyType(id);
            if (questionList.isEmpty()) {
                response.put("success", false);
                response.put("message", "Không có câu hỏi nào trong hệ thống");
                response.put("data", questionList);
                return ResponseEntity.ok(response);
            }else {
                response.put("success", true);
                response.put("message", "Lấy danh sách câu hỏi thành công");
                response.put("data", questionList);
            }
        }catch (Exception e){
            response.put("success", false);
            response.put("message", "Lỗi: " + e.getMessage());
            return ResponseEntity.ok(response);
        }
        return ResponseEntity.ok(response);
    }




//    test

    @PostMapping("/admin/api/questionList/update")
    @ResponseBody
    @Transactional
    public ResponseEntity<Map<String, Object>> updateQuestions(@RequestBody List<ChangedQuestionDTO> changedQuestions) {
        Map<String, Object> response = updateData(changedQuestions);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/admin/question/saveAll")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> saveAllQuestions(
                                                                @RequestParam("file") MultipartFile file,
                                                                @RequestParam("changedQuestions") String changedQuestionsJson,
                                                                @RequestParam("examId") String examId) {
        Map<String, Object> response = new HashMap<>();
        try {
            if (file == null || file.isEmpty()) {
                response.put("success", false);
                response.put("message", "File không được để trống");
                return ResponseEntity.ok(response);
            }

            if (examId == null || examId.isEmpty()) {
                response.put("success", false);
                response.put("message", "ID bài thi không được để trống");
                return ResponseEntity.ok(response);
            }

            // Chuyển chuỗi câu hỏi thành danh sách các câu hỏi
            List<ChangedQuestionDTO> changedQuestions = new ArrayList<>();
            ObjectMapper mapper = new ObjectMapper();                //TypeReference<T> để mapper có thể biết chuẩn kiểu dữ liệu cần parse sang
            changedQuestions = mapper.readValue(changedQuestionsJson, new TypeReference<List<ChangedQuestionDTO>>() {
            });


            System.out.println("Exam ID: " + examId);
            System.out.println("ChangQuesList: " + changedQuestions.size());
            System.out.println("File Name: " + file.getOriginalFilename());

            int id = Integer.parseInt(examId);
            Map<String, Object> res1 = updateData(changedQuestions);
            Map<String, Object> res2 = uploadPDF(file, id);

            boolean updateSuccess = Boolean.TRUE.equals(res1.get("success"));
            boolean uploadSuccess = Boolean.TRUE.equals(res2.get("success"));

            // Tổng hợp kết quả
            if (updateSuccess && uploadSuccess) {
                response.put("success", true);
                response.put("message", "Cập nhật dữ liệu và tải file thành công");
            } else {
                response.put("success", false);
                List<String> failedMessages = new ArrayList<>();
                if (!updateSuccess) {
                    failedMessages.add("Cập nhật câu hỏi thất bại: " + res1.get("message"));
                }else failedMessages.add("Cập nhật câu hỏi thành công");
                if (!uploadSuccess) {
                    failedMessages.add("Tải file thất bại: " + res2.get("message"));
                }else failedMessages.add("Tải file thành công");
                response.put("message", String.join(" && ", failedMessages));
            }




        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Lỗi: " + e.getMessage());
        }
        return ResponseEntity.ok(response);
    }






//    -----------------Hàm updateData-------------------
    private Map<String, Object> updateData(List<ChangedQuestionDTO> changedQuestions) {
        Map<String, Object> response = new HashMap<>();
        try {
            int count =0;
            String errQues = "";
            for (ChangedQuestionDTO questionMap : changedQuestions) {

                int questionId = questionMap.getQuestionId();
                String newContent = (String) questionMap.getQuestionContent();

                // Tìm câu hỏi trong DB
                Optional<Question> optionalQuestion = questionRepository.findById(questionId);
                if (!optionalQuestion.isPresent()) {
                    continue;
                }

                Question question = optionalQuestion.get();

                // Cập nhật nếu nội dung khác
                if (questionService.isExitQuestion(newContent, question.getQuestionType())
                        && !question.getQuestionContent().equals(newContent)) {
                    response.put("success", false);
                    response.put("message", "Không thể cập nhập câu hỏi: " + newContent +" vì đã tồn tại");
                    count++;
                    continue;
                }
                if (!Objects.equals(question.getQuestionContent(), newContent)) {
                    question.setQuestionContent(newContent);
                    questionRepository.save(question);
                }

                // Danh sách đáp án
                List<AnswerDTO> answers = questionMap.getAnswers();

                for (AnswerDTO answerDTO : answers) {
                    int answerId = answerDTO.getAnswerId();
                    String newAnswerContent = (String) answerDTO.getAnswerContent();
                    Boolean isCorrect = answerDTO.isCorrect();

                    // Tìm đáp án trong DB
                    Optional<Answer> optionalAnswer = answerRepository.findById(answerId);
                    if (!optionalAnswer.isPresent()) {
                        continue;
                    }

                    Answer answer = optionalAnswer.get();

                    // Cập nhật nếu có thay đổi
                    if (!Objects.equals(answer.getAnswerContent(), newAnswerContent) ||
                            !Objects.equals(answer.isCorrect(), isCorrect)) {
                        answer.setAnswerContent(newAnswerContent);
                        answer.setCorrect(isCorrect);
                        answerRepository.save(answer);
                    }
                }
            }
            if(count==0){
                response.put("success", true);
                response.put("message", "Cập nhật thành công");
            }

            return response;
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Lỗi: " + e.getMessage());
        }
        return response;
    }

//    ------------Hàm uploadPDF--------------
    private Map<String, Object> uploadPDF(MultipartFile file, int examId) {
        Map<String, Object> response = new HashMap<>();
        try {
            pdfService.save(file, examId);
            response.put("message", "File uploaded successfully");
            response.put("success", true);
            return response;
        } catch (IOException e) {
            response.put("message", "File upload failed: " + e.getMessage());
            response.put("success", false);
            return response;
        }

    }
}
