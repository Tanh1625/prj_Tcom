package com.HE181864.mvc.model;

import com.fasterxml.jackson.annotation.JsonManagedReference;

import javax.persistence.*;
import java.util.List;

@Entity
@Table(name = "question")
public class Question {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "question_id", nullable = false)
    private int questionId;
    @Column(name = "question_content", nullable = false, columnDefinition = "NVARCHAR(255)")
    private String questionContent;
    @Column(name = "question_type", nullable = false)
    private int questionType;
    @Column(name = "total_score", nullable = false, columnDefinition = "int default 0")
    private double totalScore;
    @Column(name = "status", nullable = false, columnDefinition = "bit default 1")
    private boolean status;

    @OneToMany(mappedBy = "question", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonManagedReference
    private List<Answer> answers;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToMany
    @JoinTable(name = "exam_question",
            joinColumns = @JoinColumn(name = "question_id"),
            inverseJoinColumns = @JoinColumn(name = "exam_id"))
    private List<Exam> exams;

    public Question() {
    }

    public Question(int questionId, String questionContent, int questionType, double totalScore, boolean status, List<Answer> answers, User user, List<Exam> exams) {
        this.questionId = questionId;
        this.questionContent = questionContent;
        this.questionType = questionType;
        this.totalScore = totalScore;
        this.status = status;
        this.answers = answers;
        this.user = user;
        this.exams = exams;
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

    public boolean isStatus() {
        return status;
    }

    public void setStatus(boolean status) {
        this.status = status;
    }

    public List<Answer> getAnswers() {
        return answers;
    }

    public void setAnswers(List<Answer> answers) {
        this.answers = answers;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public List<Exam> getExams() {
        return exams;
    }

    public void setExams(List<Exam> exams) {
        this.exams = exams;
    }
}
