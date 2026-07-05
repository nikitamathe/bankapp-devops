package com.banking.notification.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class NotificationRequest {
    private String type;
    private Long userId;
    private String accountNumber;
    private String transactionReference;
    private BigDecimal amount;
    private BigDecimal balance;
    private String message;
}
