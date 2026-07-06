package com.kienminh.todobackend.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.kienminh.todobackend.dto.request.TaskRequest;
import com.kienminh.todobackend.dto.response.TaskResponse;
import com.kienminh.todobackend.entity.Task;
import com.kienminh.todobackend.enums.TaskPriority;
import com.kienminh.todobackend.enums.TaskStatus;
import com.kienminh.todobackend.exception.TaskNotFoundException;
import com.kienminh.todobackend.mapper.TaskMapper;
import com.kienminh.todobackend.repository.TaskRepository;
import com.kienminh.todobackend.service.impl.TaskServiceImpl;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.Expression;
import jakarta.persistence.criteria.Path;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;

@ExtendWith(MockitoExtension.class)
class TaskServiceImplTest {

    @Mock
    private TaskRepository taskRepository;

    @Captor
    private ArgumentCaptor<Task> taskCaptor;

    @Captor
    private ArgumentCaptor<Specification<Task>> specificationCaptor;

    private TaskServiceImpl taskService;

    @BeforeEach
    void setUp() {
        taskService = new TaskServiceImpl(taskRepository, new TaskMapper());
    }

    @Test
    void createTaskSetsDefaultStatusAndPriorityWhenNotProvided() {
        TaskRequest request = new TaskRequest(
                "Write tests",
                "Cover service defaults",
                null,
                null,
                null
        );

        when(taskRepository.save(any(Task.class))).thenAnswer(invocation -> {
            Task task = invocation.getArgument(0);
            task.setId(1L);
            return task;
        });

        TaskResponse response = taskService.createTask(request);

        verify(taskRepository).save(taskCaptor.capture());
        Task savedTask = taskCaptor.getValue();
        assertEquals(TaskStatus.PENDING, savedTask.getStatus());
        assertEquals(TaskPriority.MEDIUM, savedTask.getPriority());
        assertNull(savedTask.getCompletedAt());
        assertEquals(TaskStatus.PENDING, response.status());
        assertEquals(TaskPriority.MEDIUM, response.priority());
    }

    @Test
    void updateTaskThrowsWhenIdDoesNotExist() {
        Long missingId = 99L;
        TaskRequest request = new TaskRequest(
                "Missing task",
                "Should fail",
                TaskStatus.IN_PROGRESS,
                TaskPriority.HIGH,
                null
        );
        when(taskRepository.findById(missingId)).thenReturn(Optional.empty());

        TaskNotFoundException exception = assertThrows(
                TaskNotFoundException.class,
                () -> taskService.updateTask(missingId, request)
        );

        assertTrue(exception.getMessage().contains("99"));
    }

    @Test
    void changeStatusSetsCompletedAtWhenMovingToCompleted() {
        Long taskId = 1L;
        Task existingTask = task(taskId, "Ship feature", TaskStatus.PENDING, TaskPriority.MEDIUM, null);

        when(taskRepository.findById(taskId)).thenReturn(Optional.of(existingTask));
        when(taskRepository.save(any(Task.class))).thenAnswer(invocation -> invocation.getArgument(0));

        TaskResponse response = taskService.changeStatus(taskId, TaskStatus.COMPLETED);

        verify(taskRepository).save(taskCaptor.capture());
        Task savedTask = taskCaptor.getValue();
        assertEquals(TaskStatus.COMPLETED, savedTask.getStatus());
        assertNotNull(savedTask.getCompletedAt());
        assertNotNull(response.completedAt());
    }

    @Test
    void changeStatusClearsCompletedAtWhenMovingAwayFromCompleted() {
        Long taskId = 2L;
        LocalDateTime completedAt = LocalDateTime.now().minusHours(2);
        Task existingTask = task(taskId, "Review PR", TaskStatus.COMPLETED, TaskPriority.HIGH, completedAt);

        when(taskRepository.findById(taskId)).thenReturn(Optional.of(existingTask));
        when(taskRepository.save(any(Task.class))).thenAnswer(invocation -> invocation.getArgument(0));

        TaskResponse response = taskService.changeStatus(taskId, TaskStatus.IN_PROGRESS);

        verify(taskRepository).save(taskCaptor.capture());
        Task savedTask = taskCaptor.getValue();
        assertEquals(TaskStatus.IN_PROGRESS, savedTask.getStatus());
        assertNull(savedTask.getCompletedAt());
        assertNull(response.completedAt());
    }

