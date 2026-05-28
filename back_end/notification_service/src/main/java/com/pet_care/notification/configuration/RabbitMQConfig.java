package com.pet_care.notification.configuration;

import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.BindingBuilder;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.core.QueueBuilder;
import org.springframework.amqp.core.TopicExchange;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    public static final String PAYMENT_EXCHANGE = "payment.exchange";
    public static final String PAYMENT_SUCCESS_KEY = "payment.success";
    public static final String PAYMENT_FAILED_KEY = "payment.failed";
    public static final String NOTIFICATION_PAYMENT_SUCCESS_QUEUE = "notification.payment.success.queue";
    public static final String NOTIFICATION_PAYMENT_FAILED_QUEUE = "notification.payment.failed.queue";

    public static final String USER_EXCHANGE = "user.exchange";
    public static final String USER_CREATED_KEY = "user.created";
    public static final String NOTIFICATION_USER_CREATED_QUEUE = "notification.user.created.queue";

    @Bean
    public TopicExchange paymentExchange() {
        return new TopicExchange(PAYMENT_EXCHANGE, true, false);
    }

    @Bean
    public Queue notificationPaymentSuccessQueue() {
        return QueueBuilder.durable(NOTIFICATION_PAYMENT_SUCCESS_QUEUE).build();
    }

    @Bean
    public Queue notificationPaymentFailedQueue() {
        return QueueBuilder.durable(NOTIFICATION_PAYMENT_FAILED_QUEUE).build();
    }

    @Bean
    public Binding notificationPaymentSuccessBinding() {
        return BindingBuilder
                .bind(notificationPaymentSuccessQueue())
                .to(paymentExchange())
                .with(PAYMENT_SUCCESS_KEY);
    }

    @Bean
    public Binding notificationPaymentFailedBinding() {
        return BindingBuilder
                .bind(notificationPaymentFailedQueue())
                .to(paymentExchange())
                .with(PAYMENT_FAILED_KEY);
    }

    @Bean
    public TopicExchange userExchange() {
        return new TopicExchange(USER_EXCHANGE, true, false);
    }

    @Bean
    public Queue notificationUserCreatedQueue() {
        return QueueBuilder.durable(NOTIFICATION_USER_CREATED_QUEUE).build();
    }

    @Bean
    public Binding notificationUserCreatedBinding() {
        return BindingBuilder
                .bind(notificationUserCreatedQueue())
                .to(userExchange())
                .with(USER_CREATED_KEY);
    }

    @Bean
    public Jackson2JsonMessageConverter messageConverter() {
        return new Jackson2JsonMessageConverter();
    }

    @Bean
    public RabbitTemplate rabbitTemplate(ConnectionFactory connectionFactory,
                                         Jackson2JsonMessageConverter messageConverter) {
        RabbitTemplate template = new RabbitTemplate(connectionFactory);
        template.setMessageConverter(messageConverter);
        return template;
    }
}
