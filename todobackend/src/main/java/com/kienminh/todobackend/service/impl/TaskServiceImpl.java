package com.kienminh.todobackend.service.impl;

import com.kienminh.todobackend.dto.request.TaskRequest;
import com.kienminh.todobackend.dto.response.TaskResponse;
import com.kienminh.todobackend.entity.Task;
import com.kienminh.todobackend.enums.TaskPriority;
import com.kienminh.todobackend.enums.TaskStatus;
import com.kienminh.todobackend.exception.TaskNotFoundException;
import com.kienminh.todobackend.mapper.TaskMapper;
import com.kienminh.todobackend.repository.TaskRepository;
import com.kienminh.todobackend.repository.specification.TaskSpecifications;
import com.kienminh.todobackend.service.TaskService;
import java.time.LocalDateTime;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class TaskServiceImpl implements TaskService {

    private final TaskRepository taskRepository;
    private final TaskMapper taskMapper;

    public TaskServiceImpl(TaskRepository taskRepository, TaskMapper taskMapper) {
        this.taskRepository = taskRepository;
        this.taskMapper = taskMapper;
    }

    @Override
    public TaskResponse createTask(TaskRequest request) {
        Task task = taskMapper.toEntity(request);
        task.setStatus(request.status() != null ? request.status() : TaskStatus.PENDING);
        task.setPriority(request.priority() != null ? request.priority() : TaskPriority.MEDIUM);
        synchronizeCompletedAt(task, task.getStatus());

        Task savedTask = taskRepository.save(task);
        return taskMapper.toResponse(savedTask);
    }

    @Override
    public TaskResponse updateTask(Long id, TaskRequest request) {
        Task task = findTaskByIdOrThrow(id);
        TaskStatus currentStatus = task.getStatus();
        TaskPriority currentPriority = task.getPriority();

        taskMapper.updateEntityFromRequest(request, task);

        task.setStatus(request.status() != null ? request.status() : currentStatus);
        task.setPriority(request.priority() != null ? request.priority() : currentPriority);
        synchronizeCompletedAt(task, task.getStatus());

        Task updatedTask = taskRepository.save(task);
        return taskMapper.toResponse(updatedTask);
    }

    @Override
    public void deleteTask(Long id) {
        Task task = findTaskByIdOrThrow(id);
        taskRepository.delete(task);
    }

    @Override
    @Transactional(readOnly = true)
    public TaskResponse getTaskById(Long id) {
        Task task = findTaskByIdOrThrow(id);
        return taskMapper.toResponse(task);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<TaskResponse> getTasks(TaskStatus status, String keyword, Pageable pageable) {
        Specification<Task> specification = TaskSpecifications.withFilters(status, keyword);
        return taskRepository.findAll(specification, pageable)
                .map(taskMapper::toResponse);
    }

    @Override
    public TaskResponse changeStatus(Long id, TaskStatus newStatus) {
        Task task = findTaskByIdOrThrow(id);
        task.setStatus(newStatus);
        synchronizeCompletedAt(task, newStatus);

        Task updatedTask = taskRepository.save(task);
        return taskMapper.toResponse(updatedTask);
    }

    private Task findTaskByIdOrThrow(Long id) {
        return taskRepository.findById(id)
                .orElseThrow(() -> new TaskNotFoundException(id));
    }

    private void synchronizeCompletedAt(Task task, TaskStatus status) {
        if (status == TaskStatus.COMPLETED) {
            if (task.getCompletedAt() == null) {
                task.setCompletedAt(LocalDateTime.now());
            }
            return;
        }

        task.setCompletedAt(null);
    }
}
