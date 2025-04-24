package com.HE181864.mvc.repository;

import com.HE181864.mvc.model.Logtracking;
import com.HE181864.mvc.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface LogTrackingRepository extends JpaRepository<Logtracking, Integer> {

    Page<Logtracking> findByUser(User user, Pageable pageable);
}
