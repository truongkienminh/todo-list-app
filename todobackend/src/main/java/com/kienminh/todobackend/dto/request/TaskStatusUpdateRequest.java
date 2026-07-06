package com.kienminh.todobackend.dto.request;

import com.kienminh.todobackend.enums.TaskStatus;
import jakarta.validation.constraints.NotNull;

public record TaskStatusUpdateRequest(
        @NotNull(message = "Status must not be null")
        TaskStatus status
) {
}
