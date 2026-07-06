package com.kienminh.todobackend.dto.response;

import com.kienminh.todobackend.enums.TaskPriority;
import com.kienminh.todobackend.enums.TaskStatus;
import java.time.LocalDateTime;

public record TaskResponse(
        Long id,
        String title,
        String description,
        TaskStatus status,
        TaskPriority priority,
        LocalDateTime dueDate,
        LocalDateTime completedAt,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
}
