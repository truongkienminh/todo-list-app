package com.kienminh.todobackend.service;

import com.kienminh.todobackend.dto.request.TaskRequest;
import com.kienminh.todobackend.dto.response.TaskResponse;
import com.kienminh.todobackend.enums.TaskStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface TaskService {

    TaskResponse createTask(TaskRequest request);

    TaskResponse updateTask(Long id, TaskRequest request);

    void deleteTask(Long id);

    TaskResponse getTaskById(Long id);

    Page<TaskResponse> getTasks(TaskStatus status, String keyword, Pageable pageable);

    TaskResponse changeStatus(Long id, TaskStatus newStatus);
}
