package com.HE181864.mvc.until;

import com.HE181864.mvc.model.Answer;
import com.HE181864.mvc.model.Question;
import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVPrinter;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.io.Writer;
import java.util.ArrayList;
import java.util.List;

@Component
public class CsvFileGenerator {
    public void writeCsvFile(List<Question> questionList, Writer writer) {
        try{
            CSVPrinter printer = new CSVPrinter(writer, CSVFormat.DEFAULT.withHeader(
                    "Content",
                    "Bộ câu hỏi",
                    "Answer 1","isTrue",
                    "Answer 2","isTrue",
                    "Answer 3","isTrue",
                    "Answer 4","isTrue"
            ));
            for(Question question : questionList){
                List<Answer> answers = question.getAnswers();
                //Tạo bản lưu trữ
                List<Object> record = new ArrayList<>();
                record.add(question.getQuestionContent());
                record.add(question.getQuestionType());

                //Thêm đáp án nếu tồn tại
                for(Answer answer : answers){
                    record.add(answer.getAnswerContent());
                    record.add(answer.isCorrect());
                }

                //Thêm các ô trống nếu đáp án ít hơn 4
                for(int i = answers.size(); i < 4; i++){
                    record.add("NULL");
                    record.add("NULL");
                }

                //In bản lưu trữ
                printer.printRecord(record);
            }
            printer.flush();

        }catch (IOException e){
            e.printStackTrace();
        }
    }
}
