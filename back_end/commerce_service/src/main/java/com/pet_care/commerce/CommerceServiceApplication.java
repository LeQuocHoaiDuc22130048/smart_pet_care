package com.pet_care.commerce;

import com.pet_care.cart.CartApplication;
import com.pet_care.order_service.OrderServiceApplication;
import com.pet_care.payment_service.PaymentServiceApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.boot.SpringApplication;
import org.springframework.cloud.openfeign.EnableFeignClients;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.FilterType;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@SpringBootApplication
@EnableFeignClients(basePackages = {
        "com.pet_care.cart",
        "com.pet_care.order_service",
        "com.pet_care.payment_service"
})
@EntityScan(basePackages = {
        "com.pet_care.cart.entity",
        "com.pet_care.order_service.entity",
        "com.pet_care.payment_service.entity"
})
@EnableJpaRepositories(basePackages = {
        "com.pet_care.cart.repository",
        "com.pet_care.order_service.repository",
        "com.pet_care.payment_service.repository"
})
@ComponentScan(
        basePackages = {
                "com.pet_care.commerce",
                "com.pet_care.cart",
                "com.pet_care.order_service",
                "com.pet_care.payment_service"
        },
        excludeFilters = {
                @ComponentScan.Filter(type = FilterType.ASSIGNABLE_TYPE, classes = CartApplication.class),
                @ComponentScan.Filter(type = FilterType.ASSIGNABLE_TYPE, classes = OrderServiceApplication.class),
                @ComponentScan.Filter(type = FilterType.ASSIGNABLE_TYPE, classes = PaymentServiceApplication.class),
                @ComponentScan.Filter(type = FilterType.ASSIGNABLE_TYPE, classes = com.pet_care.cart.configuration.SecurityConfig.class),
                @ComponentScan.Filter(type = FilterType.ASSIGNABLE_TYPE, classes = com.pet_care.order_service.configuration.SecurityConfig.class),
                @ComponentScan.Filter(type = FilterType.ASSIGNABLE_TYPE, classes = com.pet_care.payment_service.configuration.SecurityConfig.class),
                @ComponentScan.Filter(type = FilterType.ASSIGNABLE_TYPE, classes = com.pet_care.cart.configuration.CustomJwtDecoder.class),
                @ComponentScan.Filter(type = FilterType.ASSIGNABLE_TYPE, classes = com.pet_care.order_service.configuration.CustomJwtDecoder.class),
                @ComponentScan.Filter(type = FilterType.ASSIGNABLE_TYPE, classes = com.pet_care.payment_service.configuration.CustomJwtDecoder.class),
                @ComponentScan.Filter(type = FilterType.ASSIGNABLE_TYPE, classes = com.pet_care.order_service.configuration.RabbitMQConfig.class),
                @ComponentScan.Filter(type = FilterType.ASSIGNABLE_TYPE, classes = com.pet_care.payment_service.configuration.RabbitMQConfig.class),
                @ComponentScan.Filter(type = FilterType.ASSIGNABLE_TYPE, classes = com.pet_care.cart.exception.GlobalExceptionHandler.class),
                @ComponentScan.Filter(type = FilterType.ASSIGNABLE_TYPE, classes = com.pet_care.order_service.exception.GlobalExceptionHandler.class),
                @ComponentScan.Filter(type = FilterType.ASSIGNABLE_TYPE, classes = com.pet_care.payment_service.exception.GlobalExceptionHandler.class)
        })
public class CommerceServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(CommerceServiceApplication.class, args);
    }
}
