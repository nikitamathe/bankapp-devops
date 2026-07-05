package com.banking.transaction.dto;

import com.banking.transaction.model.Transaction;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class TransactionRequest {

    @NotNull(message = "Transaction type is required")
    private Transaction.TransactionType transactionType;

    @NotNull(message = "Amount is required")
    @DecimalMin(value = "0.01", message = "Amount must be greater than 0")
    private BigDecimal amount;

    // For DEPOSIT / WITHDRAWAL — the account to credit or debit
    private String accountNumber;

    // For TRANSFER — source and destination accounts
    private String fromAccountNumber;
    private String toAccountNumber;

    private String description;
}
