package com.HE181864.mvc.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonManagedReference;

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



    @OneToMany(mappedBy = "exam", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonBackReference
    private List<Question> questions;

    @OneToMany(mappedBy = "exam", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonBackReference
    private List<ExamHistory> examHistories;



    @OneToOne(mappedBy = "exam", cascade = CascadeType.ALL)
    @JsonManagedReference
    private PdfFile pdfFile;


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

    public List<Question> getQuestions() {
        return questions;
    }

    public void setQuestions(List<Question> questions) {
        this.questions = questions;
    }

    public List<ExamHistory> getExamHistories() {
        return examHistories;
    }

    public void setExamHistories(List<ExamHistory> examHistories) {
        this.examHistories = examHistories;
    }

    public PdfFile getPdfFile() {
        return pdfFile;
    }

    public void setPdfFile(PdfFile pdfFile) {
        this.pdfFile = pdfFile;
    }

    public Exam(int examId, String examName, List<Question> questions, List<ExamHistory> examHistories, PdfFile pdfFile) {
        this.examId = examId;
        this.examName = examName;
        this.questions = questions;
        this.examHistories = examHistories;
        this.pdfFile = pdfFile;
    }
}
