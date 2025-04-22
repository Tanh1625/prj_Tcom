package com.HE181864.mvc.config;

import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.web.authentication.AuthenticationFailureHandler;
import org.springframework.stereotype.Component;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.net.URLEncoder;

@Component
public class CustomFaulureHandler implements AuthenticationFailureHandler {

    @Override
    public void onAuthenticationFailure(HttpServletRequest request, HttpServletResponse response, AuthenticationException exception) throws IOException, ServletException {

        String messageError;
        Throwable cause = exception.getCause();
        if (cause instanceof DisabledException) {
            messageError = cause.getMessage();

        }

        else if (exception instanceof UsernameNotFoundException) {
            messageError = exception.getMessage();

        } else if (exception instanceof BadCredentialsException) {
            messageError = "(*)Tài khoản hoặc mật khẩu không chính xác";

        } else {
            messageError = "Đăng Nhập Thất Bại";

        }

        response.sendRedirect("/login?error=true&message=" +
                URLEncoder.encode(messageError, "UTF-8"));
    }
}
