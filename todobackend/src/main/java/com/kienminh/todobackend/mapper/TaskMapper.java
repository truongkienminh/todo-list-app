package com.kienminh.todobackend.mapper;

import com.kienminh.todobackend.dto.request.TaskRequest;
import com.kienminh.todobackend.dto.response.TaskResponse;
import com.kienminh.todobackend.entity.Task;
import org.springframework.stereotype.Component;

@Component
public class TaskMapper {

    public Task toEntity(TaskRequest request) {
        if (request == null) {
            return null;
        }

        return Task.builder()
                .title(request.title())
                .description(request.description())
                .status(request.status())
                .priority(request.priority())
                .dueDate(request.dueDate())
                .build();
    }

    public TaskResponse toResponse(Task task) {
        if (task == null) {
            return null;
        }

        return new TaskResponse(
                task.getId(),
                task.getTitle(),
                task.getDescription(),
                task.getStatus(),
                task.getPriority(),
                task.getDueDate(),
                task.getCompletedAt(),
                task.getCreatedAt(),
                task.getUpdatedAt()
        );
    }

    public void updateEntityFromRequest(TaskRequest request, Task task) {
        if (request == null || task == null) {
            return;
        }

        task.setTitle(request.title());
        task.setDescription(request.description());
        task.setStatus(request.status());
        task.setPriority(request.priority());
        task.setDueDate(request.dueDate());
    }
}
