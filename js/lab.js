/* =========================================================
   SANDISO MAYEKISO
   CYBER SECURITY LAB
   lab.js
========================================================= */

"use strict";


document.addEventListener(
    "DOMContentLoaded",
    () => {


        /* =================================================
           ELEMENTS
        ================================================= */

        const workspace =
            document.getElementById(
                "labWorkspace"
            );

        const workspaceTitle =
            document.getElementById(
                "workspaceTitle"
            );

        const closeWorkspaceBtn =
            document.getElementById(
                "closeWorkspaceBtn"
            );

        const toolButtons =
            document.querySelectorAll(
                "[data-open-tool]"
            );

        const toolPanels =
            document.querySelectorAll(
                ".lab-tool-panel"
            );

        const authModal =
            document.getElementById(
                "labAuthModal"
            );

        const openAuthBtn =
            document.getElementById(
                "openAuthBtn"
            );

        const closeAuthBtn =
            document.getElementById(
                "closeAuthBtn"
            );

        const labStatusText =
            document.getElementById(
                "labStatusText"
            );


        /* =================================================
           TOOL METADATA
        ================================================= */

        const toolTitles = {

            scanner:
                "Security Scanner",

            quiz:
                "Security Quiz",

            crypto:
                "Crypto Playground",

            tls:
                "HTTPS & TLS Inspector",

            "input-analysis":
                "Input Field Analysis",

            library:
                "Resources Library"

        };


        /*
         * If a signed-out visitor selects a protected tool,
         * remember it so we can open it after successful login.
         */

        let pendingProtectedTool =
            null;


        /* =================================================
           AUTH STATE HELPERS
        ================================================= */

        function isAuthenticated() {

            return document.body
                .classList
                .contains(
                    "lab-authenticated"
                );

        }


        window.setLabAuthenticated =
            function setLabAuthenticated(
                authenticated
            ) {

                const isNowAuthenticated =
                    Boolean(
                        authenticated
                    );


                document.body
                    .classList
                    .toggle(
                        "lab-authenticated",
                        isNowAuthenticated
                    );


                const logoutBtn =
                    document.getElementById(
                        "labLogoutBtn"
                    );


                if (logoutBtn) {

                    logoutBtn.hidden =
                        !isNowAuthenticated;

                }


                if (labStatusText) {

                    labStatusText.textContent =
                        isNowAuthenticated
                            ? "Protected tools unlocked"
                            : "Public tools available";

                }


                if (
                    isNowAuthenticated &&
                    authModal
                ) {

                    authModal.hidden =
                        true;

                }


                /*
                 * Re-open the protected tool the visitor
                 * originally selected before authentication.
                 */

                if (
                    isNowAuthenticated &&
                    pendingProtectedTool
                ) {

                    const toolToOpen =
                        pendingProtectedTool;


                    pendingProtectedTool =
                        null;


                    window.setTimeout(
                        () => {

                            openWorkspace(
                                toolToOpen
                            );

                        },
                        120
                    );

                }


                /*
                 * If the user signs out while a protected
                 * workspace is open, close it.
                 */

                if (
                    !isNowAuthenticated &&
                    workspace &&
                    !workspace.hidden
                ) {

                    const scannerPanel =
                        document.getElementById(
                            "scannerPanel"
                        );


                    if (
                        scannerPanel &&
                        !scannerPanel.hidden
                    ) {

                        closeWorkspace();

                    }

                }

            };


        /* =================================================
           WORKSPACE
        ================================================= */

        function hideAllPanels() {

            toolPanels.forEach(
                panel => {

                    panel.hidden =
                        true;

                }
            );

        }


        function closeWorkspace() {

            if (!workspace) {

                return;

            }


            hideAllPanels();


            workspace.hidden =
                true;

        }


        function openWorkspace(
            toolName
        ) {

            if (
                !workspace ||
                !toolName
            ) {

                return;

            }


            const panel =
                document.getElementById(
                    `${toolName}Panel`
                );


            if (!panel) {

                return;

            }


            hideAllPanels();


            panel.hidden =
                false;


            if (workspaceTitle) {

                workspaceTitle.textContent =
                    toolTitles[
                        toolName
                    ] ||
                    "Security Lab";

            }


            workspace.hidden =
                false;


            workspace.scrollIntoView({
                behavior:
                    "smooth",

                block:
                    "start"
            });

        }


        if (closeWorkspaceBtn) {

            closeWorkspaceBtn
                .addEventListener(
                    "click",
                    closeWorkspace
                );

        }


        /* =================================================
           TOOL ACCESS
        ================================================= */

        toolButtons.forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        const toolName =
                            button.dataset
                                .openTool;


                        const card =
                            button.closest(
                                ".lab-tool-card"
                            );


                        const isProtected =
                            card?.dataset
                                .protected ===
                                "true";


                        if (
                            isProtected &&
                            !isAuthenticated()
                        ) {

                            pendingProtectedTool =
                                toolName;


                            if (authModal) {

                                authModal.hidden =
                                    false;

                            }


                            return;

                        }


                        openWorkspace(
                            toolName
                        );

                    }
                );

            }
        );


        /* =================================================
           AUTH MODAL
        ================================================= */

        function closeAuthModal(
            clearPending = true
        ) {

            if (authModal) {

                authModal.hidden =
                    true;

            }


            if (clearPending) {

                pendingProtectedTool =
                    null;

            }

        }


        if (openAuthBtn) {

            openAuthBtn
                .addEventListener(
                    "click",
                    () => {

                        pendingProtectedTool =
                            null;


                        if (authModal) {

                            authModal.hidden =
                                false;

                        }

                    }
                );

        }


        if (closeAuthBtn) {

            closeAuthBtn
                .addEventListener(
                    "click",
                    closeAuthModal
                );

        }


        if (authModal) {

            authModal
                .addEventListener(
                    "click",
                    event => {

                        if (
                            event.target ===
                            authModal
                        ) {

                            closeAuthModal();

                        }

                    }
                );

        }


        document.addEventListener(
            "keydown",
            event => {

                if (
                    event.key ===
                    "Escape"
                ) {

                    closeAuthModal();

                }

            }
        );


        /* =================================================
           SECURITY QUIZ
        ================================================= */

        const quizQuestion =
            document.getElementById(
                "quizQuestion"
            );

        const quizOptions =
            document.getElementById(
                "quizOptions"
            );

        const quizFeedback =
            document.getElementById(
                "quizFeedback"
            );


        const quizQuestions = [

            {
                question:
                    "Which protocol translates domain names into IP addresses?",

                answers:
                    [
                        "FTP",
                        "DNS",
                        "SSH",
                        "SMTP"
                    ],

                correct:
                    "DNS"
            },

            {
                question:
                    "Which HTTP response class represents client-side errors?",

                answers:
                    [
                        "1xx",
                        "2xx",
                        "4xx",
                        "5xx"
                    ],

                correct:
                    "4xx"
            },

            {
                question:
                    "Which tool is primarily used for packet capture and protocol analysis?",

                answers:
                    [
                        "Wireshark",
                        "Hydra",
                        "John",
                        "Nikto"
                    ],

                correct:
                    "Wireshark"
            },

            {
                question:
                    "Which control best helps prevent SQL injection in application database queries?",

                answers:
                    [
                        "Prepared statements",
                        "CSS escaping",
                        "DNS filtering",
                        "Port forwarding"
                    ],

                correct:
                    "Prepared statements"
            },

            {
                question:
                    "What does the principle of least privilege mean?",

                answers:
                    [
                        "Give every user admin access",
                        "Grant only the access required",
                        "Disable authentication",
                        "Allow unrestricted network access"
                    ],

                correct:
                    "Grant only the access required"
            }

        ];


        let quizIndex =
            0;


        function renderQuizQuestion() {

            if (
                !quizQuestion ||
                !quizOptions
            ) {

                return;

            }


            const item =
                quizQuestions[
                    quizIndex
                ];


            quizQuestion.textContent =
                item.question;


            quizOptions.innerHTML =
                "";


            item.answers
                .forEach(
                    answer => {

                        const button =
                            document.createElement(
                                "button"
                            );


                        button.type =
                            "button";


                        button.textContent =
                            answer;


                        button.dataset.answer =
                            answer;


                        button.addEventListener(
                            "click",
                            () =>
                                answerQuiz(
                                    button,
                                    answer
                                )
                        );


                        quizOptions
                            .appendChild(
                                button
                            );

                    }
                );


            if (quizFeedback) {

                quizFeedback.textContent =
                    "";

                quizFeedback.className =
                    "lab-feedback";

            }

        }


        function answerQuiz(
            selectedButton,
            answer
        ) {

            const item =
                quizQuestions[
                    quizIndex
                ];


            const buttons =
                quizOptions
                    ?.querySelectorAll(
                        "button"
                    ) ||
                [];


            buttons.forEach(
                button => {

                    button.disabled =
                        true;


                    if (
                        button.dataset.answer ===
                        item.correct
                    ) {

                        button.classList.add(
                            "correct"
                        );

                    }

                }
            );


            const correct =
                answer ===
                item.correct;


            if (!correct) {

                selectedButton
                    .classList
                    .add(
                        "incorrect"
                    );

            }


            if (quizFeedback) {

                quizFeedback.textContent =
                    correct
                        ? "Correct. Loading the next question..."
                        : `Not quite. The correct answer is ${item.correct}.`;


                quizFeedback.className =
                    correct
                        ? "lab-feedback success"
                        : "lab-feedback error";

            }


            window.setTimeout(
                () => {

                    quizIndex =
                        (
                            quizIndex +
                            1
                        ) %
                        quizQuestions.length;


                    renderQuizQuestion();

                },
                1400
            );

        }


        renderQuizQuestion();


        /* =================================================
           BASE64
        ================================================= */

        const cryptoInput =
            document.getElementById(
                "cryptoInput"
            );

        const cryptoOutput =
            document.getElementById(
                "cryptoOutput"
            );

        const base64EncodeBtn =
            document.getElementById(
                "base64EncodeBtn"
            );

        const base64DecodeBtn =
            document.getElementById(
                "base64DecodeBtn"
            );

        const sha256Btn =
            document.getElementById(
                "sha256Btn"
            );


        function encodeBase64(
            value
        ) {

            const bytes =
                new TextEncoder()
                    .encode(
                        value
                    );


            let binary =
                "";


            bytes.forEach(
                byte => {

                    binary +=
                        String.fromCharCode(
                            byte
                        );

                }
            );


            return btoa(
                binary
            );

        }


        function decodeBase64(
            value
        ) {

            const binary =
                atob(
                    value
                );


            const bytes =
                Uint8Array.from(
                    binary,
                    char =>
                        char.charCodeAt(
                            0
                        )
                );


            return new TextDecoder()
                .decode(
                    bytes
                );

        }


        if (base64EncodeBtn) {

            base64EncodeBtn
                .addEventListener(
                    "click",
                    () => {

                        if (!cryptoOutput) {

                            return;

                        }


                        const value =
                            cryptoInput?.value ||
                            "";


                        cryptoOutput.textContent =
                            value
                                ? encodeBase64(
                                    value
                                )
                                : "Enter text first.";

                    }
                );

        }


        if (base64DecodeBtn) {

            base64DecodeBtn
                .addEventListener(
                    "click",
                    () => {

                        if (!cryptoOutput) {

                            return;

                        }


                        const value =
                            cryptoInput?.value
                                ?.trim() ||
                            "";


                        if (!value) {

                            cryptoOutput.textContent =
                                "Enter Base64 text first.";


                            return;

                        }


                        try {

                            cryptoOutput.textContent =
                                decodeBase64(
                                    value
                                );

                        }
                        catch {

                            cryptoOutput.textContent =
                                "Invalid Base64 input.";

                        }

                    }
                );

        }


        /* =================================================
           SHA-256
        ================================================= */

        async function sha256(
            value
        ) {

            if (
                !window.crypto
                    ?.subtle
            ) {

                throw new Error(
                    "Web Crypto is unavailable."
                );

            }


            const bytes =
                new TextEncoder()
                    .encode(
                        value
                    );


            const digest =
                await window.crypto
                    .subtle
                    .digest(
                        "SHA-256",
                        bytes
                    );


            return Array
                .from(
                    new Uint8Array(
                        digest
                    )
                )
                .map(
                    byte =>
                        byte
                            .toString(
                                16
                            )
                            .padStart(
                                2,
                                "0"
                            )
                )
                .join(
                    ""
                );

        }


        if (sha256Btn) {

            sha256Btn
                .addEventListener(
                    "click",
                    async () => {

                        if (!cryptoOutput) {

                            return;

                        }


                        const value =
                            cryptoInput?.value ||
                            "";


                        if (!value) {

                            cryptoOutput.textContent =
                                "Enter text first.";


                            return;

                        }


                        try {

                            cryptoOutput.textContent =
                                await sha256(
                                    value
                                );

                        }
                        catch (err) {

                            console.error(
                                err
                            );


                            cryptoOutput.textContent =
                                "Unable to calculate SHA-256 in this browser.";

                        }

                    }
                );

        }


        /* =================================================
           INPUT ANALYSIS
        ================================================= */

        const inputAnalysisText =
            document.getElementById(
                "inputAnalysisText"
            );

        const analyzeInputBtn =
            document.getElementById(
                "analyzeInputBtn"
            );

        const inputAnalysisOutput =
            document.getElementById(
                "inputAnalysisOutput"
            );


        function analyzeInput(
            value
        ) {

            const text =
                String(
                    value ||
                    ""
                );


            const observations =
                [];


            observations.push(
                `Length: ${text.length} characters`
            );


            if (
                /<[^>]*>/.test(
                    text
                )
            ) {

                observations.push(
                    "Contains HTML-like markup."
                );

            }


            if (
                /['"`;]/.test(
                    text
                )
            ) {

                observations.push(
                    "Contains quote or statement-delimiter characters that applications should handle safely."
                );

            }


            if (
                /https?:\/\//i.test(
                    text
                )
            ) {

                observations.push(
                    "Contains a URL."
                );

            }


            if (
                /\s/.test(
                    text
                )
            ) {

                observations.push(
                    "Contains whitespace."
                );

            }


            if (
                !observations.length
            ) {

                observations.push(
                    "No notable characteristics detected."
                );

            }


            observations.push(
                "This analysis is educational only and does not determine whether input is malicious."
            );


            return observations;

        }


        if (analyzeInputBtn) {

            analyzeInputBtn
                .addEventListener(
                    "click",
                    () => {

                        if (!inputAnalysisOutput) {

                            return;

                        }


                        const result =
                            analyzeInput(
                                inputAnalysisText
                                    ?.value
                            );


                        inputAnalysisOutput.hidden =
                            false;


                        inputAnalysisOutput.textContent =
                            result
                                .map(
                                    item =>
                                        `• ${item}`
                                )
                                .join(
                                    "\n"
                                );

                    }
                );

        }


        /* =================================================
           SCANNER — SAFE BROWSER DEMO
        ================================================= */

        const scannerForm =
            document.getElementById(
                "scannerForm"
            );

        const scannerTarget =
            document.getElementById(
                "scannerTarget"
            );

        const scannerOutput =
            document.getElementById(
                "scannerOutput"
            );


        function normalizeTarget(
            value
        ) {

            return String(
                value ||
                ""
            )
                .trim()
                .replace(
                    /^https?:\/\//i,
                    ""
                )
                .replace(
                    /\/.*$/,
                    ""
                );

        }


        function isValidHostname(
            value
        ) {

            if (
                !value ||
                value.length >
                253
            ) {

                return false;

            }


            return /^[a-z0-9.-]+$/i
                .test(
                    value
                );

        }


        if (scannerForm) {

            scannerForm
                .addEventListener(
                    "submit",
                    event => {

                        event.preventDefault();


                        if (!scannerOutput) {

                            return;

                        }


                        const target =
                            normalizeTarget(
                                scannerTarget
                                    ?.value
                            );


                        scannerOutput.hidden =
                            false;


                        if (
                            !isValidHostname(
                                target
                            )
                        ) {

                            scannerOutput.textContent =
                                "Enter a valid authorized hostname.";


                            return;

                        }


                        /*
                         * IMPORTANT:
                         * This browser tool intentionally does not
                         * perform network scanning.
                         *
                         * Real authorized scanning should be handled
                         * by a trusted backend that verifies scope and
                         * applies appropriate controls.
                         */

                        scannerOutput.textContent =
                            [
                                `Target: ${target}`,
                                "",
                                "Browser demo mode:",
                                "• Target format accepted.",
                                "• No network scan was performed.",
                                "• No ports, services or vulnerabilities were probed.",
                                "",
                                "For a future authenticated scanner, route requests through a trusted backend with explicit authorization controls."
                            ].join(
                                "\n"
                            );

                    }
                );

        }


        /* =================================================
           INITIAL STATE
        ================================================= */

        closeWorkspace();


        if (
            typeof window
                .setLabAuthenticated ===
            "function"
        ) {

            window.setLabAuthenticated(
                false
            );

        }


        console.log(
            "Cyber Security Lab initialized"
        );

    }
);
