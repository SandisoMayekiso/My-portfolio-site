
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


