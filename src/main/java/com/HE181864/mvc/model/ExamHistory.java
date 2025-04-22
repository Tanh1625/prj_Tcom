package com.HE181864.mvc.model;

import javax.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "exam_history")
public class ExamHistory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "exam_history_id", nullable = false)
    private int examHistoryId;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "exam_id", nullable = false)
    private Exam exam;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "score", nullable = false)
    private double score;
    @Column(name = "start_at")
    private LocalDateTime startAt;
    @Column(name = "end_at")
    private LocalDateTime endAt;

    public int getExamHistoryId() {
        return examHistoryId;
    }

    public void setExamHistoryId(int examHistoryId) {
        this.examHistoryId = examHistoryId;
    }

    public Exam getExam() {
        return exam;
    }

    public void setExam(Exam exam) {
        this.exam = exam;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public double getScore() {
        return score;
    }

    public void setScore(double score) {
        this.score = score;
    }

    public LocalDateTime getStartAt() {
        return startAt;
    }

    public void setStartAt(LocalDateTime startAt) {
        this.startAt = startAt;
    }

    public LocalDateTime getEndAt() {
        return endAt;
    }

    public void setEndAt(LocalDateTime endAt) {
        this.endAt = endAt;
    }

    public ExamHistory() {
    }

    public ExamHistory(int examHistoryId, Exam exam, User user, double score, LocalDateTime startAt, LocalDateTime endAt) {
        this.examHistoryId = examHistoryId;
        this.exam = exam;
        this.user = user;
        this.score = score;
        this.startAt = startAt;
        this.endAt = endAt;
    }
}
