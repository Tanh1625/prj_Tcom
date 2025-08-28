package com.HE181864.mvc.DTO;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.util.List;
import java.util.Map;

@JsonIgnoreProperties(ignoreUnknown = true)
public class ChangedQuestionDTO  {
    private int questionId;
    private String questionContent;
    private List<AnswerDTO> answers;
    private int questionType;
    private double totalScore;




    public ChangedQuestionDTO() {
    }

    public int getQuestionId() {
        return questionId;
    }

    public void setQuestionId(int questionId) {
        this.questionId = questionId;
    }

    public String getQuestionContent() {
        return questionContent;
    }

    public void setQuestionContent(String questionContent) {
        this.questionContent = questionContent;
    }

    public List<AnswerDTO> getAnswers() {
        return answers;
    }

    public void setAnswers(List<AnswerDTO> answers) {
        this.answers = answers;
    }

    public int getQuestionType() {
        return questionType;
    }

    public void setQuestionType(int questionType) {
        this.questionType = questionType;
    }

    public double getTotalScore() {
        return totalScore;
    }

    public void setTotalScore(double totalScore) {
        this.totalScore = totalScore;
    }



    public ChangedQuestionDTO(List<AnswerDTO> answers, double totalScore, int questionType, String questionContent, int questionId) {
        this.answers = answers;
        this.totalScore = totalScore;
        this.questionType = questionType;
        this.questionContent = questionContent;
        this.questionId = questionId;
    }
}
