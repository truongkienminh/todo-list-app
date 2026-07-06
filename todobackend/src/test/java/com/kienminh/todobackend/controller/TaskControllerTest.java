package com.kienminh.todobackend.controller;

import static org.hamcrest.Matchers.hasItem;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.kienminh.todobackend.dto.response.TaskResponse;
import com.kienminh.todobackend.enums.TaskPriority;
import com.kienminh.todobackend.enums.TaskStatus;
import com.kienminh.todobackend.exception.GlobalExceptionHandler;
import com.kienminh.todobackend.exception.TaskNotFoundException;
import com.kienminh.todobackend.service.TaskService;
import java.time.LocalDateTime;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(TaskController.class)
@Import(GlobalExceptionHandler.class)
class TaskControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private TaskService taskService;

    @Test
    void createTaskReturnsBadRequestWhenTitleIsBlank() throws Exception {
        mockMvc.perform(post("/api/tasks")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "title": "   ",
                                  "description": "invalid"
                                }
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors[*].field", hasItem("title")));
    }

    @Test
    void getTaskByIdReturnsNotFoundWhenTaskDoesNotExist() throws Exception {
        when(taskService.getTaskById(99L)).thenThrow(new TaskNotFoundException(99L));

        mockMvc.perform(get("/api/tasks/99"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("Task not found with id: 99"));
    }

    @Test
    void changeStatusReturnsBadRequestWhenStatusValueIsInvalid() throws Exception {
        mockMvc.perform(patch("/api/tasks/1/status")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "status": "DONE"
                                }
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Request body is invalid or malformed."));
    }

    @Test
    void crudEndpointsReturnExpectedStatusCodes() throws Exception {
        TaskResponse taskResponse = response(1L, "Write controller tests", TaskStatus.PENDING);
        TaskResponse updatedTaskResponse = response(1L, "Write controller tests", TaskStatus.IN_PROGRESS);
        TaskResponse completedTaskResponse = response(1L, "Write controller tests", TaskStatus.COMPLETED);

        when(taskService.createTask(any())).thenReturn(taskResponse);
        when(taskService.getTaskById(1L)).thenReturn(taskResponse);
        when(taskService.updateTask(eq(1L), any())).thenReturn(updatedTaskResponse);
        when(taskService.changeStatus(1L, TaskStatus.COMPLETED)).thenReturn(completedTaskResponse);
        doNothing().when(taskService).deleteTask(1L);

        mockMvc.perform(post("/api/tasks")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "title": "Write controller tests",
                                  "description": "cover CRUD"
                                }
                                """))
                .andExpect(status().isCreated());

        mockMvc.perform(get("/api/tasks/1"))
                .andExpect(status().isOk());

        mockMvc.perform(put("/api/tasks/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "title": "Write controller tests",
                                  "description": "updated",
                                  "status": "IN_PROGRESS",
                                  "priority": "HIGH"
                                }
                                """))
                .andExpect(status().isOk());

        mockMvc.perform(patch("/api/tasks/1/status")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "status": "COMPLETED"
                                }
                                """))
                .andExpect(status().isOk());

        mockMvc.perform(delete("/api/tasks/1"))
                .andExpect(status().isNoContent());
    }

    private TaskResponse response(Long id, String title, TaskStatus status) {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime completedAt = status == TaskStatus.COMPLETED ? now : null;
        return new TaskResponse(
                id,
                title,
                "description",
                status,
                TaskPriority.MEDIUM,
                now.plusDays(1),
                completedAt,
                now.minusDays(1),
                now
        );
    }
}
