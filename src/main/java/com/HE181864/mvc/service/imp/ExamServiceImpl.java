package com.HE181864.mvc.service.imp;

import com.HE181864.mvc.model.Exam;
import com.HE181864.mvc.repository.ExamRepository;
import com.HE181864.mvc.service.ExamService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;

@Service
public class ExamServiceImpl implements ExamService {

    @Autowired
    private ExamRepository examRepository;

    @Override
    public List<Exam> getAllExam() {
        return examRepository.findAll();
    }

    @Override
    public Exam getExamById(int examID) {
        return examRepository.findExamByExamId(examID);
    }

    @Override
    public void addExam(int type) {
        Exam exam1 = new Exam();
        exam1.setExamId(type);
        exam1.setExamName("Bộ câu hỏi số " + type);
        examRepository.save(exam1);
    }

    @Override
    public void saveExam(Exam exam) {
        Exam ex1 = examRepository.findExamByExamId(exam.getExamId());
        if (ex1 != null) {
            ex1.setPdfFile(exam.getPdfFile());
            examRepository.save(ex1);
        }else{
            System.err.println("không tồn tại exam!");
        }
    }
}
