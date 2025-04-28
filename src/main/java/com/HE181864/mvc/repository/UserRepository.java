package com.HE181864.mvc.repository;

import com.HE181864.mvc.model.Enum.Status;
import com.HE181864.mvc.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Arrays;
import java.util.List;
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

    List<User> findByFullNameContainingIgnoreCase(String fullName);

//    Page<User> findByFullNameContainingIgnoreCaseOrUserIDContainingIgnoreCaseOrEmailContainingIgnoreCase(String search, String search1, String search2, Pageable pageable);

    Page<User> findByStatusNot(Status status, Pageable pageable);

    @Query("SELECT u FROM User u WHERE u.status <> :deletedStatus AND " +
            "(LOWER(u.fullName) LIKE LOWER(CONCAT('%', :search, '%')) " +
            "OR LOWER(u.userID) LIKE LOWER(CONCAT('%', :search, '%')) " +
            "OR LOWER(u.email) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<User> searchActiveUsers(@Param("search") String search,
                                 @Param("deletedStatus") Status deletedStatus,
                                 Pageable pageable);

    List<User> findByFullNameContainingIgnoreCaseAndStatusNot(String fullName, Status status);
}
