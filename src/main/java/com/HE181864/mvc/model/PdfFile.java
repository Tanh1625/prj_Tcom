package com.HE181864.mvc.model;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import javax.persistence.*;

@Entity
@Table(name = "pdf_files")
public class PdfFile {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private int id;

    @Column(name = "file_name", nullable = false, columnDefinition = "NVARCHAR(255)")
    private String fileName;

    @Column(name = "file_type", nullable = false)
    private String fileType;

    @Lob
    @Column(name = "file_data", nullable = false)
    private byte[] fileData;

    @ManyToOne
    @JsonManagedReference
    @JoinColumn(name = "exam_id", nullable = false)
    private Exam exam;


    public PdfFile() {
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public String getFileName() {
        return fileName;
    }

    public void setFileName(String fileName) {
        this.fileName = fileName;
    }

    public String getFileType() {
        return fileType;
    }

    public void setFileType(String fileType) {
        this.fileType = fileType;
    }

    public byte[] getFileData() {
        return fileData;
    }

    public void setFileData(byte[] fileData) {
        this.fileData = fileData;
    }

    public Exam getExam() {
        return exam;
    }

    public void setExam(Exam exam) {
        this.exam = exam;
    }

    public PdfFile(int id, String fileName, String fileType, byte[] fileData, Exam exam) {
        this.id = id;
        this.fileName = fileName;
        this.fileType = fileType;
        this.fileData = fileData;
        this.exam = exam;
    }
}
