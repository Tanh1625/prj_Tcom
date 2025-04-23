package com.HE181864.mvc.service;

import com.HE181864.mvc.model.Logtracking;
import com.HE181864.mvc.model.User;
import org.springframework.data.domain.Page;

public interface LogTrackingService {
    void saveLog(Logtracking logTracking);

    Page<Logtracking> getLogTrackingByUser(User userCur, int pageNo);
}
