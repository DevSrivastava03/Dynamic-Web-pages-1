// Global variables
let allProducts = [];
let wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];

// Event listener for search button
document.getElementById('searchQuerySubmit').addEventListener('click', function() {
    const query = document.getElementById('searchQueryInput').value.toLowerCase();
    console.log('Search query:', query);

    const jsonFiles = ['ralphlauren_polos.json', 'macys_polos.json', 'saksfifthavenue_polos.json'];

    Promise.all(jsonFiles.map(file => 
        fetch(file)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Network response for ${file} was not ok`);
                }
                return response.json();
            })
            .catch(error => {
                console.error(`Error fetching ${file}:`, error);
                return [];
            })
    ))
    .then(allData => {
        console.log('All data loaded:', allData);
        const products = allData.flat();
        const results = products.filter(item => item.name.toLowerCase().includes(query));
        displayResults(results);
    })
    .catch(error => console.error('Error processing data:', error));
});

// Function to display search results
function displayResults(results) {
    const resultsContainer = document.getElementById('resultsContainer');
    resultsContainer.innerHTML = ''; 

    if (results.length === 0) {
        resultsContainer.innerHTML = '<p>No results found</p>';
    } else {
        results.forEach((item, index) => {
            const itemDiv = document.createElement('div');
            itemDiv.classList.add('result-item');
            
            itemDiv.innerHTML = `
                <img src="${item.image}" alt="${item.name}" />
                <h2>${item.name}</h2>
                <p>${item.price}</p>
                <button onclick='addToWishlist(${JSON.stringify(item)})'>Add to Wishlist</button>
            `;
            
            itemDiv.style.animationDelay = `${0.1 * (index + 1)}s`;
            resultsContainer.appendChild(itemDiv);
        });
    }
}

// Add product to wishlist
function addToWishlist(product) {
    if (!wishlist.some(item => item.id === product.id)) {
        wishlist.push(product);
        localStorage.setItem('wishlist', JSON.stringify(wishlist));
        updateWishlistUI();
    }
}

// Remove product from wishlist
function removeFromWishlist(productId) {
    wishlist = wishlist.filter(item => item.id !== productId);
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
    updateWishlistUI();
}

// Initialize wishlist UI when the page loads
window.addEventListener('load', () => {
    updateWishlistUI(); // Call this on page load to reflect saved wishlist items
});

// Suggestions Functionality

// Debounce function to avoid too many updates while typing
function debounce(func, delay) {
    let debounceTimer;
    return function() {
        const context = this;
        const args = arguments;
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => func.apply(context, args), delay);
    }
}

// Set up search input and suggestions
const searchInput = document.getElementById('searchQueryInput');
const suggestionsContainer = document.createElement('div');
suggestionsContainer.id = 'suggestionsContainer';
searchInput.parentNode.insertBefore(suggestionsContainer, searchInput.nextSibling);

// Fetch all products on page load to enable suggestions
Promise.all([
    fetch('ralphlauren_polos.json'),
    fetch('macys_polos.json'),
    fetch('saksfifthavenue_polos.json')
].map(promise => promise.then(response => response.json())))
.then(data => {
    allProducts = data.flat();
    console.log('All products loaded:', allProducts);
})
.catch(error => console.error('Error loading product data:', error));

// Handle input and show suggestions
searchInput.addEventListener('input', debounce(function() {
    const query = this.value.toLowerCase();
    if (query.length < 2) {
        suggestionsContainer.innerHTML = '';
        return;
    }

    const suggestions = allProducts
        .filter(product => product.name.toLowerCase().includes(query))
        .slice(0, 10) // Limit to 10 suggestions
        .map(product => `<div class="suggestion">${product.name}</div>`)
        .join('');

    suggestionsContainer.innerHTML = suggestions;
}, 300));

// Handle suggestion click
suggestionsContainer.addEventListener('click', function(e) {
    if (e.target.classList.contains('suggestion')) {
        searchInput.value = e.target.textContent;
        suggestionsContainer.innerHTML = '';
        // Trigger the search
        document.getElementById('searchQuerySubmit').click();
    }
});

// Hide suggestions when clicking outside
document.addEventListener('click', function(e) {
    if (e.target !== searchInput && e.target !== suggestionsContainer) {
        suggestionsContainer.innerHTML = '';
    }
});

//Update wishlist UI
function updateWishlistUI() {
    const wishlistContainer = document.getElementById('wishlistContainer');
    wishlistContainer.innerHTML = '';
    wishlist.forEach(product => {
        const productElement = document.createElement('div');
        productElement.classList.add('wishlist-item');
        productElement.innerHTML = `
            <img src="${product.image}" alt="${product.name}" />
            <h3>${product.name}</h3>
            <p>${product.price}</p>
            <button onclick="removeFromWishlist('${product.id}')">Remove</button>
        `;
        wishlistContainer.appendChild(productElement);
    });
}
