package com.HE181864.mvc.DTO;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown = true)
public class AnswerDTO {
    private int answerId;
    private String answerContent;
    private boolean correct;
    private double score;

    public AnswerDTO() {
    }

    public int getAnswerId() {
        return answerId;
    }

    public void setAnswerId(int answerId) {
        this.answerId = answerId;
    }

    public String getAnswerContent() {
        return answerContent;
    }

    public void setAnswerContent(String answerContent) {
        this.answerContent = answerContent;
    }

    public boolean isCorrect() {
        return correct;
    }

    public void setCorrect(boolean correct) {
        this.correct = correct;
    }

    public double getScore() {
        return score;
    }

    public void setScore(double score) {
        this.score = score;
    }

    public AnswerDTO(int answerId, String answerContent, boolean correct, double score) {
        this.answerId = answerId;
        this.answerContent = answerContent;
        this.correct = correct;
        this.score = score;
    }
}
