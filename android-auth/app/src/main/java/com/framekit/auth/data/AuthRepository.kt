package com.framekit.auth.data

import android.content.Context

/**
 * Abstraction for authentication providers.
 *
 * @param activityContext An [android.app.Activity] context is required so Credential Manager
 *   can display the Google account picker bottom sheet.
 */
interface AuthRepository {
    suspend fun signInWithGoogle(activityContext: Context): Result<String>
}
