package com.kienminh.todobackend.dto.request;

import com.kienminh.todobackend.enums.TaskPriority;
import com.kienminh.todobackend.enums.TaskStatus;
import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.time.LocalDateTime;

public record TaskRequest(
        @NotBlank(message = "Title must not be blank")
        @Size(max = 255, message = "Title must not exceed 255 characters")
        String title,

        String description,

        TaskStatus status,

        TaskPriority priority,

        @FutureOrPresent(
                message = "Due date must be in the present or future",
                groups = OnCreate.class
        )
        LocalDateTime dueDate
) {
    public interface OnCreate {
    }
}
