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

    public static final String NOTIFICATION_EXCHANGE = "notification.exchange";
    public static final String BOOKING_CREATED_KEY = "booking.created";
    public static final String ORDER_STATUS_CHANGED_KEY = "order.status.changed";
    public static final String BOOKING_STATUS_CHANGED_KEY = "booking.status.changed";
    public static final String SERVICE_PACKAGE_UPDATED_KEY = "service-package.updated";
    public static final String NOTIFICATION_ORDER_STATUS_CHANGED_QUEUE = "notification.order.status.changed.queue";
    public static final String NOTIFICATION_BOOKING_CREATED_QUEUE = "notification.booking.created.queue";
    public static final String NOTIFICATION_BOOKING_STATUS_CHANGED_QUEUE = "notification.booking.status.changed.queue";
    public static final String NOTIFICATION_SERVICE_PACKAGE_UPDATED_QUEUE = "notification.service-package.updated.queue";

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
    public TopicExchange notificationExchange() {
        return new TopicExchange(NOTIFICATION_EXCHANGE, true, false);
    }

    @Bean
    public Queue notificationOrderStatusChangedQueue() {
        return QueueBuilder.durable(NOTIFICATION_ORDER_STATUS_CHANGED_QUEUE).build();
    }

    @Bean
    public Binding notificationOrderStatusChangedBinding() {
        return BindingBuilder
                .bind(notificationOrderStatusChangedQueue())
                .to(notificationExchange())
                .with(ORDER_STATUS_CHANGED_KEY);
    }

    @Bean
    public Queue notificationBookingCreatedQueue() {
        return QueueBuilder.durable(NOTIFICATION_BOOKING_CREATED_QUEUE).build();
    }

    @Bean
    public Binding notificationBookingCreatedBinding() {
        return BindingBuilder
                .bind(notificationBookingCreatedQueue())
                .to(notificationExchange())
                .with(BOOKING_CREATED_KEY);
    }

    @Bean
    public Queue notificationBookingStatusChangedQueue() {
        return QueueBuilder.durable(NOTIFICATION_BOOKING_STATUS_CHANGED_QUEUE).build();
    }

    @Bean
    public Binding notificationBookingStatusChangedBinding() {
        return BindingBuilder
                .bind(notificationBookingStatusChangedQueue())
                .to(notificationExchange())
                .with(BOOKING_STATUS_CHANGED_KEY);
    }

    @Bean
    public Queue notificationServicePackageUpdatedQueue() {
        return QueueBuilder.durable(NOTIFICATION_SERVICE_PACKAGE_UPDATED_QUEUE).build();
    }

    @Bean
    public Binding notificationServicePackageUpdatedBinding() {
        return BindingBuilder
                .bind(notificationServicePackageUpdatedQueue())
                .to(notificationExchange())
                .with(SERVICE_PACKAGE_UPDATED_KEY);
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
