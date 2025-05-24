document.addEventListener('DOMContentLoaded', () => {
    const modeToggleButton = document.getElementById('mode-toggle-button');
    const body = document.body;
    const modalOverlay = document.getElementById('genericModal');
    const modalCloseButton = modalOverlay.querySelector('.modal-close-button');
    const openModalTestButton = document.getElementById('openModalTestButton'); // Temporary test button

    // Load saved theme preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        body.setAttribute('data-theme', savedTheme);
        modeToggleButton.textContent = savedTheme === 'dark' ? '☀️' : '🌙';
    } else {
        // Default to light theme if no preference is saved
        body.setAttribute('data-theme', 'light');
        modeToggleButton.textContent = '🌙';
    }

    // Theme toggle functionality
    modeToggleButton.addEventListener('click', () => {
        const currentTheme = body.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        body.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        modeToggleButton.textContent = newTheme === 'dark' ? '☀️' : '🌙';
    });

    // Hamburger menu functionality (basic toggle)
    const hamburgerMenu = document.querySelector('.hamburger-menu');
    const nav = document.querySelector('header nav ul');
    hamburgerMenu.addEventListener('click', () => {
        nav.classList.toggle('active');
    });

    // Animate sections on scroll
    const sections = document.querySelectorAll('.animate-on-load');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
            } else {
                 // Optional: remove is-visible when out of view
                 // entry.target.classList.remove('is-visible');
            }
        });
    }, {
        threshold: 0.1 // Trigger when 10% of the section is visible
    });

    sections.forEach(section => {
        observer.observe(section);
    });


    // Modal functionality
    function openModal(title, contentHtml) {
        document.getElementById('modalTitle').textContent = title;
        document.getElementById('modalBody').innerHTML = contentHtml;
        modalOverlay.style.display = 'flex'; // Use flex for centering
        document.body.classList.add('modal-open'); // Prevent background scrolling
    }

    function closeModal() {
        modalOverlay.style.display = 'none';
        document.body.classList.remove('modal-open');
         // Clear modal content on close (optional)
        document.getElementById('modalTitle').textContent = '';
        document.getElementById('modalBody').innerHTML = '';
    }

    // Close modal when clicking the close button
    modalCloseButton.addEventListener('click', closeModal);

    // Close modal when clicking outside the modal content
    modalOverlay.addEventListener('click', (event) => {
        if (event.target === modalOverlay) {
            closeModal();
        }
    });

    // Close modal when pressing the Escape key
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && modalOverlay.style.display === 'flex') {
            closeModal();
        }
    });

     // Add a click listener to style cards to open the modal
    const styleCards = document.querySelectorAll('.style-card');
    styleCards.forEach(card => {
        card.addEventListener('click', () => {
            const styleName = card.querySelector('.style-card-label').textContent;
            const modalContent = `<p>You selected the <strong>${styleName}</strong> style.</p><p>More details or options for this style could go here.</p>`;
            openModal(`Style Selected: ${styleName}`, modalContent);
        });
    });

    // Add a click listener to gallery cards to open the modal
    const galleryCards = document.querySelectorAll('.gallery-card');
    galleryCards.forEach(card => {
        card.addEventListener('click', () => {
            const imgSrc = card.querySelector('.gallery-image').src;
            const prompt = card.querySelector('.gallery-card-prompt').textContent;
            const details = card.querySelector('.gallery-card-details').innerHTML;

            const modalContent = `
                <img src="${imgSrc}" alt="Generated Image Preview" style="max-width: 100%; height: auto; margin-bottom: 15px; border-radius: 8px;">
                <p><strong>${prompt}</strong></p>
                <div class="gallery-card-details">${details}</div>
                 <button class="btn btn-primary" style="margin-top: 15px;">View Details</button>
            `;
            openModal('Generated Image Details', modalContent);
        });
    });


    // Temporary test button for modal (can be removed later)
    if (openModalTestButton) {
        openModalTestButton.addEventListener('click', () => {
            openModal('Test Modal', '<p>This is a test modal.</p><p>You can put any HTML content here.</p>');
        });
    }


    // Basic infinite scroll placeholder logic for the gallery
    const gallerySection = document.getElementById('gallery');
    const galleryLoader = document.getElementById('gallery-loader');

    if (gallerySection && galleryLoader) {
        const galleryObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    console.log('Gallery loader is visible, would load more images...');
                    // In a real app, you'd fetch more images here
                    // For now, just a log and potentially show/hide the loader
                    galleryLoader.style.display = 'block'; // Show loader
                    // Simulate loading for a few seconds, then hide loader
                    setTimeout(() => {
                       // This is where you'd append new gallery items
                       galleryLoader.style.display = 'none'; // Hide loader after content loads
                       // If no more content, unobserve
                       // galleryObserver.unobserve(galleryLoader);
                    }, 2000); // Simulate 2 seconds loading
                }
            });
        }, {
            threshold: 0.5 // Trigger when half of the loader is visible
        });

        // Start observing the loader element
        galleryObserver.observe(galleryLoader);
    }


});