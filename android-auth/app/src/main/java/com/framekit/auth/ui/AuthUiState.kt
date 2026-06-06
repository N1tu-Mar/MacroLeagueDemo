package com.framekit.auth.ui

/**
 * UI states for the Google Sign-In flow.
 */
sealed interface AuthUiState {
    data object Idle : AuthUiState
    data object Loading : AuthUiState
    data class Success(val idToken: String) : AuthUiState
    data class Error(val message: String) : AuthUiState
}
