package com.calendarapi.exception;

import com.calendarapi.model.ApiResponse;
import com.calendarapi.security.SecurityUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log =
            LoggerFactory.getLogger(GlobalExceptionHandler.class);

    /* ---------- 400: ошибки валидации ---------- */

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<?>> handleValidationException(
            MethodArgumentNotValidException ex
    ) {
        Map<String, String> errors = new HashMap<>();

        ex.getBindingResult()
                .getFieldErrors()
                .forEach(error ->
                        errors.put(error.getField(), error.getDefaultMessage())
                );

        log.warn(
                "VALIDATION_ERROR | by={} | errors={}",
                SecurityUtils.currentUser(),
                errors
        );

        return ResponseEntity.badRequest()
                .body(new ApiResponse<>(false, "Ошибка валидации", errors));
    }

    /* ---------- 403: нет прав ---------- */

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ApiResponse<?>> handleAccessDenied(AccessDeniedException e) {

        log.warn(
                "ACCESS_DENIED | by={}",
                SecurityUtils.currentUser(),
                e
        );

        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(new ApiResponse<>(false, "Недостаточно прав"));
    }

    /* ---------- 500: все остальные ---------- */

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<?>> handleException(Exception e) {
        log.error("APPLICATION_ERROR | by=" + SecurityUtils.currentUser(), e);

        return ResponseEntity.internalServerError()
                .body(new ApiResponse<>(false, "Внутренняя ошибка сервера"));
    }
}
