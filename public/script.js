document.addEventListener('DOMContentLoaded', () => {
    const showAllButton = document.getElementById('show-all');
    const filterForm = document.querySelector('#filter-form form');
    const cards = document.querySelectorAll('#filterable-cards .card');

    // Show all cards and reset filters
    showAllButton.addEventListener('click', () => {
        filterForm.reset();
        cards.forEach(card => card.classList.remove('hide'));
    });

    // Function to handle form submission and apply filters
    filterForm.addEventListener('submit', (event) => {
        event.preventDefault(); // Prevent the form from submitting

        const formData = new FormData(filterForm);
        const countryFilter = formData.get('country');
        const averageCostFilter = formData.get('average_cost');
        const cuisinesFilter = formData.get('cuisines').toLowerCase().split(',').map(c => c.trim());

        cards.forEach(card => {
            const cardCountry = card.getAttribute('data-country');
            const cardCost = card.getAttribute('data-cost');
            const cardCuisines = card.getAttribute('data-cuisines').split(',').map(c => c.trim());

            // Check if the card matches the filters
            const matchesCountry = countryFilter === '' || cardCountry === countryFilter;
            const matchesCost = averageCostFilter === '' || cardCost.includes(averageCostFilter);
            const matchesCuisines = cuisinesFilter.length === 0 || cuisinesFilter.some(cuisine => cardCuisines.includes(cuisine));

            // Toggle visibility based on filters
            card.classList.toggle('hide', !(matchesCountry && matchesCost && matchesCuisines));
        });
    });
});

document.addEventListener('DOMContentLoaded', () => {
    // Show All button functionality
    document.getElementById('show-all').addEventListener('click', () => {
        window.location.href = '/';
    });

    // Handle Apply Filters button
    const filterForm = document.querySelector('#filter-form form');
    filterForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const formData = new FormData(filterForm);
        const queryParams = new URLSearchParams(formData).toString();
        window.location.href = `/filter?${queryParams}`;
    });

    // Handle Clear Filters button
    const clearFiltersButton = document.querySelector('.btn-warning');
    if (clearFiltersButton) {
        clearFiltersButton.addEventListener('click', (event) => {
            event.preventDefault();
            window.location.href = '/clear-filters';
        });
    }
});
