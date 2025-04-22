package com.HE181864.mvc.service.imp;

import com.HE181864.mvc.model.Answer;
import com.HE181864.mvc.model.Question;
import com.HE181864.mvc.repository.AnswerRepository;
import com.HE181864.mvc.service.AnswerService;
import com.HE181864.mvc.service.QuestionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;

@Service
public class AnswerServiceImpl implements AnswerService {
    @Autowired
    private AnswerRepository answerRepository;
    @Autowired
    private QuestionService questionService;

    @Override
    public List<Answer> getAnswersByQuestionId(int id) {
        Question question = questionService.getQuesById(id);

        return answerRepository.findAnswerByQuestion(question);
    }
}
