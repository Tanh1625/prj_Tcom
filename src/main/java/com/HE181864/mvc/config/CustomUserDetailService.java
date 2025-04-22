package com.HE181864.mvc.config;

import com.HE181864.mvc.model.Enum.Status;
import com.HE181864.mvc.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;

import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import com.HE181864.mvc.model.User;

import java.util.Collections;


@Service
public class CustomUserDetailService implements UserDetailsService {

    @Autowired
    private UserRepository userRepository;


    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("Tài khoản Không tồn tại"));

        if(user.getStatus() == Status.INACTIVE){
            throw new UsernameNotFoundException("Tài khoản đã bị khóa");
        }
        if(user.getStatus() == Status.DELETED){
            throw new UsernameNotFoundException("Tài khoản đã bị xóa");
        }

        return new org.springframework.security.core.userdetails.User(
                user.getEmail(),
                user.getPassword(),
                user.getStatus() == Status.ACTIVE,
                true,
                true,
                true,
                Collections.singleton(new SimpleGrantedAuthority(user.getRole().getRoleName()))
        );
    }
}
