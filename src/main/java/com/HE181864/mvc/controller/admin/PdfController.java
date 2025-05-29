package com.HE181864.mvc.controller.admin;

import com.HE181864.mvc.model.PdfFile;
import com.HE181864.mvc.service.PdfService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/admin/pdf")
public class PdfController {
    @Autowired
    private PdfService pdfService;

    @PostMapping("/upload")
    public ResponseEntity<Map<String, Object>> uploadFile(@RequestParam("file") MultipartFile file, @RequestParam("examId") int examid) {
        Map<String, Object> response = new HashMap<>();
        try {
            pdfService.save(file, examid);
            response.put("message", "File uploaded successfully");
            response.put("success", true);
            return ResponseEntity.ok(response);
        } catch (IOException e) {
            response.put("message", "File upload failed: " + e.getMessage());
            response.put("success", false);
            return ResponseEntity.ok(response);
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getPdfFile(@PathVariable int id) {
        Map<String, Object> response = new HashMap<>();
        try {
            List<PdfFile> pdfFiles = pdfService.getPdfFile(id);
            if (pdfFiles != null) {
                response.put("success", true);
                response.put("pdfFiles", pdfFiles);
                return ResponseEntity.ok(response);
            } else {
                response.put("message", "PDF file not found");
                response.put("success", false);
                return ResponseEntity.status(404).body(response);
            }
        } catch (Exception e) {
            response.put("message", "Error retrieving PDF file: " + e.getMessage());
            response.put("success", false);
            return ResponseEntity.status(500).body(response);
        }
    }
}
