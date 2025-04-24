package com.HE181864.mvc.DTO;

import com.HE181864.mvc.model.Answer;

import java.util.List;

public class AnswerForQues {
    private List<Answer> answers;

    public AnswerForQues() {
    }

    public AnswerForQues(List<Answer> answers) {
        this.answers = answers;
    }

    public List<Answer> getAnswers() {
        return answers;
    }

    public void setAnswers(List<Answer> answers) {
        this.answers = answers;
    }
}
