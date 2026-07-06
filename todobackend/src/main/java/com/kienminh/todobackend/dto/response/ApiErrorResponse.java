package com.kienminh.todobackend.dto.response;

import java.time.LocalDateTime;
import java.util.List;

public record ApiErrorResponse(
        LocalDateTime timestamp,
        int status,
        String error,
        String message,
        List<FieldErrorDetail> errors
) {
}
