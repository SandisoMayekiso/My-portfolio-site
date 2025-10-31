document.addEventListener("DOMContentLoaded", () => {
  // Smooth scroll for nav links
  document.querySelectorAll('nav a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      e.preventDefault();
      const targetId = this.getAttribute("href").substring(1);
      const targetElement = document.getElementById(targetId);
      if (targetElement) {
        targetElement.scrollIntoView({ behavior: "smooth" });
      }
    });
  });

  // Typing effect
  const typeText = document.querySelector("header p");
  const words = [
    "Certified Cybersecurity Professional",
    "Network & Systems Specialist",
    "Python & Linux Enthusiast",
  ];
  let wordIndex = 0;
  let charIndex = 0;
  let isDeleting = false;

  function typeEffect() {
    if (!typeText) return;
    const current = words[wordIndex];
    if (isDeleting) {
      typeText.textContent = current.substring(0, charIndex--);
    } else {
      typeText.textContent = current.substring(0, charIndex++);
    }

    if (!isDeleting && charIndex === current.length) {
      isDeleting = true;
      setTimeout(typeEffect, 1500);
    } else if (isDeleting && charIndex === 0) {
      isDeleting = false;
      wordIndex = (wordIndex + 1) % words.length;
      setTimeout(typeEffect, 500);
    } else {
      setTimeout(typeEffect, isDeleting ? 50 : 100);
    }
  }
  typeEffect();

  // Scroll to top button
  const scrollBtn = document.createElement("button");
  scrollBtn.innerHTML = '<i class="fas fa-arrow-up"></i>';
  scrollBtn.id = "scrollToTop";
  scrollBtn.title = "Back to Top";
  Object.assign(scrollBtn.style, {
    display: "none",
    position: "fixed",
    bottom: "20px",
    right: "20px",
    padding: "10px",
    borderRadius: "8px",
    border: "none",
    backgroundColor: "#007BFF",
    color: "#fff",
    fontSize: "1.2rem",
    cursor: "pointer",
  });
  document.body.appendChild(scrollBtn);

  scrollBtn.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  window.addEventListener("scroll", () => {
    scrollBtn.style.display = window.scrollY > 300 ? "block" : "none";
    highlightNav();
  });

  // Fade-in sections
  const sections = document.querySelectorAll("section");
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) entry.target.classList.add("visible");
      });
    },
    { threshold: 0.1 }
  );
  sections.forEach((section) => observer.observe(section));

  // Highlight active nav link
  function highlightNav() {
    const scrollY = window.scrollY;
    document.querySelectorAll("section").forEach((sec) => {
      const offset = sec.offsetTop - 100;
      const height = sec.offsetHeight;
      const id = sec.getAttribute("id");
      if (scrollY >= offset && scrollY < offset + height) {
        document.querySelectorAll("nav a").forEach((a) => a.classList.remove("active"));
        const activeLink = document.querySelector(`nav a[href="#${id}"]`);
        if (activeLink) activeLink.classList.add("active");
      }
    });
  }
  highlightNav();

  // Simulate blocked intrusion count
  let blockedCount = 1293;
  const countDisplay = document.getElementById("blocked-count");
  setInterval(() => {
    const increase = Math.floor(Math.random() * 5) + 1;
    blockedCount += increase;
    if (countDisplay) countDisplay.textContent = blockedCount;
  }, 3000);

  // Theme toggle
  const themeBtn = document.getElementById("theme-toggle");
  if (themeBtn) {
    themeBtn.addEventListener("click", () => {
      document.body.classList.toggle("light-mode");
    });
  }

  // Responsive menu toggle
  const toggleBtn = document.querySelector(".menu-toggle");
  if (toggleBtn) {
    toggleBtn.addEventListener("click", () => {
      document.querySelector("nav ul.menu").classList.toggle("show");
    });
  }

  // Portfolio filtering
  document.querySelectorAll(".filters button").forEach((btn) => {
    btn.addEventListener("click", () => {
      const cat = btn.dataset.filter;
      document.querySelectorAll(".project-card").forEach((card) => {
        card.style.display = cat === "all" || card.dataset.category === cat ? "block" : "none";
      });
    });
  });

  // Contact form submission
  const form = document.querySelector(".contact-form");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      const formData = new FormData(form);
      fetch("https://formspree.io/f/yourformid", {
        method: "POST",
        body: formData,
        headers: { Accept: "application/json" },
      })
        .then((response) => {
          if (response.ok) {
            alert("Thank you for your message!");
            form.reset();
          } else {
            alert("There was a problem with your submission.");
          }
        })
        .catch((error) => {
          console.error("Error:", error);
          alert("There was a problem with your submission.");
        });
    });
  }
});

// ===== Dynamic Resource Loading =====
function addResource(type, attributes) {
  const el = document.createElement(type);
  Object.entries(attributes).forEach(([key, value]) => (el[key] = value));
  if (type === "link") document.head.appendChild(el);
  else document.body.appendChild(el);
}

