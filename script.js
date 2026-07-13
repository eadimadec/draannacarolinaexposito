document.addEventListener("DOMContentLoaded", () => {
    const header = document.querySelector(".header");
    const menuToggle = document.querySelector(".menu-toggle");
    const navbar = document.querySelector(".navbar");
    const hero = document.querySelector(".hero");
    const heroBg = document.querySelector(".hero-bg");

    document.querySelectorAll('a[href*="wa.me/"]').forEach(link => {
        link.addEventListener("click", () => {
            if (typeof window.gtag === "function") {
                window.gtag("event", "whatsapp_click");
            }
        });
    });

    const setHeaderState = () => {
        if (!header) return;
        header.classList.toggle("scrolled", window.scrollY > 24);
    };
    setHeaderState();
    window.addEventListener("scroll", setHeaderState, { passive: true });

    if (menuToggle && navbar) {
        menuToggle.addEventListener("click", () => {
            const isActive = navbar.classList.toggle("active");
            menuToggle.classList.toggle("active", isActive);
            menuToggle.setAttribute("aria-expanded", String(isActive));
        });

        document.querySelectorAll(".nav-link, .btn-cta-nav").forEach(link => {
            link.addEventListener("click", () => {
                navbar.classList.remove("active");
                menuToggle.classList.remove("active");
                menuToggle.setAttribute("aria-expanded", "false");
            });
        });
    }

    if (hero && heroBg && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        let ticking = false;
        const updateHeroMotion = () => {
            const shift = Math.min(window.scrollY * 0.08, 42);
            heroBg.style.setProperty("--hero-shift", `${shift}px`);
            ticking = false;
        };
        window.addEventListener("scroll", () => {
            if (!ticking) {
                window.requestAnimationFrame(updateHeroMotion);
                ticking = true;
            }
        }, { passive: true });
    }

    const animatedElements = document.querySelectorAll(".reveal, .reveal-up, .reveal-left, .reveal-right");

    if ("IntersectionObserver" in window) {
        const animationObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("active-reveal");
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.14,
            rootMargin: "0px 0px -36px 0px"
        });

        animatedElements.forEach((el, index) => {
            if (!el.classList.contains("delay-1") && !el.classList.contains("delay-2") && !el.classList.contains("delay-3")) {
                el.style.transitionDelay = `${Math.min(index % 3, 2) * 0.06}s`;
            }
            animationObserver.observe(el);
        });
    } else {
        animatedElements.forEach(el => el.classList.add("active-reveal"));
    }

    const track = document.querySelector(".carousel-track");
    const prevBtn = document.querySelector(".carousel-btn.prev");
    const nextBtn = document.querySelector(".carousel-btn.next");
    const dotsContainer = document.querySelector(".carousel-dots");
    const currentCounter = document.querySelector(".carousel-current");
    const totalCounter = document.querySelector(".carousel-total");
    const slides = document.querySelectorAll(".carousel-slide");

    if (track && prevBtn && nextBtn && slides.length) {
        let index = 0;
        let autoPlay;

        const itemsPerPage = () => {
            if (window.innerWidth > 1050) return 3;
            if (window.innerWidth > 820) return 2;
            return 1;
        };

        const pageCount = () => Math.max(1, slides.length - itemsPerPage() + 1);
        const maxIndex = () => pageCount() - 1;
        const formatNumber = (value) => String(value).padStart(2, "0");

        const renderDots = () => {
            if (!dotsContainer) return;
            dotsContainer.innerHTML = "";
            Array.from({ length: pageCount() }).forEach((_, dotIndex) => {
                const dot = document.createElement("button");
                dot.type = "button";
                dot.className = "carousel-dot";
                dot.setAttribute("aria-label", `Ir para posição ${dotIndex + 1} da galeria`);
                dot.addEventListener("click", () => {
                    index = dotIndex;
                    updateCarousel();
                    resetAutoplay();
                });
                dotsContainer.appendChild(dot);
            });
        };

        const syncDots = () => {
            if (!dotsContainer) return;
            dotsContainer.querySelectorAll('.carousel-dot').forEach((dot, dotIndex) => {
                dot.classList.toggle('active', dotIndex === index);
            });
        };

        const updateCarousel = () => {
            index = Math.min(index, maxIndex());
            const slideWidth = slides[0].getBoundingClientRect().width;
            const computedStyle = window.getComputedStyle(track);
            const gap = parseFloat(computedStyle.columnGap || computedStyle.gap || "22");
            track.style.transform = `translate3d(-${index * (slideWidth + gap)}px, 0, 0)`;

            if (currentCounter) currentCounter.textContent = formatNumber(index + 1);
            if (totalCounter) totalCounter.textContent = formatNumber(pageCount());
            syncDots();
        };

        const goNext = () => {
            index = index < maxIndex() ? index + 1 : 0;
            updateCarousel();
        };

        const resetAutoplay = () => {
            window.clearInterval(autoPlay);
            if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
                autoPlay = window.setInterval(goNext, 6200);
            }
        };

        nextBtn.addEventListener("click", () => { goNext(); resetAutoplay(); });
        prevBtn.addEventListener("click", () => {
            index = index > 0 ? index - 1 : maxIndex();
            updateCarousel();
            resetAutoplay();
        });

        window.addEventListener("resize", () => {
            renderDots();
            updateCarousel();
        }, { passive: true });

        renderDots();
        updateCarousel();
        resetAutoplay();
    }
});
