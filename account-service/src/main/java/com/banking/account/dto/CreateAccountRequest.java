package com.banking.account.dto;

import com.banking.account.model.Account;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CreateAccountRequest {

    @NotNull(message = "Account type is required")
    private Account.AccountType accountType;

    @NotBlank(message = "Account holder name is required")
    private String accountHolderName;
}
