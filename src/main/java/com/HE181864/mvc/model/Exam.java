package com.HE181864.mvc.model;

import javax.persistence.*;
import java.util.List;

@Entity
@Table(name = "exam")
public class Exam {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "exam_id", nullable = false)
    private int examId;
    @Column(name = "exam_name", nullable = false, columnDefinition = "NVARCHAR(255)")
    private String examName;
    @Column(name = "exam_time", nullable = false)
    private int examTime;


    @ManyToMany(mappedBy = "exams", cascade = CascadeType.ALL)
    private List<Question> questions;


    public Exam() {
    }

    public int getExamId() {
        return examId;
    }

    public void setExamId(int examId) {
        this.examId = examId;
    }

    public String getExamName() {
        return examName;
    }

    public void setExamName(String examName) {
        this.examName = examName;
    }

    public int getExamTime() {
        return examTime;
    }

    public void setExamTime(int examTime) {
        this.examTime = examTime;
    }

    public List<Question> getQuestions() {
        return questions;
    }

    public void setQuestions(List<Question> questions) {
        this.questions = questions;
    }

    public Exam(int examId, String examName, int examTime, List<Question> questions) {
        this.examId = examId;
        this.examName = examName;
        this.examTime = examTime;
        this.questions = questions;
    }
}
