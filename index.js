
document.addEventListener('DOMContentLoaded', () => {
  // Smooth scroll for nav links
  document.querySelectorAll('nav a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const targetId = this.getAttribute('href').substring(1);
      const targetElement = document.getElementById(targetId);
      if (targetElement) {
        targetElement.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  // Typing effect
  const typeText = document.querySelector('header p');
  const words = [
    "Certified Cybersecurity Professional",
    "Network & Systems Specialist",
    "Python & Linux Enthusiast"
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
  const scrollBtn = document.createElement('button');
  scrollBtn.innerHTML = '<i class="fas fa-arrow-up"></i>';
  scrollBtn.id = 'scrollToTop';
  scrollBtn.title = 'Back to Top';
  scrollBtn.style.display = 'none';
  scrollBtn.style.position = 'fixed';
  scrollBtn.style.bottom = '20px';
  scrollBtn.style.right = '20px';
  scrollBtn.style.padding = '10px';
  scrollBtn.style.borderRadius = '8px';
  scrollBtn.style.border = 'none';
  scrollBtn.style.backgroundColor = '#007BFF';
  scrollBtn.style.color = '#fff';
  scrollBtn.style.fontSize = '1.2rem';
  document.body.appendChild(scrollBtn);

  scrollBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  window.addEventListener('scroll', () => {
    scrollBtn.style.display = window.scrollY > 300 ? 'block' : 'none';
    highlightNav();
  });

  // Fade-in sections
  const sections = document.querySelectorAll('section');
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.1 });

  sections.forEach(section => {
    observer.observe(section);
  });

  // Highlight active nav link
  function highlightNav() {
    const scrollY = window.scrollY;
    document.querySelectorAll('section').forEach(sec => {
      const offset = sec.offsetTop - 100;
      const height = sec.offsetHeight;
      const id = sec.getAttribute('id');
      if (scrollY >= offset && scrollY < offset + height) {
        document.querySelectorAll('nav a').forEach(a => a.classList.remove('active'));
        const activeLink = document.querySelector(`nav a[href="#${id}"]`);
        if (activeLink) activeLink.classList.add('active');
      }
    });
  }
  highlightNav(); // Run on load

  // Simulate increasing blocked intrusion attempts
let blockedCount = 1293;
const countDisplay = document.getElementById('blocked-count');

setInterval(() => {
  // Simulate a random number of new blocked attempts (1–5 every 3 sec)
  const increase = Math.floor(Math.random() * 5) + 1;
  blockedCount += increase;
  countDisplay.textContent = blockedCount;
}, 3000);

  // Theme toggle
  const themeBtn = document.getElementById('theme-toggle');
  if (themeBtn) {
    themeBtn.addEventListener('click', () => {
      document.body.classList.toggle('light-mode');
    });
  }

  // Responsive menu toggle (hamburger)
  const toggleBtn = document.querySelector('.menu-toggle');
  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      document.querySelector('nav ul.menu').classList.toggle('show');
    });
  }

  // Portfolio filtering
  document.querySelectorAll('.filters button').forEach(btn => {
    btn.addEventListener('click', () => {
      const cat = btn.dataset.filter;
      document.querySelectorAll('.project-card').forEach(card => {
        card.style.display = (cat === 'all' || card.dataset.category === cat) ? 'block' : 'none';
      });
    });
  });

  // Contact form submission
  const form = document.querySelector('.contact-form');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      const formData = new FormData(form);
      fetch('https://formspree.io/f/yourformid', {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json'
        }
      }).then(response => {
        if (response.ok) {
          alert('Thank you for your message!');
          form.reset();
        } else {
          alert('There was a problem with your submission.');
        }
      }).catch(error => {
        console.error('Error:', error);
        alert('There was a problem with your submission.');
      });
    });
  }
});
// Add Font Awesome icons dynamically
const link = document.createElement('link');
link.rel = 'stylesheet';
link.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/css/all.min.css';
document.head.appendChild(link);
// Add Google Fonts dynamically
document.addEventListener('DOMContentLoaded', () => {
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = 'https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap';
  document.head.appendChild(link);
});
// Add Google Material Icons dynamically  
document.addEventListener('DOMContentLoaded', () => {
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = 'https://fonts.googleapis.com/icon?family=Material+Icons';
  document.head.appendChild(link);
}); 

