/**
 * Main JavaScript file for Grayson Coleman's Portfolio Website
 * Handles all interactive functionality including:
 * - Project data loading from JSON
 * - Typewriter animation
 * - Carousel functionality
 * - Modal interactions
 * - Scroll animations
 * - Navigation
 */

// Global Variables
let projectsData = null;
let currentSlide = 0;
let totalSlides = 0;
let track = null;
let indicators = null;
let cards = null;

// Configuration
const CONFIG = {
  API_ENDPOINTS: {
    PROJECTS: 'data/portfolio_data.json'
  },
  ANIMATIONS: {
    TYPEWRITER_SPEED: 100,
    TYPEWRITER_DELETE_SPEED: 50,
    TYPEWRITER_PAUSE: 1500,
    TYPEWRITER_DELAY: 500
  }
};

/**
 * =============================
 * DATA LOADING & INITIALIZATION
 * =============================
 */

/**
 * Load projects data from JSON file
 */
async function loadProjectsData() {
  try {
    const response = await fetch(CONFIG.API_ENDPOINTS.PROJECTS);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    projectsData = data;
    return data;
  } catch (error) {
    console.error('Error loading projects data:', error);
    
    // Fallback data in case JSON file is not available
    projectsData = {
      "projects": [
        {
          "id": 0,
          "title": "Data Loading Error",
          "description": "Could not load project data. Please check that the portfolio_data.json file is in the correct location.",
          "techTags": ["Error", "Fallback"],
          "links": [],
          "stats": [],
          "details": {}
        }
      ]
    };
    return projectsData;
  }
}

/**
 * Populate the portfolio carousel with project data
 */
function populateProjects() {
  if (!projectsData || !projectsData.projects) {
    console.error('No projects data available');
    return;
  }

  const projectsTrack = document.getElementById('projectsTrack');
  const carouselIndicators = document.getElementById('carouselIndicators');
  
  if (!projectsTrack || !carouselIndicators) {
    console.error('Required DOM elements not found');
    return;
  }
  
  // Clear existing content
  projectsTrack.innerHTML = '';
  carouselIndicators.innerHTML = '';
  
  projectsData.projects.forEach((project, index) => {
    // Create project card
    const projectCard = createProjectCard(project, index);
    projectsTrack.appendChild(projectCard);
    
    // Create indicator
    const indicator = createIndicator(index);
    carouselIndicators.appendChild(indicator);
  });
}

/**
 * Create a project card element
 */
function createProjectCard(project, index) {
  const projectCard = document.createElement('div');
  projectCard.className = `project-card ${index === 0 ? 'active' : 'blurred'}`;
  projectCard.setAttribute('data-project', index);
  
  // Limit tech tags to first 10 for portfolio cards
  const limitedTechTags = project.techTags ? project.techTags.slice(0, 10) : [];
  const techTagsHTML = limitedTechTags.map(tag => 
    `<span class="tech-tag">${escapeHtml(tag)}</span>`
  ).join('');
  
  // Create links HTML
  const linksHTML = project.links ? project.links.map(link => {
    const linkClass = link.type === 'btn-coming-soon' ? 'btn-coming-soon' : 'btn action-btn';
    const href = link.type === 'btn-coming-soon' ? '#' : link.url;
    const target = link.type === 'btn-coming-soon' ? '' : 'target="_blank"';
    return `<a href="${escapeHtml(href)}" class="${linkClass}" ${target}>${escapeHtml(link.text)}</a>`;
  }).join('') : '';
  
  projectCard.innerHTML = `
    <h3 class="project-title">${escapeHtml(project.title)}</h3>
    <p class="project-description">${escapeHtml(project.description)}</p>
    <div class="project-tech">${techTagsHTML}</div>
    <div class="project-links">${linksHTML}</div>
    <button class="read-more-tab" onclick="openModal(${index})">Read More ↑</button>
  `;
  
  return projectCard;
}

/**
 * Create a carousel indicator element
 */
function createIndicator(index) {
  const indicator = document.createElement('div');
  indicator.className = `indicator ${index === 0 ? 'active' : ''}`;
  indicator.setAttribute('data-slide', index);
  indicator.addEventListener('click', () => goToSlide(index));
  return indicator;
}

/**
 * =============================
 * TYPEWRITER ANIMATION
 * =============================
 */

