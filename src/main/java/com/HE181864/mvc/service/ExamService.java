package com.HE181864.mvc.service;

import com.HE181864.mvc.model.Exam;

import java.util.List;

public interface ExamService {
    List<Exam> getAllExam();
    Exam getExamById(int examID);

    void addExam(int type);
}
