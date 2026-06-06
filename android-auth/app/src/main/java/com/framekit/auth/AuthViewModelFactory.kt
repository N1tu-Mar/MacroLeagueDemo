package com.framekit.auth

import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import com.framekit.auth.data.AuthRepository
import com.framekit.auth.ui.AuthViewModel

class AuthViewModelFactory(
    private val authRepository: AuthRepository,
) : ViewModelProvider.Factory {

    @Suppress("UNCHECKED_CAST")
    override fun <T : ViewModel> create(modelClass: Class<T>): T {
        if (modelClass.isAssignableFrom(AuthViewModel::class.java)) {
            return AuthViewModel(authRepository = authRepository) as T
        }
        throw IllegalArgumentException("Unknown ViewModel class: ${modelClass.name}")
    }
}
