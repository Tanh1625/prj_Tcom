package com.HE181864.mvc.repository;

import com.HE181864.mvc.model.Question;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface QuestionReporsitory extends JpaRepository<Question, Integer> {

    @Query(value = "select distinct q.question_type from question q", nativeQuery = true)
    List<String> getTypeQues();

    Page<Question> findByQuestionType(int questionType, Pageable pageable);

    Question findQuestionsByQuestionId(int questionId);

    List<Question> findQuestionsByQuestionTypeAndStatus(int questionType, boolean status);

    Question findQuestionsByQuestionContent(String questionContent);

    boolean existsByQuestionContentAndQuestionType(String questionContent, int questionType);

    Question findQuestionsByQuestionContentAndQuestionType(String questionContent, int questionType);
}
