package com.pet_care.payment_service.configuration;

import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.BindingBuilder;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.core.TopicExchange;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {
    // Exchange
    @Bean
    public TopicExchange paymentExchange() {
        return new TopicExchange("payment.exchange");
    }

    // Queue SUCCESS
    @Bean
    public Queue paymentSuccessQueue() {
        return new Queue("payment.success.queue");
    }

    // Queue FAILED
    @Bean
    public Queue paymentFailedQueue() {
        return new Queue("payment.failed.queue");
    }

    // Binding SUCCESS
    @Bean
    public Binding successBinding() {
        return BindingBuilder
                .bind(paymentSuccessQueue())
                .to(paymentExchange())
                .with("payment.success");
    }

    // Binding FAILED
    @Bean
    public Binding failedBinding() {
        return BindingBuilder
                .bind(paymentFailedQueue())
                .to(paymentExchange())
                .with("payment.failed");
    }
}
