package com.HE181864.mvc.service.imp;

import com.HE181864.mvc.model.PdfFile;
import com.HE181864.mvc.model.Exam;
import com.HE181864.mvc.repository.PdfRepository;
import com.HE181864.mvc.service.ExamService;
import com.HE181864.mvc.service.PdfService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@Service
public class PdfServiceImpl implements PdfService {
    @Autowired
    private PdfRepository pdfRepository;
    @Autowired
    private ExamService examService;


    @Override
    public PdfFile save(MultipartFile file, int examid) throws IOException {
        Exam exam = examService.getExamById(examid);
        PdfFile pdfFile = new PdfFile();
        pdfFile.setFileName(file.getOriginalFilename());
        pdfFile.setFileType(file.getContentType());
        pdfFile.setFileData(file.getBytes());
        pdfFile.setExam(exam);
        return pdfRepository.save(pdfFile);
    }

    @Override
    public List<PdfFile> getPdfFile(int id) {
        return pdfRepository.findAllByExam(examService.getExamById(id));
    }
}
