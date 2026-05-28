package com.pet_care.commerce.configuration;

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
public class CommerceRabbitMQConfig {

    private static final String ORDER_EXCHANGE = "order.exchange";
    private static final String ORDER_QUEUE = "order.queue";
    private static final String PAYMENT_CREATE_QUEUE = "payment.create.queue";
    private static final String PAYMENT_CREATE_KEY = "payment.create";
    private static final String PAYMENT_EXCHANGE = "payment.exchange";
    private static final String PAYMENT_SUCCESS_QUEUE = "payment.success.queue";
    private static final String PAYMENT_FAILED_QUEUE = "payment.failed.queue";
    private static final String PAYMENT_SUCCESS_KEY = "payment.success";
    private static final String PAYMENT_FAILED_KEY = "payment.failed";

    @Bean
    TopicExchange orderExchange() {
        return new TopicExchange(ORDER_EXCHANGE, true, false);
    }

    @Bean
    Queue orderQueue() {
        return new Queue(ORDER_QUEUE);
    }

    @Bean
    Binding orderBinding() {
        return BindingBuilder.bind(orderQueue()).to(orderExchange()).with("#");
    }

    @Bean
    Queue paymentCreateQueue() {
        return new Queue(PAYMENT_CREATE_QUEUE, true);
    }

    @Bean
    Binding paymentCreateBinding(Queue paymentCreateQueue, TopicExchange orderExchange) {
        return BindingBuilder.bind(paymentCreateQueue).to(orderExchange).with(PAYMENT_CREATE_KEY);
    }

    @Bean
    TopicExchange paymentExchange() {
        return new TopicExchange(PAYMENT_EXCHANGE);
    }

    @Bean
    Queue paymentSuccessQueue() {
        return new Queue(PAYMENT_SUCCESS_QUEUE);
    }

    @Bean
    Queue paymentFailedQueue() {
        return new Queue(PAYMENT_FAILED_QUEUE);
    }

    @Bean
    Binding paymentSuccessBinding() {
        return BindingBuilder.bind(paymentSuccessQueue()).to(paymentExchange()).with(PAYMENT_SUCCESS_KEY);
    }

    @Bean
    Binding paymentFailedBinding() {
        return BindingBuilder.bind(paymentFailedQueue()).to(paymentExchange()).with(PAYMENT_FAILED_KEY);
    }

    @Bean
    MessageConverter messageConverter() {
        return new Jackson2JsonMessageConverter();
    }

    @Bean
    RabbitTemplate rabbitTemplate(ConnectionFactory connectionFactory, MessageConverter messageConverter) {
        RabbitTemplate rabbitTemplate = new RabbitTemplate(connectionFactory);
        rabbitTemplate.setMessageConverter(messageConverter);
        return rabbitTemplate;
    }
}
