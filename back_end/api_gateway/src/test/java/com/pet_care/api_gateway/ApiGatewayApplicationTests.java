package com.pet_care.api_gateway;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest(properties = {
		"JWT_SIGNER_KEY=test-secret-key-must-be-at-least-512-bits-long-for-hs512-algorithm"
})
class ApiGatewayApplicationTests {

	@Test
	void contextLoads() {
	}

}
