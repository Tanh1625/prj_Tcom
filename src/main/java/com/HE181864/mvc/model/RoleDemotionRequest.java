package com.HE181864.mvc.model;

import com.HE181864.mvc.model.Enum.RequestStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "role_demotion_request")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class RoleDemotionRequest {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "request_id")
    private int requestId;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne
    @JoinColumn(name = "request_by", nullable = false)
    private User requestedBy;

    @Column(name = "current_role", nullable = false)
    private String currentRole;

    @Column(name = "requested_role", nullable = false)
    private String requestedRole;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private RequestStatus status;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "reponsed_at")
    private LocalDateTime reponsedAt;

    @Column(name = "reason")
    private String reason;

}
