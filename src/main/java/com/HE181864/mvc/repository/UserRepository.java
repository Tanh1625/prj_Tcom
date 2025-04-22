package com.HE181864.mvc.repository;

import com.HE181864.mvc.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, String> {

    boolean existsByUsername(String username);

    boolean existsByEmail(String email);

    User findUsersByUsername(String username);

    User findUserByEmail(String email);

    Optional<User> findByUsername(String username);
    Optional<User> findByEmail(String email);

    User findUserByUsername(String username);

    User findUserByUserID(String userID);

    @Query(value = "Select * from users_management\n" +
            "where status in ('active', 'inactive')", nativeQuery = true)
    Page<User> findUserByStatus(Pageable pageable);

    @Query(value = "Select * from users_management\n" +
            "where status in ('active', 'inactive') and full_name like concat('%',:search,'%');", nativeQuery = true)
    Page<User> findUserByUsernameAndStatus(String search, Pageable pageable);
}
