package com.framekit.auth

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.darkColorScheme
import androidx.compose.ui.Modifier
import androidx.credentials.CredentialManager
import androidx.lifecycle.viewmodel.compose.viewModel
import com.framekit.auth.data.GoogleAuthRepositoryImpl
import com.framekit.auth.ui.AuthViewModel
import com.framekit.auth.ui.LoginScreen

class MainActivity : ComponentActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()

        setContent {
            MaterialTheme(colorScheme = darkColorScheme()) {
                Surface(modifier = Modifier.fillMaxSize()) {
                    val authViewModel: AuthViewModel = viewModel(
                        factory = AuthViewModelFactory(
                            GoogleAuthRepositoryImpl(
                                credentialManager = CredentialManager.create(this),
                                webClientId = BuildConfig.GOOGLE_WEB_CLIENT_ID,
                            )
                        )
                    )
                    LoginScreen(viewModel = authViewModel)
                }
            }
        }
    }
}
