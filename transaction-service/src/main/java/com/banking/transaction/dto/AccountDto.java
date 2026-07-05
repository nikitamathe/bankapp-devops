package com.banking.transaction.dto;

import lombok.Data;

import java.math.BigDecimal;

/**
 * Minimal representation of an Account used when calling the Account Service.
 */
@Data
public class AccountDto {
    private Long id;
    private String accountNumber;
    private Long userId;
    private String accountHolderName;
    private String accountType;
    private BigDecimal balance;
    private String status;
}