// Add Bootstrap CSS dynamically
document.addEventListener('DOMContentLoaded', () => {
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = 'https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css';
  document.head.appendChild(link);
});
// Add Bootstrap JS dynamically 
document.addEventListener('DOMContentLoaded', () => {
  const script = document.createElement('script');
  script.src = 'https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/js/bootstrap.bundle.min.js';
  script.defer = true;
  document.body.appendChild(script);
});
// Add jQuery dynamically
document.addEventListener('DOMContentLoaded', () => {
  const script = document.createElement('script');
  script.src = 'https://code.jquery.com/jquery-3.5.1.min.js';
  script.defer = true;
  document.body.appendChild(script);
});
// Add Popper.js dynamically  
document.addEventListener('DOMContentLoaded', () => {
  const script = document.createElement('script');
  script.src = 'https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.16.0/umd/popper.min.js';
  script.defer = true;
  document.body.appendChild(script);
}); 
// Add AOS (Animate On Scroll) library dynamically
document.addEventListener('DOMContentLoaded', () => { 
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = 'https://cdnjs.cloudflare.com/ajax/libs/aos/2.3.4/aos.css';
  document.head.appendChild(link);

  const script = document.createElement('script');
  script.src = 'https://cdnjs.cloudflare.com/ajax/libs/aos/2.3.4/aos.js';
  script.onload = () => AOS.init();
  script.defer = true;
  document.body.appendChild(script);
});
// Add custom CSS dynamically 
document.addEventListener('DOMContentLoaded', () => {
  const style = document.createElement('style');
  style.textContent = `
    body {
      font-family: 'Roboto', sans-serif;
      background-color: var(--bg-color);
      color: var(--text-color);
    }
    header {
      position: relative;
      text-align: center;
      padding: 50px 0;
    }
    header video {
      width: 100%;
      height: auto;
      position: absolute;
      top: 0;
      left: 0;
      z-index: -1;
    }
    .header-content h1 {
      font-size: 3rem;
      margin-bottom: 20px;
    }
    .header-content p {
      font-size: 1.5rem;
    }
    .overlay-text {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      color: #fff;
      font-size: 2rem;
    }
  `;
  document.head.appendChild(style);
}); 
// Add custom CSS for the header video overlay
document.addEventListener('DOMContentLoaded', () => { 
  const style = document.createElement('style');
  style.textContent = `
    #header-video {
      width: 100%;
      height: auto;
      position: absolute;
      top: 0;
      left: 0;
      z-index: -1;
    }
    .overlay-text {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      color: #fff;
      font-size: 2rem;
      text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
    }
  `;
  document.head.appendChild(style);
});
// Add custom CSS for the scroll to top button
document.addEventListener('DOMContentLoaded', () => {
  const style = document.createElement('style');
  style.textContent = `
    #scrollToTop {
      display: none;
      position: fixed;
      bottom: 20px;
      right: 20px;
      padding: 10px;
      border-radius: 8px;
      border: none;
      background-color: #007BFF;
      color: #fff;
      font-size: 1.2rem;
      cursor: pointer;
    } 
    #scrollToTop:hover {
      background-color: #0056b3;
    } 
    #scrollToTop i {
      margin-right: 5px;
    }
  `;
  document.head.appendChild(style);
});
// Add custom CSS for the theme toggle button
document.addEventListener('DOMContentLoaded', () => {
  const style = document.createElement('style');
  style.textContent = `
    #theme-toggle {
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 10px;
      border-radius: 50%;
      border: none;
      background-color: #007BFF;
      color: #fff;
      font-size: 1.5rem;
      cursor: pointer;
    }
    #theme-toggle:hover {
      background-color: #0056b3;
    }
  `;
  document.head.appendChild(style);
}); 
// Add custom CSS for the responsive menu toggle button
document.addEventListener('DOMContentLoaded', () => {
  const style = document.createElement('style');
  style.textContent = `
    .menu-toggle {
      display: none;
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 10px;
      border-radius: 50%;
      border: none;
      background-color: #007BFF;
      color: #fff;
      font-size: 1.5rem;
      cursor: pointer;
    }
    @media (max-width: 768px) {
      .menu-toggle {
        display: block;
      }
    }
  `;
  document.head.appendChild(style);
});
// Add custom CSS for the portfolio filtering buttons
document.addEventListener('DOMContentLoaded', () => {
  const style = document.createElement('style');
  style.textContent = `
    .filters {
      display: flex;
      justify-content: center;
      margin-bottom: 20px;
    }
    .filters button {
      margin: 0 10px;
      padding: 10px 20px;
      border: none;
      border-radius: 5px;
      background-color: #007BFF;
      color: #fff;
      cursor: pointer;
    }
    .filters button:hover {
      background-color: #0056b3;
    }
  `;
  document.head.appendChild(style);
}); 
// Add custom CSS for the contact form
document.addEventListener('DOMContentLoaded', () => {
  const style = document.createElement('style');
  style.textContent = `
    .contact-form {
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f9f9f9;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    }
    .contact-form input,
    .contact-form textarea {
      width: 100%;
      padding: 10px;
      margin-bottom: 15px;
      border: 1px solid #ccc;
      border-radius: 5px;
    }
    .contact-form button {
      padding: 10px 20px;
      border: none;
      border-radius: 5px;
      background-color: #007BFF;
      color: #fff;
      cursor: pointer;
    } 
    .contact-form button:hover {
      background-color: #0056b3;
    }
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
// Certifications.jsx
import React from "react";
import { ChevronLeft, ChevronRight, FileDown, FileText } from "lucide-react";

export default function Certifications() {
  const certificates = [
    { src: "Images/1761387341576-467175dd-10d9-43e7-95eb-8707113bfdcc_1.jpg", title: "Certificate 1" },
    { src: "Images/1761387472962-b0f3fad7-9f4a-4dd3-a275-bdc0fa603d61_1.jpg", title: "Certificate 2" },
    { src: "Images/1761387565798-27b3da46-e716-4057-9454-75f918e5b1d4_1.jpg", title: "Certificate 3" },
    { src: "Images/Junior PenTester-Tryhackme cert.jpg", title: "Junior PenTester (TryHackMe)" },
    { src: "Images/Optimi Course completion Sandiso Mayekiso IT Engineer.jpg", title: "Optimi Course Completion" },
  ];

  const pdfs = [
    { href: "Images/Business%20Management%20Certificate%20N6.pdf", name: "Business Management Certificate N6" },
    { href: "Images/Cyber101.pdf", name: "Cyber 101 (TryHackMe)" },
    { href: "Images/CyberSecurity%20certificate.pdf", name: "CyberSecurity Certificate" },
    { href: "Images/CyberSecurity+certificate-compressed.pdf", name: "CyberSecurity+ Certificate" },
    { href: "Images/Junior PenTester-Tryhackme cert.pdf", name: "Junior PenTester (TryHackMe)" },
    { href: "Images/Optimi Course completion Sandiso Mayekiso IT Engineer.pdf", name: "Optimi Course Completion" },
    { href: "Images/Statement of results Sandiso Mayekiso IT Engineer.pdf", name: "Statement of Results IT Engineer" },
  ];

  const scrollContainer = React.useRef(null);

  const scroll = (direction) => {
    const { current } = scrollContainer;
    if (direction === "left") current.scrollBy({ left: -300, behavior: "smooth" });
    else current.scrollBy({ left: 300, behavior: "smooth" });
  };

  return (
    <section id="certifications" className="py-12 px-6 bg-gray-900 text-white">
      <h2 className="text-3xl font-bold mb-6 text-center">🎓 My Certifications</h2>

      {/* Scrollable gallery */}
      <div className="relative">
        <button
          onClick={() => scroll("left")}
          className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-gray-700 p-2 rounded-full hover:bg-gray-600"
        >
          <ChevronLeft size={24} />
        </button>

        <div
          ref={scrollContainer}
          className="flex overflow-x-auto gap-4 scroll-smooth scrollbar-hide px-10"
        >
          {certificates.map((cert, index) => (
            <div
              key={index}
              className="min-w-[250px] flex-shrink-0 bg-gray-800 rounded-2xl shadow-lg overflow-hidden hover:scale-105 transition-transform"
            >
              <img src={cert.src} alt={cert.title} className="w-full h-56 object-cover" />
              <p className="p-3 text-center text-sm">{cert.title}</p>
            </div>
          ))}
        </div>

        <button
          onClick={() => scroll("right")}
          className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-gray-700 p-2 rounded-full hover:bg-gray-600"
        >
          <ChevronRight size={24} />
        </button>
      </div>

      {/* Download / View PDF Links */}
      <div className="mt-12 text-center">
        <h3 className="text-2xl font-semibold mb-4 flex justify-center items-center gap-2">
          <FileText /> Download / View Certificates
        </h3>
        <ul className="space-y-3 max-w-xl mx-auto">
          {pdfs.map((pdf, i) => (
            <li key={i} className="flex items-center justify-between bg-gray-800 px-4 py-3 rounded-lg hover:bg-gray-700 transition">
              <span>{pdf.name}</span>
              <a
                href={pdf.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-blue-400 hover:text-blue-300"
              >
                <FileDown size={18} /> View PDF
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}



