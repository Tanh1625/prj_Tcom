package com.HE181864.mvc.service;

import com.HE181864.mvc.model.PdfFile;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

public interface PdfService {
    PdfFile save(MultipartFile file, int examid) throws IOException;

    List<PdfFile> getPdfFile(int id);
}
