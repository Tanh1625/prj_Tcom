package com.HE181864.mvc.repository;

import com.HE181864.mvc.model.Exam;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ExamRepository extends JpaRepository<Exam, Integer> {
    Exam findExamByExamId(int examId);
}
