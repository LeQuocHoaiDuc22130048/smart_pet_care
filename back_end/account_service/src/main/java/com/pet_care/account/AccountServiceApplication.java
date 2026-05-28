package com.pet_care.account;

import com.pet_care.identity.IdentityApplication;
import com.pet_care.user_service.UserServiceApplication;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.cloud.openfeign.EnableFeignClients;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.FilterType;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@SpringBootApplication
@EnableFeignClients(basePackages = {
        "com.pet_care.identity",
        "com.pet_care.user_service"
})
@EntityScan(basePackages = {
        "com.pet_care.identity.entity",
        "com.pet_care.user_service.entity"
})
@EnableJpaRepositories(basePackages = {
        "com.pet_care.identity.repository",
        "com.pet_care.user_service.repository"
})
@ComponentScan(
        basePackages = {
                "com.pet_care.account",
                "com.pet_care.identity",
                "com.pet_care.user_service"
        },
        excludeFilters = {
                @ComponentScan.Filter(type = FilterType.ASSIGNABLE_TYPE, classes = IdentityApplication.class),
                @ComponentScan.Filter(type = FilterType.ASSIGNABLE_TYPE, classes = UserServiceApplication.class),
                @ComponentScan.Filter(type = FilterType.ASSIGNABLE_TYPE, classes = com.pet_care.user_service.configuration.SecurityConfig.class),
                @ComponentScan.Filter(type = FilterType.ASSIGNABLE_TYPE, classes = com.pet_care.user_service.configuration.RabbitMQConfig.class),
                @ComponentScan.Filter(type = FilterType.ASSIGNABLE_TYPE, classes = com.pet_care.user_service.exception.GlobalExceptionHandler.class)
        })
public class AccountServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(AccountServiceApplication.class, args);
    }
}
