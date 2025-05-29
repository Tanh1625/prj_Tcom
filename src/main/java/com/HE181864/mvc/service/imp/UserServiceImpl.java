package com.HE181864.mvc.service.imp;

import com.HE181864.mvc.model.Enum.Status;
import com.HE181864.mvc.model.User;
import com.HE181864.mvc.repository.RoleRepository;
import com.HE181864.mvc.repository.UserRepository;
import com.HE181864.mvc.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class UserServiceImpl implements UserService {
    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;


    @Override
    public boolean isExitUSName(String username) {
        return userRepository.existsByUsername(username);
    }

    @Override
    public boolean isExitEmail(String email) {
        return userRepository.existsByEmail(email);
    }

    @Override
    public boolean isTruePassword(String info, String password) {
        if(info.contains("@")) {
            User user = userRepository.findUserByEmail(info);
            if(user != null) {
                return user.getPassword().equals(password);
            }
        } else {
            User user = userRepository.findUsersByUsername(info);
            if(user != null) {
                return user.getPassword().equals(password);
            }
        }
        return false;
    }

    @Override
    public User getUser(String userId) {
        return userRepository.findUserByUserID(userId);
    }

    @Override
    public User getUserByEmail(String email) {
        return userRepository.findUserByEmail(email);
    }

    @Override
    public Page<User> getAllUsers(int pageNo) {
        return userRepository.findAll(PageRequest.of(pageNo-1, 10));
    }

    @Override
    public Page<User> getUsersByStatus(int pageNo) {
        return userRepository.findUserByStatus(PageRequest.of(pageNo-1, 10));
    }

    @Override
    public void updateUser(String id, String name, String email, String employeeId, String role, String status) {
        User user = userRepository.findUserByUserID(id);
        user.setFullName(name);
        user.setEmail(email);
        user.setUserID(employeeId);
        user.setRole(roleRepository.findByRoleName(role));
        user.setStatus(Status.valueOf(status));
        userRepository.save(user);
        System.out.println("Done");

    }

    @Override
    public void deleteUser(String userId) {
        User user = userRepository.findUserByUserID(userId);
        user.setStatus(Status.DELETED);
        userRepository.save(user);
        System.out.println("Deleted Done");
    }

    @Override
    public void resetPassword(String userId, String newPassword) {
        User user = userRepository.findUserByUserID(userId);
        user.setPassword(newPassword);
        userRepository.save(user);
        System.out.println("Reset Password Done");
    }

    @Override
    public boolean checkCurrentPassword(String userId, String currentPassword) {
        User user = userRepository.findUserByUserID(userId);
        if(user != null) {
            return user.getPassword().equals(currentPassword);
        }
        return false;
    }

    @Override
    public Page<User> getUsersByName(int pageNo, String search) {
        return userRepository.findUserByUsernameAndStatus(search, PageRequest.of(pageNo-1, 10));
    }

    @Override
    public void addUser(String fullName, String password, String email, String role) {
        String id = "TC0"+ (userRepository.findAll().size()+1);
        User user = new User();
        user.setUserID(id);
        user.setFullName(fullName);
        user.setPassword(password);
        user.setEmail(email);
        user.setRole(roleRepository.findByRoleName(role));
        user.setStatus(Status.ACTIVE);
        userRepository.save(user);
    }

    @Override
    public List<String> findSuggestions(String query) {
        return userRepository.findByFullNameContainingIgnoreCaseAndStatusNot(query, Status.DELETED)
                .stream()
                .map(User::getFullName)
                .distinct()
                .limit(5)
                .collect(Collectors.toList());
    }

    @Override
    public Page<User> findPaginatedUsers(String search, int pageNo, int pageSize) {
        Pageable pageable = PageRequest.of(pageNo - 1, pageSize);

        if (search == null || search.trim().isEmpty()) {
            return userRepository.findByStatusNot(Status.DELETED, pageable);
        } else {
            return userRepository.searchActiveUsers(search, Status.DELETED, pageable);
        }
    }

    @Override
    public void updateToken(String email, String token) {
        User user = userRepository.findUserByEmail(email);
        if (user != null) {
            user.setToken(token);
            userRepository.save(user);
        }
    }

    @Override
    public User getUserByResetPasswordToken(String token) {
        return userRepository.findByToken(token);
    }

    @Override
    public void changePassword(User user, String newPass) {
        if(user != null) {
            user.setPassword(newPass);
            user.setToken(null);
            userRepository.save(user);
        }
    }


}
