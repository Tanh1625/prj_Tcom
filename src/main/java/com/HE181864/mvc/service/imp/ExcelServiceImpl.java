package com.HE181864.mvc.service.imp;

import com.HE181864.mvc.model.Answer;
import com.HE181864.mvc.model.Question;
import com.HE181864.mvc.model.User;
import com.HE181864.mvc.service.ExamService;
import com.HE181864.mvc.service.ExcelService;
import com.HE181864.mvc.service.UserService;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

@Service
public class ExcelServiceImpl implements ExcelService {
    @Autowired
    private ExamService examService;
    @Autowired
    private UserService userService;

    @Override
    public List<Question> importQues(MultipartFile file) {
        List<Question> questions = new ArrayList<>();
        int maxTypeExam = examService.getAllExam().size();

        try(InputStream is = file.getInputStream();
            Workbook workbook = new XSSFWorkbook(is)){
            Sheet sheet = workbook.getSheetAt(0); // Lấy trang sheet đầu tiên
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            String username = auth.getName();
            User user = userService.getUserByEmail(username);

            for(Row row : sheet){

                if(row.getRowNum() == 0) continue; // Bỏ qua dòng tiêu đề
                if(row.getRowNum() == 1) continue; // Bỏ qua dòng ghi chú
                int type = (int)row.getCell(1).getNumericCellValue();
                Question question = new Question();
                question.setQuestionContent(row.getCell(0).getStringCellValue());
                question.setQuestionType(type);
                question.setStatus(true);
                question.setTotalScore(1);
                question.setUser(user);;

                List<Answer> answers = new ArrayList<>();
                int count = 0;
                for(int i = 2; i<10; i+=2){
                    Cell contentAn = row.getCell(i);
                    Cell isCorrectAn = row.getCell(i+1);
                    if(contentAn == null || contentAn.getCellType() == CellType.BLANK) continue; // Nếu ô trống thì chuyển cột khác
                    if(isCorrectAn == null || isCorrectAn.getCellType() == CellType.BLANK) continue; // Nếu ô trống thì chuyển cột khác

                    String content = contentAn.getStringCellValue().trim();
                    if(content == null || content.isEmpty()) continue; // Nếu ô trống thì chuyển cột khác

                    boolean isCorrect = isCorrectAn.getCellType() == CellType.BOOLEAN
                                        ? isCorrectAn.getBooleanCellValue()
                                        : Boolean.parseBoolean(isCorrectAn.getStringCellValue().trim());
                    if(isCorrect) count++; // Đếm số đáp án đúng

                    Answer answer = new Answer();
                    answer.setAnswerContent(content);
                    answer.setCorrect(isCorrect);
                    answer.setScore(1);
                    answer.setQuestion(question);
                    answers.add(answer);
                }
                if (count != 1 || answers.size() < 2 || answers.size() > 4) {
                    System.out.println("Câu hỏi dòng " + (row.getRowNum() + 1) + " có " + count + " đáp án đúng → bị bỏ qua.");
                    continue; // bỏ qua câu hỏi không hợp lệ
                }
                question.setAnswers(answers);
                if(examService.getExamById(type) == null && type == maxTypeExam+1){
                    examService.addExam(type);
                    question.setExam(examService.getExamById(type));
                }
                else if(examService.getExamById(type) != null){
                    question.setExam(examService.getExamById(type));
                }else{
                    System.err.println("Câu hỏi dòng " + (row.getRowNum() + 1) + " có mã đề không hợp lệ → bị bỏ qua.");
                    continue; // bỏ qua câu hỏi không hợp lệ
                }
                questions.add(question);
            }
        }catch (Exception e){
            System.err.println("Lỗi khi đọc file Excel: " + e.getMessage());
        }
        return questions;
    }
}
