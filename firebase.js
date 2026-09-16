"use strict";

import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/12.9.0/firebase-app.js";

import {
    getAuth,
    onAuthStateChanged,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signInWithPopup,
    signOut,
    sendEmailVerification,
    sendPasswordResetEmail,
    updateProfile,
    GoogleAuthProvider,
    GithubAuthProvider
} from "https://www.gstatic.com/firebasejs/12.9.0/firebase-auth.js";

const firebaseConfig = {

    apiKey:
        "AIzaSyAw0zt1S3xFhbb45WcjFOYs4pBrS_xYfBI",

    authDomain:
        "cyberwithsandiso.firebaseapp.com",

    projectId:
        "cyberwithsandiso",

    storageBucket:
        "cyberwithsandiso.firebasestorage.app",

    messagingSenderId:
        "944817950451",

    appId:
        "1:944817950451:web:4e58e982359c8e3b00b186"

};

const app =
    initializeApp(
        firebaseConfig
    );

const auth =
    getAuth(
        app
    );

const googleProvider =
    new GoogleAuthProvider();

const githubProvider =
    new GithubAuthProvider();

const labLoginForm =
    document.getElementById(
        "labLoginForm"
    );

const labEmail =
    document.getElementById(
        "labEmail"
    );

const labPassword =
    document.getElementById(
        "labPassword"
    );

const labConfirmPassword =
    document.getElementById(
        "labConfirmPassword"
    );

const labDisplayName =
    document.getElementById(
        "labDisplayName"
    );

const labNameGroup =
    document.getElementById(
        "labNameGroup"
    );

const labConfirmPasswordGroup =
    document.getElementById(
        "labConfirmPasswordGroup"
    );

const labAuthTitle =
    document.getElementById(
        "labAuthTitle"
    );

const labAuthDescription =
    document.getElementById(
        "labAuthDescription"
    );

const labAuthSubmitBtn =
    document.getElementById(
        "labAuthSubmitBtn"
    );

const labAuthMessage =
    document.getElementById(
        "labAuthMessage"
    );

const labSignInTab =
    document.getElementById(
        "labSignInTab"
    );

const labRegisterTab =
    document.getElementById(
        "labRegisterTab"
    );

const googleSignInBtn =
    document.getElementById(
        "googleSignInBtn"
    );

const githubSignInBtn =
    document.getElementById(
        "githubSignInBtn"
    );

const labForgotPasswordBtn =
    document.getElementById(
        "labForgotPasswordBtn"
    );

const labLogoutBtn =
    document.getElementById(
        "labLogoutBtn"
    );

let authMode =
    "signin";

function showAuthMessage(
    message,
    type = "info"
) {

    if (!labAuthMessage) {

        return;

    }

    labAuthMessage.textContent =
        message;

    labAuthMessage.className =
        `lab-feedback ${type}`;

}

function clearAuthMessage() {

    showAuthMessage(
        "",
        "info"
    );

}

function setLoading(
    loading
) {

    if (labAuthSubmitBtn) {

        labAuthSubmitBtn.disabled =
            loading;

        labAuthSubmitBtn.textContent =
            loading
                ? "Please wait..."
                : (
                    authMode === "register"
                        ? "Create Account"
                        : "Sign In"
                );

    }

    if (googleSignInBtn) {

        googleSignInBtn.disabled =
            loading;

    }

    if (githubSignInBtn) {

        githubSignInBtn.disabled =
            loading;

    }

}

function setAuthMode(
    mode
) {

    authMode =
        mode === "register"
            ? "register"
            : "signin";

    const registering =
        authMode === "register";

    labSignInTab
        ?.classList
        .toggle(
            "active",
            !registering
        );

    labRegisterTab
        ?.classList
        .toggle(
            "active",
            registering
        );

    labSignInTab
        ?.setAttribute(
            "aria-selected",
            String(
                !registering
            )
        );

    labRegisterTab
        ?.setAttribute(
            "aria-selected",
            String(
                registering
            )
        );

    if (labNameGroup) {

        labNameGroup.hidden =
            !registering;

    }

    if (labConfirmPasswordGroup) {

        labConfirmPasswordGroup.hidden =
            !registering;

    }

    if (labDisplayName) {

        labDisplayName.required =
            registering;

    }

    if (labConfirmPassword) {

        labConfirmPassword.required =
            registering;

    }

    if (labPassword) {

        labPassword.autocomplete =
            registering
                ? "new-password"
                : "current-password";

    }

    if (labAuthTitle) {

        labAuthTitle.textContent =
            registering
                ? "Create Account"
                : "Sign In";

    }

    if (labAuthDescription) {

        labAuthDescription.textContent =
            registering
                ? "Create a Cyber Security Lab account for protected learning features."
                : "Sign in to unlock protected Cyber Security Lab tools.";

    }

    if (labAuthSubmitBtn) {

        labAuthSubmitBtn.textContent =
            registering
                ? "Create Account"
                : "Sign In";

    }

    if (labForgotPasswordBtn) {

        labForgotPasswordBtn.hidden =
            registering;

    }

    clearAuthMessage();

}

