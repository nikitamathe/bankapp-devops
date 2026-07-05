package com.banking.notification.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class NotificationResponse {
    private Long id;
    private Long userId;
    private String type;
    private String message;
    private String accountNumber;
    private String transactionReference;
    private BigDecimal amount;
    private BigDecimal balance;
    private boolean read;
    private LocalDateTime createdAt;
}
