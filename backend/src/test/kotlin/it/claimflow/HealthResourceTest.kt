package it.claimflow

import io.quarkus.test.junit.QuarkusTest
import io.restassured.RestAssured.given
import org.hamcrest.CoreMatchers.`is`
import org.junit.jupiter.api.Test

@QuarkusTest
class HealthResourceTest {
    @Test
    fun healthEndpoint() {
        given().`when`().get("/api/health").then().statusCode(200).body("status", `is`("UP"))
    }
}
