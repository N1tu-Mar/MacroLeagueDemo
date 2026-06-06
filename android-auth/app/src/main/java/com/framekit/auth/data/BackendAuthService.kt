package com.framekit.auth.data

import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

/**
 * Placeholder for exchanging a Google ID token with your backend or Firebase Auth.
 *
 * Replace the body of [authenticateWithIdToken] with your real integration:
 *   - **Firebase:** `FirebaseAuth.getInstance().signInWithCredential(GoogleAuthProvider.getCredential(idToken, null))`
 *   - **Custom backend:** POST `{ "idToken": "..." }` to `/auth/google` and persist the session JWT.
 */
class BackendAuthService {

    suspend fun authenticateWithIdToken(idToken: String): Result<Unit> =
        withContext(Dispatchers.IO) {
            runCatching {
                // TODO: Wire to Firebase Auth or your REST API.
                // Example (Firebase):
                // val authResult = Firebase.auth
                //     .signInWithCredential(GoogleAuthProvider.getCredential(idToken, null))
                //     .await()
                // require(authResult.user != null) { "Firebase returned null user" }

                // Example (REST):
                // val response = api.exchangeGoogleToken(GoogleTokenRequest(idToken))
                // tokenStore.save(response.sessionToken)

                idToken // Placeholder: ensure token is non-empty before "success".
                require(idToken.isNotBlank()) { "Received blank ID token" }
            }
        }
}