const typewriterTitles = [ 
  "An Experienced Translational Bench Researcher",
  "A Human-Centered Healthcare Professional",
  "A Self-Taught Python Developer",
  "A Science Communicator and Educator",
  "A Champion for Accessible Healthcare",
  "A Proven Leader and Team Player",
  "A Dedicated Advocate for Patients",
  "An AI Enthusiast and Engineer",
  "An Innovator with End-to-End Experience in the US Healthcare System",
  "A Quick Study, Self-Directed Learner, and Perseverant Collaborator",
  "A Lifelong Contributor and Learner",
  "A Passionate Scientist in the Fields of Immunology, Infectious Disease, and Cancer",
  "A Prolific Reader, Writer, and Content Creator"
];

let titleIndex = 0;
let charIndex = 0;
let isDeleting = false;

/**
 * Typewriter animation function
 */
function typewriterAnimation() {
  const typewriter = document.getElementById("typewriter");
  if (!typewriter) return;

  const current = typewriterTitles[titleIndex];
  const displayed = current.substring(0, charIndex);
  typewriter.textContent = displayed;

  if (!isDeleting && charIndex < current.length) {
    charIndex++;
    setTimeout(typewriterAnimation, CONFIG.ANIMATIONS.TYPEWRITER_SPEED);
  } else if (!isDeleting && charIndex === current.length) {
    isDeleting = true;
    setTimeout(typewriterAnimation, CONFIG.ANIMATIONS.TYPEWRITER_PAUSE);
  } else if (isDeleting && charIndex > 0) {
    charIndex--;
    setTimeout(typewriterAnimation, CONFIG.ANIMATIONS.TYPEWRITER_DELETE_SPEED);
  } else if (isDeleting && charIndex === 0) {
    isDeleting = false;
    titleIndex = (titleIndex + 1) % typewriterTitles.length;
    setTimeout(typewriterAnimation, CONFIG.ANIMATIONS.TYPEWRITER_DELAY);
  }
}

/**
 * =============================
 * CAROUSEL FUNCTIONALITY
 * =============================
 */

/**
 * Update carousel display and indicators
 */
function updateCarousel() {
  if (!track || !indicators || !cards) return;
  
  // Calculate the transform value for infinite loop
  const translateX = -currentSlide * (100 / totalSlides);
  track.style.transform = `translateX(${translateX}%)`;
  
  // Update indicators
  indicators.forEach((indicator, index) => {
    indicator.classList.toggle('active', index === currentSlide);
  });
  
  // Update active card and blur effects
  cards.forEach((card, index) => {
    card.classList.remove('active', 'blurred');
    if (index === currentSlide) {
      card.classList.add('active');
    } else {
      card.classList.add('blurred');
    }
  });
}

/**
 * Navigate to next slide
 */
function nextSlide() {
  currentSlide = (currentSlide + 1) % totalSlides;
  updateCarousel();
}

/**
 * Navigate to previous slide
 */
function prevSlide() {
  currentSlide = (currentSlide - 1 + totalSlides) % totalSlides;
  updateCarousel();
}

/**
 * Go to specific slide
 */
function goToSlide(slideIndex) {
  if (slideIndex >= 0 && slideIndex < totalSlides) {
    currentSlide = slideIndex;
    updateCarousel();
  }
}

/**
 * Initialize carousel functionality
 */
function initializeCarousel() {
  track = document.getElementById('projectsTrack');
  indicators = document.querySelectorAll('.indicator');
  cards = document.querySelectorAll('.project-card');
  totalSlides = projectsData ? projectsData.projects.length : 0;
  
  if (!track || totalSlides === 0) {
    console.error('Carousel initialization failed - missing required elements');
    return;
  }
  
  // Event listeners for carousel navigation
  const nextBtn = document.getElementById('nextBtn');
  const prevBtn = document.getElementById('prevBtn');
  
  if (nextBtn) nextBtn.addEventListener('click', nextSlide);
  if (prevBtn) prevBtn.addEventListener('click', prevSlide);
  
  // Initialize carousel state
  updateCarousel();
}

/**
 * =============================
 * MODAL FUNCTIONALITY
 * =============================
 */

/**
 * Open project modal with detailed information
 */
