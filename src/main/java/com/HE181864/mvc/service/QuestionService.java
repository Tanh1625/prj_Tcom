package com.HE181864.mvc.service;

import com.HE181864.mvc.model.Answer;
import com.HE181864.mvc.model.Question;
import org.springframework.data.domain.Page;

import java.util.List;

public interface QuestionService {
    List<String> getTypeQues();

    Page<Question> getQuesbyType(int pageNo, int key);

    void deleteQues(int quesId);

    Question getQuesById(int quesId);

    void addQues(String quesContent, int quesType, String email);

    Question getQuesByContent(String quesContent);

    void updateQuestion(String questionContent, int questionId);


    boolean isExitQuestion(String quesContent, int quesType);
}
