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
}
