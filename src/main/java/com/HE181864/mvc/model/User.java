package com.HE181864.mvc.model;

import com.HE181864.mvc.model.Enum.Status;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.persistence.*;
import java.util.List;


@Entity
@Table(name = "Users_Management")
//@NoArgsConstructor
//@AllArgsConstructor
//@Data
public class User {
    @Id
    @Column(name = "\"USER_ID\"", nullable = false, columnDefinition = "varchar(10)")
    private String userID;
    @Column(name = "user_Name", columnDefinition = "VARCHAR(50)")
    private String username;
    @Column(name = "password", nullable = false, length = 20)
    private String password;
    @Column(name = "full_name", nullable = false, columnDefinition = "NVARCHAR(50)")
    private String fullName;
    @Column(name = "email", nullable = false, length = 255)
    private String email;

    @ManyToOne
    @JoinColumn(name = "role_id", nullable = false)
    private Role role;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private Status status;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Logtracking> logtrackings;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Question> questions;


    public User() {
    }

    public User(String userID, String username, String password, String fullName, String email, Role role, Status status, List<Logtracking> logtrackings, List<Question> questions) {
        this.userID = userID;
        this.username = username;
        this.password = password;
        this.fullName = fullName;
        this.email = email;
        this.role = role;
        this.status = status;
        this.logtrackings = logtrackings;
        this.questions = questions;
    }

    public String getUserID() {
        return userID;
    }

    public void setUserID(String userID) {
        this.userID = userID;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public Role getRole() {
        return role;
    }

    public void setRole(Role role) {
        this.role = role;
    }

    public Status getStatus() {
        return status;
    }

    public void setStatus(Status status) {
        this.status = status;
    }

    public List<Logtracking> getLogtrackings() {
        return logtrackings;
    }

    public void setLogtrackings(List<Logtracking> logtrackings) {
        this.logtrackings = logtrackings;
    }

    public List<Question> getQuestions() {
        return questions;
    }

    public void setQuestions(List<Question> questions) {
        this.questions = questions;
    }
}