function getFriendlyAuthError(
    error
) {

    const code =
        error?.code ||
        "";

    const messages = {

        "auth/invalid-credential":
            "Incorrect email or password.",

        "auth/invalid-email":
            "Enter a valid email address.",

        "auth/email-already-in-use":
            "An account already exists with this email address.",

        "auth/weak-password":
            "Choose a stronger password.",

        "auth/popup-closed-by-user":
            "The sign-in window was closed before authentication finished.",

        "auth/popup-blocked":
            "Your browser blocked the sign-in popup. Allow popups and try again.",

        "auth/account-exists-with-different-credential":
            "An account with this email already exists using another sign-in method.",

        "auth/network-request-failed":
            "Network error. Check your connection and try again.",

        "auth/too-many-requests":
            "Too many attempts. Please try again later.",

        "auth/operation-not-allowed":
            "This sign-in method is not enabled in Firebase Authentication."

    };

    return (
        messages[
            code
        ] ||
        error?.message ||
        "Authentication failed. Please try again."
    );

}

async function handleEmailPasswordAuth(
    event
) {

    event.preventDefault();

    clearAuthMessage();

    const email =
        String(
            labEmail?.value ||
            ""
        )
            .trim();

    const password =
        String(
            labPassword?.value ||
            ""
        );

    if (
        !email ||
        !password
    ) {

        showAuthMessage(
            "Enter your email address and password.",
            "error"
        );

        return;

    }

    try {

        setLoading(
            true
        );

        if (
            authMode ===
            "register"
        ) {

            const confirmPassword =
                String(
                    labConfirmPassword?.value ||
                    ""
                );

            const displayName =
                String(
                    labDisplayName?.value ||
                    ""
                )
                    .trim();

            if (
                password !==
                confirmPassword
            ) {

                throw new Error(
                    "Passwords do not match."
                );

            }

            const credential =
                await createUserWithEmailAndPassword(
                    auth,
                    email,
                    password
                );

            if (
                displayName
            ) {

                await updateProfile(
                    credential.user,
                    {
                        displayName
                    }
                );

            }

            if (
                !credential.user
                    .emailVerified
            ) {

                await sendEmailVerification(
                    credential.user
                );

            }

            await signOut(
                auth
            );

            showAuthMessage(
                "Account created. Verify your email, then sign in.",
                "success"
            );

        }
        else {

            const credential =
                await signInWithEmailAndPassword(
                    auth,
                    email,
                    password
                );

            const providerIds =
                credential.user
                    .providerData
                    .map(
                        provider =>
                            provider.providerId
                    );

            const passwordOnly =
                providerIds.length === 1 &&
                providerIds.includes(
                    "password"
                );

            if (
                passwordOnly &&
                !credential.user.emailVerified
            ) {

                await signOut(
                    auth
                );

                showAuthMessage(
                    "Verify your email before using protected lab features.",
                    "error"
                );

                return;

            }

            showAuthMessage(
                "Signed in successfully.",
                "success"
            );

        }

    }
    catch (error) {
showAuthMessage(
            getFriendlyAuthError(
                error
            ),
            "error"
        );

    }
    finally {

        setLoading(
            false
        );

    }

}

async function signInWithGoogle() {

    clearAuthMessage();

    try {

        setLoading(
            true
        );

        await signInWithPopup(
            auth,
            googleProvider
        );

        showAuthMessage(
            "Signed in with Google.",
            "success"
        );

    }
    catch (error) {
showAuthMessage(
            getFriendlyAuthError(
                error
            ),
            "error"
        );

    }
    finally {

        setLoading(
            false
        );

    }

}

async function signInWithGitHub() {

    clearAuthMessage();

    try {

        setLoading(
            true
        );

        await signInWithPopup(
            auth,
            githubProvider
        );

        showAuthMessage(
            "Signed in with GitHub.",
            "success"
        );

    }
    catch (error) {
showAuthMessage(
            getFriendlyAuthError(
                error
            ),
            "error"
        );

    }
    finally {

        setLoading(
            false
        );

    }

}

async function resetPassword() {

    clearAuthMessage();

    const email =
        String(
            labEmail?.value ||
            ""
        )
            .trim();

    if (!email) {

        showAuthMessage(
            "Enter your email address first.",
            "error"
        );

        labEmail?.focus();

        return;

    }

    try {

        await sendPasswordResetEmail(
            auth,
            email
        );

        showAuthMessage(
            "Password reset email sent. Check your inbox and spam folder.",
            "success"
        );

    }
    catch (error) {
showAuthMessage(
            getFriendlyAuthError(
                error
            ),
            "error"
        );

    }

}

async function logout() {

    try {

        await signOut(
            auth
        );

    }
    catch (error) {
}

}

onAuthStateChanged(
    auth,
    user => {

        const providerIds =
            user
                ?.providerData
                ?.map(
                    provider =>
                        provider.providerId
                ) ||
            [];

        const passwordOnly =
            providerIds.length === 1 &&
            providerIds.includes(
                "password"
            );

        const authenticated =
            Boolean(
                user &&
                (
                    !passwordOnly ||
                    user.emailVerified
                )
            );

        if (
            typeof window
                .setLabAuthenticated ===
            "function"
        ) {

            window.setLabAuthenticated(
                authenticated
            );

        }

    }
);

labLoginForm
    ?.addEventListener(
        "submit",
        handleEmailPasswordAuth
    );

labSignInTab
    ?.addEventListener(
        "click",
        () =>
            setAuthMode(
                "signin"
            )
    );

labRegisterTab
    ?.addEventListener(
        "click",
        () =>
            setAuthMode(
                "register"
            )
    );

googleSignInBtn
    ?.addEventListener(
        "click",
        signInWithGoogle
    );

githubSignInBtn
    ?.addEventListener(
        "click",
        signInWithGitHub
    );

labForgotPasswordBtn
    ?.addEventListener(
        "click",
        resetPassword
    );

labLogoutBtn
    ?.addEventListener(
        "click",
        logout
    );

setAuthMode(
    "signin"
);
