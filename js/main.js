"use strict";

document.addEventListener("DOMContentLoaded", () => {

    const navToggle =
        document.getElementById("navToggle");

    const navMenu =
        document.getElementById("navMenu");

    const navLinks =
        document.querySelectorAll(
            '.nav-menu a[href^="#"]'
        );

    const sections =
        document.querySelectorAll(
            "main section[id]"
        );

    const projectFilters =
        document.querySelectorAll(
            ".project-filter"
        );

    const projectCards =
        document.querySelectorAll(
            ".project-card"
        );

    const yearElement =
        document.getElementById("year");

    

    if (yearElement) {

        yearElement.textContent =
            new Date().getFullYear();

    }

    

    function openNavigation() {

        if (
            !navToggle ||
            !navMenu
        ) {

            return;

        }

        navMenu.classList.add("open");

        navToggle.classList.add("active");

        navToggle.setAttribute(
            "aria-expanded",
            "true"
        );

        navToggle.setAttribute(
            "aria-label",
            "Close navigation menu"
        );

    }

    function closeNavigation() {

        if (
            !navToggle ||
            !navMenu
        ) {

            return;

        }

        navMenu.classList.remove("open");

        navToggle.classList.remove("active");

        navToggle.setAttribute(
            "aria-expanded",
            "false"
        );

        navToggle.setAttribute(
            "aria-label",
            "Open navigation menu"
        );

    }

    function toggleNavigation() {

        if (!navMenu) {

            return;

        }

        if (
            navMenu.classList.contains("open")
        ) {

            closeNavigation();

        } else {

            openNavigation();

        }

    }

    if (navToggle) {

        navToggle.addEventListener(
            "click",
            event => {

                event.stopPropagation();

                toggleNavigation();

            }
        );

    }

    navLinks.forEach(link => {

        link.addEventListener(
            "click",
            () => {

                closeNavigation();

            }
        );

    });

    document.addEventListener(
        "click",
        event => {

            if (
                !navMenu ||
                !navToggle ||
                !navMenu.classList.contains("open")
            ) {

                return;

            }

            const clickedInsideMenu =
                navMenu.contains(
                    event.target
                );

            const clickedToggle =
                navToggle.contains(
                    event.target
                );

            if (
                !clickedInsideMenu &&
                !clickedToggle
            ) {

                closeNavigation();

            }

        }
    );

    document.addEventListener(
        "keydown",
        event => {

            if (
                event.key === "Escape"
            ) {

                closeNavigation();

            }

        }
    );

    window.addEventListener(
        "resize",
        () => {

            if (
                window.innerWidth > 860
            ) {

                closeNavigation();

            }

        }
    );

    

    function filterProjects(
        selectedFilter
    ) {

        projectCards.forEach(card => {

            const categories =
                (
                    card.dataset.category ||
                    ""
                )
                .toLowerCase()
                .split(/\s+/)
                .filter(Boolean);

            const shouldShow =
                selectedFilter === "all" ||
                categories.includes(
                    selectedFilter
                );

            card.classList.toggle(
                "hidden",
                !shouldShow
            );

        });

    }

    projectFilters.forEach(button => {

        button.addEventListener(
            "click",
            () => {

                const selectedFilter =
                    (
                        button.dataset.filter ||
                        "all"
                    ).toLowerCase();

                projectFilters.forEach(
                    filterButton => {

                        filterButton.classList.remove(
                            "active"
                        );

                        filterButton.setAttribute(
                            "aria-pressed",
                            "false"
                        );

                    }
                );

                button.classList.add(
                    "active"
                );

                button.setAttribute(
                    "aria-pressed",
                    "true"
                );

                filterProjects(
                    selectedFilter
                );

            }
        );

    });

    

    projectFilters.forEach(
        button => {

            button.setAttribute(
                "aria-pressed",
                button.classList.contains(
                    "active"
                )
                    ? "true"
                    : "false"
            );

        }
    );

    filterProjects("all");

    

    function setActiveNavigation(
        sectionId
    ) {

        navLinks.forEach(link => {

            const linkTarget =
                link.getAttribute(
                    "href"
                );

            const isActive =
                linkTarget ===
                `#${sectionId}`;

            link.classList.toggle(
                "active",
                isActive
            );

        });

    }

    if (
        "IntersectionObserver" in window &&
        sections.length
    ) {

        const sectionObserver =
            new IntersectionObserver(
                entries => {

                    const visibleSections =
                        entries
                            .filter(
                                entry =>
                                    entry.isIntersecting
                            )
                            .sort(
                                (a, b) =>
                                    b.intersectionRatio -
                                    a.intersectionRatio
                            );

                    if (
                        !visibleSections.length
                    ) {

                        return;

                    }

                    const activeSection =
                        visibleSections[0]
                            .target
                            .id;

                    if (activeSection) {

                        setActiveNavigation(
                            activeSection
                        );

                    }

                },
                {
                    root:
                        null,

                    rootMargin:
                        "-20% 0px -55% 0px",

                    threshold:
                        [
                            0,
                            0.15,
                            0.35,
                            0.55
                        ]
                }
            );

        sections.forEach(section => {

            sectionObserver.observe(
                section
            );

        });

    }

    

    const internalLinks =
        document.querySelectorAll(
            'a[href^="#"]'
        );

    internalLinks.forEach(link => {

        link.addEventListener(
            "click",
            event => {

                const href =
                    link.getAttribute(
                        "href"
                    );

                if (
                    !href ||
                    href === "#"
                ) {

                    return;

                }

                const target =
                    document.querySelector(
                        href
                    );

                if (!target) {

                    return;

                }

                event.preventDefault();

                target.scrollIntoView({
                    behavior:
                        "smooth",

                    block:
                        "start"
                });

                

                if (
                    history.pushState
                ) {

                    history.pushState(
                        null,
                        "",
                        href
                    );

                }

            }
        );

    });

    

    const revealElements =
        document.querySelectorAll(
            [
                ".section-heading",
                ".about-copy",
                ".about-facts",
                ".experience-card",
                ".project-card",
                ".academy-copy",
                ".academy-visual",
                ".skill-group",
                ".cert-card",
                ".publication-card",
                ".security-lab-cta",
                ".contact-item"
            ].join(",")
        );

    revealElements.forEach(
        element => {

            element.classList.add(
                "reveal"
            );

        }
    );

    if (
        "IntersectionObserver" in window
    ) {

        const revealObserver =
            new IntersectionObserver(
                entries => {

                    entries.forEach(
                        entry => {

                            if (
                                !entry.isIntersecting
                            ) {

                                return;

                            }

                            entry.target.classList.add(
                                "revealed"
                            );

                            revealObserver.unobserve(
                                entry.target
                            );

                        }
                    );

                },
                {
                    threshold:
                        0.08,

                    rootMargin:
                        "0px 0px -40px 0px"
                }
            );

        revealElements.forEach(
            element => {

                revealObserver.observe(
                    element
                );

            }
        );

    } else {

        revealElements.forEach(
            element => {

                element.classList.add(
                    "revealed"
                );

            }
        );

    }

    

    const siteHeader =
        document.querySelector(
            ".site-header"
        );

    function updateHeaderState() {

        if (!siteHeader) {

            return;

        }

        siteHeader.classList.toggle(
            "scrolled",
            window.scrollY > 20
        );

    }

    updateHeaderState();

    window.addEventListener(
        "scroll",
        updateHeaderState,
        {
            passive:
                true
        }
    );

    

    const terminalCursor =
        document.querySelector(
            ".terminal-cursor"
        );

    if (terminalCursor) {

        terminalCursor.setAttribute(
            "aria-hidden",
            "true"
        );

    }

    

    const externalLinks =
        document.querySelectorAll(
            'a[target="_blank"]'
        );

    externalLinks.forEach(link => {

        const relValues =
            new Set(
                (
                    link.getAttribute(
                        "rel"
                    ) || ""
                )
                .split(/\s+/)
                .filter(Boolean)
            );

        relValues.add(
            "noopener"
        );

        relValues.add(
            "noreferrer"
        );

        link.setAttribute(
            "rel",
            Array.from(
                relValues
            ).join(" ")
        );

    });

    

    if (window.location.hash) {

        const initialTarget =
            document.querySelector(
                window.location.hash
            );

        if (initialTarget) {

            window.setTimeout(
                () => {

                    initialTarget.scrollIntoView({
                        behavior:
                            "auto",

                        block:
                            "start"
                    });

                },
                50
            );

        }

    }

});
