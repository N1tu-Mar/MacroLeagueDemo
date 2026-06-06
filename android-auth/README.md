# Framekit — Google Authentication (Credential Manager)

Modern Google Sign-In for Android using the **Credential Manager API**, Jetpack Compose, and MVVM.

## Setup

### 1. Google Cloud Console

1. Create a project at [Google Cloud Console](https://console.cloud.google.com/).
2. Enable **Google Identity Services**.
3. Create credentials:
   - **Web application** OAuth client → copy the **Client ID** (used by Credential Manager).
   - **Android** OAuth client → package name `com.framekit.auth` + your SHA-1 fingerprint.

### 2. Configure the app

In `app/build.gradle.kts`, replace the placeholder:

```kotlin
buildConfigField(
    "String",
    "GOOGLE_WEB_CLIENT_ID",
    "\"YOUR_WEB_CLIENT_ID.apps.googleusercontent.com\""
)
```

Get your debug SHA-1:

```bash
./gradlew signingReport
```

Add that SHA-1 to the Android OAuth client in Google Cloud Console.

### 3. Open in Android Studio

Open the `android-auth/` folder as a project and run on a device or emulator (API 26+).

## Architecture

```
LoginScreen (Compose)
    └── AuthViewModel (viewModelScope)
            ├── AuthRepository
            │       └── GoogleAuthRepositoryImpl (Credential Manager)
            └── BackendAuthService (placeholder → Firebase / REST)
```

## Key files

| File | Purpose |
|------|---------|
| `data/AuthRepository.kt` | Repository contract |
| `data/GoogleAuthRepositoryImpl.kt` | Credential Manager + `GetGoogleIdOption` |
| `data/BackendAuthService.kt` | Placeholder token exchange |
| `ui/AuthViewModel.kt` | Idle / Loading / Success / Error states |
| `ui/LoginScreen.kt` | Compose login UI + Google button |

## Gradle dependencies

```kotlin
implementation("androidx.credentials:credentials:1.5.0")
implementation("androidx.credentials:credentials-play-services-auth:1.5.0")
implementation("com.google.android.libraries.identity.googleid:googleid:1.1.1")
```

## Wire Firebase (optional)

Add to `app/build.gradle.kts`:

```kotlin
implementation(platform("com.google.firebase:firebase-bom:33.7.0"))
implementation("com.google.firebase:firebase-auth-ktx")
```

Then implement `BackendAuthService.authenticateWithIdToken()` using `GoogleAuthProvider.getCredential(idToken, null)`.
