package com.framekit.auth.ui

import android.content.Context
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.framekit.auth.data.AuthCancelledException
import com.framekit.auth.data.AuthRepository
import com.framekit.auth.data.BackendAuthService
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch

class AuthViewModel(
    private val authRepository: AuthRepository,
    private val backendAuthService: BackendAuthService = BackendAuthService(),
) : ViewModel() {

    private val _uiState = MutableStateFlow<AuthUiState>(AuthUiState.Idle)
    val uiState: StateFlow<AuthUiState> = _uiState.asStateFlow()

    /**
     * Starts Google Sign-In. Must be called with an Activity [Context] so Credential Manager
     * can show the account picker bottom sheet.
     */
    fun signInWithGoogle(activityContext: Context) {
        if (_uiState.value is AuthUiState.Loading) return

        viewModelScope.launch {
            _uiState.update { AuthUiState.Loading }

            authRepository.signInWithGoogle(activityContext)
                .onSuccess { idToken ->
                    backendAuthService.authenticateWithIdToken(idToken)
                        .onSuccess {
                            _uiState.update { AuthUiState.Success(idToken) }
                        }
                        .onFailure { backendError ->
                            _uiState.update {
                                AuthUiState.Error(
                                    backendError.message ?: "Backend authentication failed"
                                )
                            }
                        }
                }
                .onFailure { error ->
                    when (error) {
                        is AuthCancelledException -> _uiState.update { AuthUiState.Idle }
                        else -> _uiState.update {
                            AuthUiState.Error(error.message ?: "Google sign-in failed")
                        }
                    }
                }
        }
    }

    fun resetError() {
        if (_uiState.value is AuthUiState.Error) {
            _uiState.update { AuthUiState.Idle }
        }
    }

    fun signOut() {
        _uiState.update { AuthUiState.Idle }
        // TODO: Clear Firebase session / local tokens when backend is wired.
    }
}
