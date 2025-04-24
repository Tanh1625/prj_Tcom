package com.HE181864.mvc.repository;

import com.HE181864.mvc.model.Answer;
import com.HE181864.mvc.model.Question;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AnswerRepository extends JpaRepository<Answer, Integer> {
    List<Answer> findAnswerByQuestion(Question question);

    Answer findByAnswerId(int answerId);

    Answer findAnswerByAnswerContentAndQuestion(String answerContent, Question question);
}
