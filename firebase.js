"use strict";

/* =========================================================
   CYBERWITHSANDISO
   CYBER SECURITY LAB AUTHENTICATION
   firebase.js
========================================================= */


/* =========================================================
   FIREBASE IMPORTS
========================================================= */

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


/* =========================================================
   FIREBASE CONFIG
========================================================= */

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


/* =========================================================
   INITIALIZE
========================================================= */

const app =
    initializeApp(
        firebaseConfig
    );

const auth =
    getAuth(
        app
    );


/* =========================================================
   PROVIDERS
========================================================= */

const googleProvider =
    new GoogleAuthProvider();

const githubProvider =
    new GithubAuthProvider();


/* =========================================================
   DOM
========================================================= */

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


/* =========================================================
   STATE
========================================================= */

let authMode =
    "signin";


/* =========================================================
   UI HELPERS
========================================================= */

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


/* =========================================================
   FRIENDLY ERROR MESSAGES
========================================================= */

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


/* =========================================================
   EMAIL / PASSWORD
========================================================= */

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


            showAuthMessage(
                "Account created. A verification email has been sent.",
                "success"
            );

        }
        else {

            await signInWithEmailAndPassword(
                auth,
                email,
                password
            );


            showAuthMessage(
                "Signed in successfully.",
                "success"
            );

        }

    }
    catch (error) {

        console.error(
            "Email authentication failed:",
            error
        );


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


/* =========================================================
   GOOGLE
========================================================= */

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

        console.error(
            "Google sign-in failed:",
            error
        );


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


/* =========================================================
   GITHUB
========================================================= */

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

        console.error(
            "GitHub sign-in failed:",
            error
        );


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


/* =========================================================
   PASSWORD RESET
========================================================= */

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

        console.error(
            "Password reset failed:",
            error
        );


        showAuthMessage(
            getFriendlyAuthError(
                error
            ),
            "error"
        );

    }

}


/* =========================================================
   LOGOUT
========================================================= */

async function logout() {

    try {

        await signOut(
            auth
        );

    }
    catch (error) {

        console.error(
            "Logout failed:",
            error
        );

    }

}


/* =========================================================
   AUTH STATE
========================================================= */

onAuthStateChanged(
    auth,
    user => {

        const authenticated =
            Boolean(
                user
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


        if (
            authenticated
        ) {

            console.log(
                "Cyber Security Lab authenticated:",
                user.email ||
                user.uid
            );

        }
        else {

            console.log(
                "Cyber Security Lab visitor is signed out."
            );

        }

    }
);


/* =========================================================
   EVENTS
========================================================= */

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


/* =========================================================
   INITIAL MODE
========================================================= */

setAuthMode(
    "signin"
);


console.log(
    "Cyber Security Lab Firebase authentication loaded."
);