// External Libraries
addResource("link", {
  rel: "stylesheet",
  href: "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/css/all.min.css",
});
addResource("link", {
  rel: "stylesheet",
  href: "https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap",
});
addResource("link", {
  rel: "stylesheet",
  href: "https://fonts.googleapis.com/icon?family=Material+Icons",
});
addResource("link", {
  rel: "stylesheet",
  href: "https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css",
});
addResource("script", {
  src: "https://code.jquery.com/jquery-3.5.1.min.js",
  defer: true,
});
addResource("script", {
  src: "https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.16.0/umd/popper.min.js",
  defer: true,
});
addResource("script", {
  src: "https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/js/bootstrap.bundle.min.js",
  defer: true,
});
addResource("link", {
  rel: "stylesheet",
  href: "https://cdnjs.cloudflare.com/ajax/libs/aos/2.3.4/aos.css",
});
addResource("script", {
  src: "https://cdnjs.cloudflare.com/ajax/libs/aos/2.3.4/aos.js",
  defer: true,
  onload: () => AOS.init(),
});
import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const certifications = [
  {
    title: "CompTIA A+",
    image: "/certifications/comptia-a-plus.jpg",
  },
  {
    title: "CompTIA Network+",
    image: "/certifications/comptia-network-plus.jpg",
  },
  {
    title: "CompTIA Server+",
    image: "/certifications/comptia-server-plus.jpg",
  },
  {
    title: "CompTIA Security+",
    image: "/certifications/comptia-security-plus.jpg",
  },
  {
    title: "Cisco CCNA",
    image: "/certifications/cisco-ccna.jpg",
  },
  {
    title: "TryHackMe Cyber Security 101",
    image: "/certifications/tryhackme-cybersecurity101.jpg",
  },
  {
    title: "TryHackMe Pre-Security",
    image: "/certifications/tryhackme-presecurity.jpg",
  },
  {
    title: "HyperionDev Cybersecurity Bootcamp",
    image: "/certifications/hyperiondev-bootcamp.jpg",
  },
];

export default function Certifications() {
  const [current, setCurrent] = useState(0);

  const nextCert = () => {
    setCurrent((prev) => (prev + 1) % certifications.length);
  };

  const prevCert = () => {
    setCurrent((prev) =>
      prev === 0 ? certifications.length - 1 : prev - 1
    );
  };

  return (
    <section id="certifications" className="py-16 bg-gray-950 text-white relative overflow-hidden">
      <div className="max-w-4xl mx-auto text-center px-4">
        <h2 className="text-3xl font-bold mb-8">Certifications</h2>

        <div className="relative flex items-center justify-center">
          {/* Left Arrow */}
          <button
            onClick={prevCert}
            className="absolute left-0 z-10 bg-gray-800 hover:bg-gray-700 p-3 rounded-full shadow-md transition"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          {/* Certificate Image */}
          <div className="overflow-hidden w-full max-w-md rounded-2xl shadow-lg">
            <img
              src={certifications[current].image}
              alt={certifications[current].title}
              className="w-full h-auto object-contain transition-transform duration-500 ease-in-out"
            />
            <h3 className="mt-4 text-lg font-semibold">{certifications[current].title}</h3>
          </div>

          {/* Right Arrow */}
          <button
            onClick={nextCert}
            className="absolute right-0 z-10 bg-gray-800 hover:bg-gray-700 p-3 rounded-full shadow-md transition"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>

        {/* Buttons Section */}
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <a
            href="/Sandiso_Certifications.pdf"
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-full text-white font-semibold transition"
            target="_blank"
            rel="noopener noreferrer"
          >
            View PDF
          </a>
          <a
            href="/Sandiso_Certifications.pdf"
            download
            className="px-6 py-2 border border-blue-600 hover:bg-blue-600 rounded-full text-white font-semibold transition"
          >
            Download PDF
          </a>
        </div>
      </div>
    </section>
  );
}
<script>
document.addEventListener("DOMContentLoaded", () => {
  const track = document.querySelector(".cert-track");
  const leftBtn = document.querySelector(".scroll-left");
  const rightBtn = document.querySelector(".scroll-right");

  leftBtn.addEventListener("click", () => {
    track.scrollBy({ left: -300, behavior: "smooth" });
  });

  rightBtn.addEventListener("click", () => {
    track.scrollBy({ left: 300, behavior: "smooth" });
  });
});
</script>


import Certifications from "./components/Certifications";

function App() {
  return (
    <>
      {/* Other sections */}
      <Certifications />
      {/* Other sections */}
    </>
  );
}

export default App;
<script>
  function openModal(pdfSrc, title) {
    document.getElementById('certFrame').src = pdfSrc;
    document.getElementById('certTitle').innerText = title;
    document.getElementById('certModal').style.display = "flex";
  }

  function closeModal() {
    document.getElementById('certModal').style.display = "none";
    document.getElementById('certFrame').src = "";
  }

  // Close modal when clicking outside of content
  window.onclick = function(event) {
    const modal = document.getElementById('certModal');
    if (event.target == modal) {
      closeModal();
    }
  }
</script>
function openModal(filePath, title) {
  document.getElementById('certModal').style.display = 'block';
  document.getElementById('certFrame').src = filePath;
  document.getElementById('certTitle').innerText = title;
}

function closeModal() {
  document.getElementById('certModal').style.display = 'none';
  document.getElementById('certFrame').src = '';
}




