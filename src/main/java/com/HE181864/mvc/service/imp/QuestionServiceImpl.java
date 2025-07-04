package com.HE181864.mvc.service.imp;

import com.HE181864.mvc.model.Exam;
import com.HE181864.mvc.model.Question;
import com.HE181864.mvc.model.User;
import com.HE181864.mvc.repository.ExamRepository;
import com.HE181864.mvc.repository.QuestionReporsitory;
import com.HE181864.mvc.repository.UserRepository;
import com.HE181864.mvc.service.QuestionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class QuestionServiceImpl implements QuestionService {

    @Autowired
    private QuestionReporsitory questionReporsitory;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private ExamRepository examRepository;

    @Override
    public List<String> getTypeQues() {
        return questionReporsitory.getTypeQues();
    }

    @Override
    public List<Question> getQuesbyType(int key) {
        return questionReporsitory.findQuestionsByQuestionTypeAndStatus(key, true);
    }

    @Override
    public void deleteQues(int quesId) {
        Question ques = questionReporsitory.findQuestionsByQuestionId(quesId);
        if (ques != null) {
            ques.setStatus(false);
            questionReporsitory.save(ques);
        }
    }

    @Override
    public Question getQuesById(int quesId) {
        return questionReporsitory.findQuestionsByQuestionId(quesId);
    }

    @Override
    public void addQues(String quesContent, int quesType, String email) {
        User user = userRepository.findUserByEmail(email);
        Exam exam = examRepository.findExamByExamId(quesType);
        if(exam == null) {
            System.out.println("Exam not found");
            Exam exam1 = new Exam();
            exam1.setExamId(quesType);
            exam1.setExamName("Bộ câu hỏi số " + quesType);
            examRepository.save(exam1);
            exam = exam1;
        }
        Question ques = new Question();
        ques.setQuestionContent(quesContent);
        ques.setQuestionType(quesType);
        ques.setStatus(true);
        ques.setTotalScore(1);
        ques.setUser(user);
        ques.setExam(exam);
        questionReporsitory.save(ques);
        System.out.println("Done add new question");
    }

    @Override
    public Question getQuesByContent(String quesContent, int quesType) {
        return questionReporsitory.findQuestionsByQuestionContentAndQuestionType(quesContent, quesType);
    }

    @Override
    public void updateQuestion(String questionContent, int questionId) {
        Question ques = questionReporsitory.findQuestionsByQuestionId(questionId);
        if (ques != null) {
            ques.setQuestionContent(questionContent);
            questionReporsitory.save(ques);
        }
    }

    @Override
    public boolean isExitQuestion(String quesContent, int quesType) {
        return questionReporsitory.existsByQuestionContentAndQuestionType(quesContent, quesType);
    }

    @Override
    public void saveQuestion(Question question) {
        int quesType = question.getQuestionType();
        Exam exam = examRepository.findExamByExamId(quesType);
        if(exam == null) {
            System.out.println("Exam not found");
            Exam exam1 = new Exam();
            exam1.setExamId(quesType);
            exam1.setExamName("Bộ câu hỏi số " + quesType);
            examRepository.save(exam1);
            exam = exam1;
        }
        question.setExam(exam);
        questionReporsitory.save(question);
    }
}
