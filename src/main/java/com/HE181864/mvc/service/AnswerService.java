package com.HE181864.mvc.service;

import com.HE181864.mvc.model.Answer;

import java.util.List;

public interface AnswerService {
    List<Answer> getAnswersByQuestionId(int id);
}