    @Test
    void getTasksFiltersByStatus() {
        Pageable pageable = PageRequest.of(0, 10);
        Task entity = task(1L, "Pending task", TaskStatus.PENDING, TaskPriority.MEDIUM, null);
        Page<Task> page = new PageImpl<>(List.of(entity), pageable, 1);

        when(taskRepository.findAll(any(Specification.class), eq(pageable))).thenReturn(page);

        Page<TaskResponse> result = taskService.getTasks(TaskStatus.PENDING, null, pageable);

        verify(taskRepository).findAll(specificationCaptor.capture(), eq(pageable));
        Specification<Task> specification = specificationCaptor.getValue();

        Root<Task> root = mockRoot();
        CriteriaBuilder criteriaBuilder = mockCriteriaBuilder();
        CriteriaQuery<?> query = mock(CriteriaQuery.class);
        Path<TaskStatus> statusPath = mock(Path.class);
        Predicate statusPredicate = mock(Predicate.class);
        Predicate andPredicate = mock(Predicate.class);

        when(root.<TaskStatus>get("status")).thenReturn(statusPath);
        when(criteriaBuilder.equal(statusPath, TaskStatus.PENDING)).thenReturn(statusPredicate);
        when(criteriaBuilder.and(any(Predicate[].class))).thenReturn(andPredicate);

        Predicate predicate = specification.toPredicate(root, query, criteriaBuilder);

        assertSame(andPredicate, predicate);
        verify(criteriaBuilder).equal(statusPath, TaskStatus.PENDING);
        assertEquals(1, result.getTotalElements());
        assertEquals(TaskStatus.PENDING, result.getContent().getFirst().status());
    }

    @Test
    void getTasksFiltersByNormalizedKeyword() {
        Pageable pageable = PageRequest.of(0, 10);
        Task entity = task(3L, "Plan sprint", TaskStatus.IN_PROGRESS, TaskPriority.MEDIUM, null);
        Page<Task> page = new PageImpl<>(List.of(entity), pageable, 1);

        when(taskRepository.findAll(any(Specification.class), eq(pageable))).thenReturn(page);

        Page<TaskResponse> result = taskService.getTasks(null, "  Plan  ", pageable);

        verify(taskRepository).findAll(specificationCaptor.capture(), eq(pageable));
        Specification<Task> specification = specificationCaptor.getValue();

        Root<Task> root = mockRoot();
        CriteriaBuilder criteriaBuilder = mockCriteriaBuilder();
        CriteriaQuery<?> query = mock(CriteriaQuery.class);
        Path<String> titlePath = mock(Path.class);
        Path<String> descriptionPath = mock(Path.class);
        Expression<String> loweredTitle = mock(Expression.class);
        Expression<String> loweredDescription = mock(Expression.class);
        Predicate titlePredicate = mock(Predicate.class);
        Predicate descriptionPredicate = mock(Predicate.class);
        Predicate orPredicate = mock(Predicate.class);
        Predicate andPredicate = mock(Predicate.class);

        when(root.<String>get("title")).thenReturn(titlePath);
        when(root.<String>get("description")).thenReturn(descriptionPath);
        when(criteriaBuilder.lower(titlePath)).thenReturn(loweredTitle);
        when(criteriaBuilder.lower(descriptionPath)).thenReturn(loweredDescription);
        when(criteriaBuilder.like(loweredTitle, "%plan%")).thenReturn(titlePredicate);
        when(criteriaBuilder.like(loweredDescription, "%plan%")).thenReturn(descriptionPredicate);
        when(criteriaBuilder.or(titlePredicate, descriptionPredicate)).thenReturn(orPredicate);
        when(criteriaBuilder.and(any(Predicate[].class))).thenReturn(andPredicate);

        Predicate predicate = specification.toPredicate(root, query, criteriaBuilder);

        assertSame(andPredicate, predicate);
        verify(criteriaBuilder).like(loweredTitle, "%plan%");
        verify(criteriaBuilder).like(loweredDescription, "%plan%");
        verify(criteriaBuilder).or(titlePredicate, descriptionPredicate);
        assertEquals("Plan sprint", result.getContent().getFirst().title());
    }

    @SuppressWarnings("unchecked")
    private Root<Task> mockRoot() {
        return mock(Root.class);
    }

    private CriteriaBuilder mockCriteriaBuilder() {
        return mock(CriteriaBuilder.class);
    }

    private Task task(
            Long id,
            String title,
            TaskStatus status,
            TaskPriority priority,
            LocalDateTime completedAt
    ) {
        LocalDateTime now = LocalDateTime.now();
        return Task.builder()
                .id(id)
                .title(title)
                .description("description")
                .status(status)
                .priority(priority)
                .completedAt(completedAt)
                .createdAt(now.minusDays(1))
                .updatedAt(now)
                .build();
    }
}
