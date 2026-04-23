package com.pet_care.feedback;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.TestPropertySource;

@SpringBootTest
@TestPropertySource(properties = {
    "spring.data.mongodb.uri=mongodb://localhost:27017/pet_care_feedback_test"
})
class FeedbackApplicationTests {

    @Test
    void contextLoads() {
    }

}
