package com.HE181864.mvc.service.imp;

import com.HE181864.mvc.service.EmailService;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import javax.mail.MessagingException;
import javax.mail.internet.MimeMessage;
import java.io.UnsupportedEncodingException;

@Service
public class EmailServiceImpl implements EmailService {
    private final JavaMailSender mailSender;

    public EmailServiceImpl(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }



    @Override
    public void sendHtmlEmail(String email, String link) throws MessagingException, UnsupportedEncodingException {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message,true,"UTF-8");
        String emailContent = "<html><head><meta charset=\"UTF-8\"></head><body>"
                + "<p>Chào bạn,</p>"
                + "<p>Bạn đã yêu cầu đặt lại mật khẩu cho tài khoản của mình. Nhấn vào link bên dưới để đặt lại mật khẩu:</p>"
                + "<p><a href=\"" +link+"\">Đặt Lại Mật Khẩu</a></p>"
                + "<p>Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.</p>"
                + "<p>Trân trọng,</p>"
                + "<p>QuanLyDeThi Support</p>"
                + "</body></html>";
        helper.setFrom("Quanlydethisupport@gmail.com","QuanLyDeThi Support");
        helper.setTo(email);
        helper.setSubject("Link Đặt Lại Mật Khẩu");
        helper.setText(emailContent, true);
        mailSender.send(message);

    }
}
