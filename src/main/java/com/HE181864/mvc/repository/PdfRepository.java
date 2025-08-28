package com.HE181864.mvc.repository;

import com.HE181864.mvc.model.PdfFile;
import com.HE181864.mvc.model.Exam;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PdfRepository extends JpaRepository<PdfFile, Integer> {
    PdfFile findByExam(Exam exam);

    List<PdfFile> findAllByExam(Exam exam);

    boolean existsByExam(Exam exam);
}
