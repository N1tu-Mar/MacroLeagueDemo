package com.framekit.auth.data

import android.content.Context
import androidx.credentials.CredentialManager
import androidx.credentials.CustomCredential
import androidx.credentials.GetCredentialRequest
import androidx.credentials.exceptions.GetCredentialCancellationException
import androidx.credentials.exceptions.GetCredentialException
import com.google.android.libraries.identity.googleid.GetGoogleIdOption
import com.google.android.libraries.identity.googleid.GoogleIdTokenCredential
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

/**
 * Google Sign-In via the Android Credential Manager API.
 *
 * Requires a **Web** OAuth 2.0 client ID (from Google Cloud Console) — not the Android client ID.
 */
class GoogleAuthRepositoryImpl(
    private val credentialManager: CredentialManager,
    private val webClientId: String,
) : AuthRepository {

    override suspend fun signInWithGoogle(activityContext: Context): Result<String> =
        withContext(Dispatchers.Main.immediate) {
            try {
                val googleIdOption = GetGoogleIdOption.Builder()
                    .setFilterByAuthorizedAccounts(false)
                    .setServerClientId(webClientId)
                    .setAutoSelectEnabled(true)
                    .build()

                val request = GetCredentialRequest.Builder()
                    .addCredentialOption(googleIdOption)
                    .build()

                val response = credentialManager.getCredential(
                    context = activityContext,
                    request = request,
                )

                val credential = response.credential
                if (credential is CustomCredential &&
                    credential.type == GoogleIdTokenCredential.TYPE_GOOGLE_ID_TOKEN_CREDENTIAL
                ) {
                    val googleCredential = GoogleIdTokenCredential.createFrom(credential.data)
                    Result.success(googleCredential.idToken)
                } else {
                    Result.failure(
                        AuthException("Unexpected credential type: ${credential::class.simpleName}")
                    )
                }
            } catch (_: GetCredentialCancellationException) {
                Result.failure(AuthCancelledException())
            } catch (e: GetCredentialException) {
                Result.failure(AuthException(e.message ?: "Google sign-in failed"))
            } catch (e: Exception) {
                Result.failure(e)
            }
        }
}

class AuthCancelledException : Exception("Sign-in cancelled")

class AuthException(message: String) : Exception(message)
