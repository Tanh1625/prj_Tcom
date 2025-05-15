package com.HE181864.mvc.service;

import com.HE181864.mvc.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface UserService {
    boolean isExitUSName(String username);
    boolean isExitEmail(String email);
    boolean isTruePassword(String username, String password);

    User getUser(String userId);
    User getUserByEmail(String email);

    Page<User> getAllUsers(int pageNo);
    Page<User> getUsersByStatus(int pageNo);

    void updateUser(String id, String name, String email, String employeeId, String role, String status);

    void deleteUser(String userId);

    void resetPassword(String userId, String newPassword);

    boolean checkCurrentPassword(String userId, String currentPassword);

    Page<User> getUsersByName(int pageNo, String search);

    void addUser(String fullName, String password, String email, String role);

    List<String> findSuggestions(String query);

    Page<User> findPaginatedUsers(String search, int pageNo, int pageSize);

    void updateToken(String email, String token);

    User getUserByResetPasswordToken(String token);

    void changePassword(User user, String token);
}
