package com.HE181864.mvc.service.imp;

import com.HE181864.mvc.model.Logtracking;
import com.HE181864.mvc.model.User;
import com.HE181864.mvc.repository.LogTrackingRepository;
import com.HE181864.mvc.service.LogTrackingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

@Service
public class LogTrackingServiceImpl implements LogTrackingService {

    @Autowired
    private LogTrackingRepository logTrackingRepository;

    @Override
    public void saveLog(Logtracking logTracking) {
        logTrackingRepository.save(logTracking);
    }

    @Override
    public Page<Logtracking> getLogTrackingByUser(User userCur, int pageNo) {
        return logTrackingRepository.findByUser(userCur, PageRequest.of(pageNo - 1, 10));
    }
}
