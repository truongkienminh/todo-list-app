package com.kienminh.todobackend.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI todoBackendOpenApi() {
        return new OpenAPI()
                .info(new Info()
                        .title("Todo Backend API")
                        .version("v1")
                        .description("OpenAPI documentation for the Todo Backend service."));
    }
}