function openModal(projectIndex) {
  if (!projectsData || !projectsData.projects[projectIndex]) {
    console.error('Project data not found for index:', projectIndex);
    return;
  }

  const project = projectsData.projects[projectIndex];
  const modal = document.getElementById('modalOverlay');
  const title = document.getElementById('modalTitle');
  const description = document.getElementById('modalDescription');
  const details = document.getElementById('modalDetails');
  const links = document.getElementById('modalLinks');

  if (!modal || !title || !description || !details || !links) {
    console.error('Modal elements not found');
    return;
  }

  // Populate modal content
  title.textContent = project.title;
  description.textContent = project.description;

  // Clear previous details
  details.innerHTML = '';

  // Add statistics section
  if (project.stats && project.stats.length > 0) {
    const statsSection = createStatsSection(project.stats);
    details.appendChild(statsSection);
  }

  // Add full tech tags section
  if (project.techTags && project.techTags.length > 0) {
    const techSection = createTechSection(project.techTags);
    details.appendChild(techSection);
  }

  // Add detailed project information
  if (project.details && Object.keys(project.details).length > 0) {
    const detailsGrid = createDetailsGrid(project.details);
    details.appendChild(detailsGrid);
  }

  // Populate links
  populateModalLinks(links, project.links);

  // Show modal
  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

/**
 * Close the project modal
 */
function closeModal() {
  const modal = document.getElementById('modalOverlay');
  if (modal) {
    modal.classList.remove('active');
    document.body.style.overflow = 'auto';
  }
}

/**
 * Create statistics section for modal
 */
function createStatsSection(stats) {
  const statsSection = document.createElement('div');
  statsSection.className = 'modal-stats';
  
  stats.forEach(stat => {
    const statCard = document.createElement('div');
    statCard.className = 'modal-stat-card';
    
    const statNumber = document.createElement('div');
    statNumber.className = 'modal-stat-number';
    statNumber.textContent = stat.number;
    
    const statLabel = document.createElement('div');
    statLabel.className = 'modal-stat-label';
    statLabel.textContent = stat.label;
    
    statCard.appendChild(statNumber);
    statCard.appendChild(statLabel);
    statsSection.appendChild(statCard);
  });
  
  return statsSection;
}

/**
 * Create technology tags section for modal
 */
function createTechSection(techTags) {
  const techSection = document.createElement('div');
  techSection.innerHTML = `
    <h4 style="color: var(--accent-primary); font-size: var(--font-size-xl); margin-bottom: var(--space-md);">Technologies & Skills</h4>
    <div style="display: flex; flex-wrap: wrap; gap: var(--space-md); margin-bottom: var(--space-xl);">
      ${techTags.map(tag => `<span class="tech-tag">${escapeHtml(tag)}</span>`).join('')}
    </div>
  `;
  return techSection;
}

/**
 * Create details grid for modal
 */
function createDetailsGrid(details) {
  const detailsGrid = document.createElement('div');
  detailsGrid.className = 'modal-details-grid';

  Object.entries(details).forEach(([key, value]) => {
    const section = document.createElement('div');
    section.className = 'detail-section';
    
    const heading = document.createElement('h4');
    heading.textContent = key;
    section.appendChild(heading);

    const list = document.createElement('ul');
    if (Array.isArray(value)) {
      value.forEach(item => {
        const listItem = document.createElement('li');
        listItem.textContent = item;
        list.appendChild(listItem);
      });
    }
    section.appendChild(list);

    detailsGrid.appendChild(section);
  });

  return detailsGrid;
}

/**
 * Populate modal links section
 */
function populateModalLinks(linksContainer, links) {
  linksContainer.innerHTML = '';

  if (!links || links.length === 0) return;

  links.forEach(link => {
    const anchor = document.createElement('a');
    if (link.type === 'btn-coming-soon') {
      anchor.href = '#';
      anchor.className = 'btn-coming-soon';
    } else {
      anchor.href = link.url;
      anchor.className = 'btn action-btn';
      anchor.target = '_blank';
    }
    anchor.textContent = link.text;
    anchor.style.marginRight = 'var(--space-md)';
    linksContainer.appendChild(anchor);
  });
}

/**
 * =============================
 * SCROLL ANIMATIONS & NAVIGATION
 * =============================
 */

/**
 * Initialize scroll-based animations
 */
function initializeScrollAnimations() {
  // Intersection Observer for section visibility
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, observerOptions);

  // Navigation active state observer
  const navObserverOptions = {
    threshold: 0.6,
    rootMargin: '0px 0px -50px 0px'
  };

  const navObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        updateActiveNavLink(id);
      }
    });
  }, navObserverOptions);

  // Observe all sections
  const sections = document.querySelectorAll('section');
  sections.forEach(section => {
    if (section.id !== 'hero') {
      observer.observe(section);
    }
    navObserver.observe(section);
  });
}

