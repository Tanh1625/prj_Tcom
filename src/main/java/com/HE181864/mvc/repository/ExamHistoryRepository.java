package com.HE181864.mvc.repository;

import com.HE181864.mvc.model.ExamHistory;
import com.HE181864.mvc.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ExamHistoryRepository extends JpaRepository<ExamHistory, Integer> {
    List<ExamHistory> findByUser(User user);

    Page<ExamHistory> findByUser(User user, Pageable pageable);
}
