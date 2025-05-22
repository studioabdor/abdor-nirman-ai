document.addEventListener('DOMContentLoaded', () => {
    const modeToggleButton = document.getElementById('mode-toggle-button');
    const body = document.body;

    // Function to apply the saved theme
    const applyTheme = () => {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'light-mode') {
            body.classList.add('light-mode');
            modeToggleButton.textContent = '🌙'; // Moon for light mode
        } else {
            body.classList.remove('light-mode'); // Default to dark mode
            modeToggleButton.textContent = '☀️'; // Sun for dark mode
        }
    };

    // Apply theme on initial load
    applyTheme();

    // Event listener for the toggle button
    modeToggleButton.addEventListener('click', () => {
        body.classList.toggle('light-mode');

        if (body.classList.contains('light-mode')) {
            localStorage.setItem('theme', 'light-mode');
            modeToggleButton.textContent = '🌙'; // Moon for light mode
        } else {
            localStorage.setItem('theme', 'dark-mode');
            modeToggleButton.textContent = '☀️'; // Sun for dark mode
        }
    });
});
