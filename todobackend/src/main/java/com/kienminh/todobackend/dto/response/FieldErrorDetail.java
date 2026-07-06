package com.kienminh.todobackend.dto.response;

public record FieldErrorDetail(
        String field,
        String message
) {
}
