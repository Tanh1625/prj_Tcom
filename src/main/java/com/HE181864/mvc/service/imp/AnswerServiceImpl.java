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

    @Override
    public void addAnswer(Answer answer) {
        answerRepository.save(answer);
    }

    @Override
    public void updateAnswer(Answer answer) {
        Answer existingAnswer = answerRepository.findByAnswerId(answer.getAnswerId());
        if (existingAnswer == null) {
            System.err.println("Answer not found");
            return;
        }
        if (existingAnswer != null) {
            existingAnswer.setAnswerContent(answer.getAnswerContent());
            existingAnswer.setCorrect(answer.isCorrect());
            answerRepository.save(existingAnswer);
            System.err.println("Answer updated successfully");
        }

    }

    @Override
    public Answer getAnswerbyId(int answerId) {
        return answerRepository.findByAnswerId(answerId);
    }


}
