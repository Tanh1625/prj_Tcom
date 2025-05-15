package com.HE181864.mvc.service;

import javax.mail.MessagingException;
import java.io.UnsupportedEncodingException;

public interface EmailService {
    void sendHtmlEmail(String email, String link) throws MessagingException, UnsupportedEncodingException;
}
