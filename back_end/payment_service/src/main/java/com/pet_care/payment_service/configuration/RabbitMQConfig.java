package com.pet_care.payment_service.configuration;

import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.BindingBuilder;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.core.TopicExchange;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    // Payment Result Events
    public static final String PAYMENT_EXCHANGE = "payment.exchange";
    public static final String PAYMENT_SUCCESS_QUEUE = "payment.success.queue";
    public static final String PAYMENT_FAILED_QUEUE = "payment.failed.queue";
    public static final String PAYMENT_SUCCESS_KEY = "payment.success";
    public static final String PAYMENT_FAILED_KEY = "payment.failed";

    // Lắng nghe event từ order_service
    public static final String ORDER_EXCHANGE = "order.exchange";
    public static final String PAYMENT_CREATE_QUEUE = "payment.create.queue";
    public static final String PAYMENT_CREATE_KEY = "payment.create";

    // Topics Exchange
    @Bean
    public TopicExchange paymentExchange() {
        return new TopicExchange(PAYMENT_EXCHANGE);
    }

    // Order Exchange (để bind payment.create queue)
    @Bean
    public TopicExchange orderExchange() {
        return new TopicExchange(ORDER_EXCHANGE, true, false);
    }

    // payment.create queue — lắng nghe từ order_service
    @Bean
    public Queue paymentCreateQueue() {
        return new Queue(PAYMENT_CREATE_QUEUE, true);
    }

    @Bean
    public Binding paymentCreateBinding(Queue paymentCreateQueue, TopicExchange orderExchange) {
        return BindingBuilder.bind(paymentCreateQueue).to(orderExchange).with(PAYMENT_CREATE_KEY);
    }

    // Success Queue
    @Bean
    public Queue paymentSuccessQueue() {
        return new Queue(PAYMENT_SUCCESS_QUEUE);
    }

    // Failed Queue
    @Bean
    public Queue paymentFailedQueue() {
        return new Queue(PAYMENT_FAILED_QUEUE);
    }

    // Binding Success
    @Bean
    public Binding paymentSuccessBinding() {
        return BindingBuilder
                .bind(paymentSuccessQueue())
                .to(paymentExchange())
                .with(PAYMENT_SUCCESS_KEY);
    }

    // Binding Failed
    @Bean
    public Binding paymentFailedBinding() {
        return BindingBuilder
                .bind(paymentFailedQueue())
                .to(paymentExchange())
                .with(PAYMENT_FAILED_KEY);
    }

    // JSON converter
    @Bean
    public MessageConverter messageConverter() {
        return new Jackson2JsonMessageConverter();
    }

    // RabbitTemplate
    @Bean
    public RabbitTemplate rabbitTemplate(ConnectionFactory connectionFactory,
                                         MessageConverter messageConverter) {
        RabbitTemplate rabbitTemplate = new RabbitTemplate(connectionFactory);
        rabbitTemplate.setMessageConverter(messageConverter);
        return rabbitTemplate;
    }
}

