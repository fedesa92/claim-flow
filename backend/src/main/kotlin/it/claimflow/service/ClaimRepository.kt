package it.claimflow.service

import io.quarkus.mongodb.panache.kotlin.PanacheMongoRepository
import it.claimflow.domain.ClaimEntity
import jakarta.enterprise.context.ApplicationScoped

@ApplicationScoped
class ClaimRepository : PanacheMongoRepository<ClaimEntity> {
    fun byReference(reference: String) = find("reference", reference).firstResult()
}
