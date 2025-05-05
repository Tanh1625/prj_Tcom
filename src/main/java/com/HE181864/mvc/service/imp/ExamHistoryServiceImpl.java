package com.HE181864.mvc.service.imp;

import com.HE181864.mvc.model.ExamHistory;
import com.HE181864.mvc.model.User;
import com.HE181864.mvc.repository.ExamHistoryRepository;
import com.HE181864.mvc.repository.ExamRepository;
import com.HE181864.mvc.service.ExamHistoryService;
import com.HE181864.mvc.service.ExamService;
import com.HE181864.mvc.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;

@Service
public class ExamHistoryServiceImpl implements ExamHistoryService {
    @Autowired
    private UserService userService;
    @Autowired
    private ExamHistoryRepository examHistoryRepository;
    @Autowired
    private ExamRepository examRepository;


    @Override
    public void saveExamHistory(String userID, LocalDateTime startTime, LocalDateTime endTime, double score, int examId) {
        ExamHistory examHistory = new ExamHistory();
        examHistory.setUser(userService.getUser(userID));
        examHistory.setStartAt(startTime);
        examHistory.setEndAt(endTime);
        examHistory.setScore(score);
        examHistory.setExam(examRepository.findExamByExamId(examId));
        examHistoryRepository.save(examHistory);
        System.out.println("Exam history saved successfully");

    }

    @Override
    public List<ExamHistory> getExamHistoryByUserId(User userCur) {
        return examHistoryRepository.findByUser(userCur);
    }

    @Override
    public Page<ExamHistory> getExamHistoryPagination(User userCur, int page, int size) {
        return examHistoryRepository.findByUser(userCur, PageRequest.of(page-1, size));
    }


}
