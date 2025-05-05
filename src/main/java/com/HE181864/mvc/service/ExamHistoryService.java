package com.HE181864.mvc.service;

import com.HE181864.mvc.model.ExamHistory;
import com.HE181864.mvc.model.User;
import org.springframework.data.domain.Page;

import java.time.LocalDateTime;
import java.util.List;

public interface ExamHistoryService {
    void saveExamHistory(String userID, LocalDateTime startTime, LocalDateTime endTime, double score, int examId);

    List<ExamHistory> getExamHistoryByUserId(User userCur);

    Page<ExamHistory> getExamHistoryPagination(User userCur, int page, int size);
}