/**
 * Update active navigation link
 */
function updateActiveNavLink(activeId) {
  const navLinks = document.querySelectorAll('.nav-link');
  navLinks.forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('href') === `#${activeId}`) {
      link.classList.add('active');
    }
  });
}

/**
 * Initialize smooth scrolling for navigation links
 */
function initializeSmoothScrolling() {
  const navLinks = document.querySelectorAll('.nav-link');
  
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = link.getAttribute('href').substring(1);
      const target = document.getElementById(targetId);
      
      if (target) {
        target.scrollIntoView({ 
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });
}

/**
 * Initialize navbar scroll effects
 */
function initializeNavbarEffects() {
  const navbar = document.getElementById('navbar');
  
  if (!navbar) return;
  
  window.addEventListener('scroll', () => {
    if (window.scrollY > 100) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });
}

/**
 * =============================
 * EVENT LISTENERS & INITIALIZATION
 * =============================
 */

/**
 * Initialize modal event listeners
 */
function initializeModalEventListeners() {
  // Close modal when clicking outside
  const modalOverlay = document.getElementById('modalOverlay');
  if (modalOverlay) {
    modalOverlay.addEventListener('click', function(e) {
      if (e.target === this) {
        closeModal();
      }
    });
  }

  // Close modal with Escape key
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      closeModal();
    }
  });
}

/**
 * =============================
 * UTILITY FUNCTIONS
 * =============================
 */

/**
 * Escape HTML to prevent XSS attacks
 */
function escapeHtml(text) {
  if (typeof text !== 'string') return text;
  
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  
  return text.replace(/[&<>"']/g, function(m) { return map[m]; });
}

/**
 * Debounce function to limit function calls
 */
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Check if element is in viewport
 */
function isInViewport(element) {
  const rect = element.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}

/**
 * =============================
 * PERFORMANCE OPTIMIZATIONS
 * =============================
 */

/**
 * Lazy load images when they come into viewport
 */
function initializeLazyLoading() {
  const images = document.querySelectorAll('img[data-src]');
  
  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src;
          img.classList.remove('lazy');
          imageObserver.unobserve(img);
        }
      });
    });

    images.forEach(img => imageObserver.observe(img));
  } else {
    // Fallback for older browsers
    images.forEach(img => {
      img.src = img.dataset.src;
      img.classList.remove('lazy');
    });
  }
}

/**
 * Preload critical resources
 */
function preloadCriticalResources() {
  // Preload the portfolio data
  const link = document.createElement('link');
  link.rel = 'preload';
  link.href = CONFIG.API_ENDPOINTS.PROJECTS;
  link.as = 'fetch';
  link.crossOrigin = 'anonymous';
  document.head.appendChild(link);
}

/**
 * =============================
 * ERROR HANDLING
 * =============================
 */

/**
 * Global error handler
 */
function initializeErrorHandling() {
  window.addEventListener('error', (event) => {
    console.error('Global error:', event.error);
    // You could send errors to a logging service here
  });

  window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
    // You could send errors to a logging service here
  });
}

/**
 * =============================
 * ACCESSIBILITY FEATURES
 * =============================
 */

/**
 * Initialize accessibility features
 */
function initializeAccessibility() {
  // Add focus indicators for keyboard navigation
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
      document.body.classList.add('keyboard-nav');
    }
  });

  document.addEventListener('click', () => {
    document.body.classList.remove('keyboard-nav');
  });

  // Ensure carousel is keyboard accessible
  const carouselNavButtons = document.querySelectorAll('.carousel-nav');
  carouselNavButtons.forEach(button => {
    button.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        button.click();
      }
    });
  });
}

/**
 * =============================
 * PROGRESSIVE ENHANCEMENT
 * =============================
 */

/**
 * Check for required browser features
 */
function checkBrowserSupport() {
  const features = {
    intersectionObserver: 'IntersectionObserver' in window,
    fetch: 'fetch' in window,
    promises: 'Promise' in window,
    cssCustomProperties: CSS.supports('color', 'var(--test)')
  };

  // Log unsupported features
  Object.entries(features).forEach(([feature, supported]) => {
    if (!supported) {
      console.warn(`Feature not supported: ${feature}`);
    }
  });

  return features;
}

