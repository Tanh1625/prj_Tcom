package com.HE181864.mvc.model;

import com.fasterxml.jackson.annotation.JsonBackReference;

import javax.persistence.*;

@Entity
@Table(name = "answer")
public class Answer {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "answer_id", nullable = false)
    private int answerId;
    @Column(name = "answer_content", nullable = false, columnDefinition = "NVARCHAR(255)")
    private String answerContent;
    @Column(name = "is_correct", nullable = false)
    private boolean isCorrect;
    @Column(name = "score", nullable = false, columnDefinition = "int default 0")
    private double score;

    @ManyToOne
    @JoinColumn(name = "question_id", nullable = false)
    @JsonBackReference
    private Question question;

    public Answer() {
    }

    public Answer(int answerId, String answerContent, boolean isCorrect, double score, Question question) {
        this.answerId = answerId;
        this.answerContent = answerContent;
        this.isCorrect = isCorrect;
        this.score = score;
        this.question = question;
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
        return isCorrect;
    }

    public void setCorrect(boolean correct) {
        isCorrect = correct;
    }

    public double getScore() {
        return score;
    }

    public void setScore(double score) {
        this.score = score;
    }

    public Question getQuestion() {
        return question;
    }

    public void setQuestion(Question question) {
        this.question = question;
    }

}
