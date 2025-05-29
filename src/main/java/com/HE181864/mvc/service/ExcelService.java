package com.HE181864.mvc.service;

import com.HE181864.mvc.model.Question;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface ExcelService {
    List<Question> importQues(MultipartFile file);
}
