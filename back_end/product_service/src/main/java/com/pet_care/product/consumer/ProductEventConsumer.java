package com.pet_care.product.consumer;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.pet_care.product.messaging.*;
import com.pet_care.product.service.ProductService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class ProductEventConsumer {
    ProductService productService;
    EventPublisher eventPublisher;
    ObjectMapper objectMapper = new ObjectMapper();

    @RabbitListener(queues = "product.queue")
    public void consume(BaseEvent<?> event) {
        log.info("Received event: {}", event.getType());

        switch (event.getType()) {
            case "stock.reserve" -> handleReserve(event);

            case "stock.rollback" -> handleRollback(event);
        }
    }

    private void handleRollback(BaseEvent<?> event) {

        StockRollbackEvent data =
                objectMapper.convertValue(event.getData(), StockRollbackEvent.class);

        productService.rollbackStock(data.getItems());
    }

    private void handleReserve(BaseEvent<?> event) {
        StockReserveEvent data = objectMapper.convertValue(event.getData(), StockReserveEvent.class);

        try {
            productService.reserveStock(data.getItems());
            eventPublisher.publish("stock.reserved",
                    new StockReservedEvent(data.getOrderId()));
        } catch (Exception e) {
            log.error("Reserve stock failed", e);

            eventPublisher.publish("stock.failed",
                    new StockFailedEvent(data.getOrderId()));
        }
    }
}