/**
 * =============================
 * MAIN INITIALIZATION
 * =============================
 */

/**
 * Initialize all website functionality
 */
async function initializeWebsite() {
  try {
    // Check browser support
    const browserSupport = checkBrowserSupport();
    
    // Initialize error handling
    initializeErrorHandling();
    
    // Preload critical resources
    preloadCriticalResources();
    
    // Load and populate project data
    await loadProjectsData();
    populateProjects();
    
    // Initialize carousel
    initializeCarousel();
    
    // Start typewriter animation
    setTimeout(typewriterAnimation, CONFIG.ANIMATIONS.TYPEWRITER_DELAY);
    
    // Initialize scroll-based features
    initializeScrollAnimations();
    initializeSmoothScrolling();
    initializeNavbarEffects();
    
    // Initialize modal functionality
    initializeModalEventListeners();
    
    // Initialize accessibility features
    initializeAccessibility();
    
    // Initialize lazy loading
    initializeLazyLoading();
    
    console.log('Website initialized successfully');
    
  } catch (error) {
    console.error('Error initializing website:', error);
    
    // Show fallback content or error message
    const heroSection = document.getElementById('hero');
    if (heroSection) {
      const errorMessage = document.createElement('div');
      errorMessage.className = 'error-message';
      errorMessage.innerHTML = `
        <h2>Loading Error</h2>
        <p>There was an issue loading the website. Please refresh the page.</p>
      `;
      heroSection.appendChild(errorMessage);
    }
  }
}

/**
 * =============================
 * ADDITIONAL FEATURES
 * =============================
 */

/**
 * Add keyboard shortcuts for carousel navigation
 */
function initializeKeyboardShortcuts() {
  document.addEventListener('keydown', (e) => {
    // Only activate shortcuts when not typing in form fields
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
      return;
    }

    switch(e.key) {
      case 'ArrowLeft':
        e.preventDefault();
        prevSlide();
        break;
      case 'ArrowRight':
        e.preventDefault();
        nextSlide();
        break;
      case 'Escape':
        closeModal();
        break;
    }
  });
}

/**
 * Add touch/swipe support for mobile carousel navigation
 */
function initializeTouchNavigation() {
  let startX = 0;
  let startY = 0;
  let endX = 0;
  let endY = 0;

  const carousel = document.getElementById('projectsCarousel');
  if (!carousel) return;

  carousel.addEventListener('touchstart', (e) => {
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
  }, { passive: true });

  carousel.addEventListener('touchend', (e) => {
    endX = e.changedTouches[0].clientX;
    endY = e.changedTouches[0].clientY;
    handleSwipe();
  }, { passive: true });

  function handleSwipe() {
    const deltaX = endX - startX;
    const deltaY = endY - startY;
    const minSwipeDistance = 50;

    // Only trigger swipe if horizontal movement is greater than vertical
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > minSwipeDistance) {
      if (deltaX > 0) {
        prevSlide();
      } else {
        nextSlide();
      }
    }
  }
}

/**
 * Initialize auto-play for carousel (optional)
 */
function initializeAutoPlay(interval = 8000) {
  let autoPlayTimer;
  let isUserInteracting = false;

  function startAutoPlay() {
    if (!isUserInteracting) {
      autoPlayTimer = setInterval(nextSlide, interval);
    }
  }

  function stopAutoPlay() {
    clearInterval(autoPlayTimer);
  }

  // Start auto-play
  startAutoPlay();

  // Pause on hover
  const carousel = document.getElementById('projectsCarousel');
  if (carousel) {
    carousel.addEventListener('mouseenter', () => {
      isUserInteracting = true;
      stopAutoPlay();
    });

    carousel.addEventListener('mouseleave', () => {
      isUserInteracting = false;
      startAutoPlay();
    });
  }

  // Pause when tab is not visible
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      stopAutoPlay();
    } else {
      startAutoPlay();
    }
  });
}

/**
 * =============================
 * DOCUMENT READY
 * =============================
 */

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  initializeWebsite();
  initializeKeyboardShortcuts();
  initializeTouchNavigation();
  
  // Uncomment the line below to enable auto-play
  // initializeAutoPlay(8000);
});

// Make functions globally available for onclick handlers
window.openModal = openModal;
window.closeModal = closeModal;
window.nextSlide = nextSlide;
window.prevSlide = prevSlide;
window.goToSlide = goToSlide;
