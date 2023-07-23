const apiKey = '727acad8'; // Replace this with your actual OMDB API key
const itemsPerPage = 10;
const  baseurl = "https://www.omdbapi.com/";
let currentPage = 1;
let currentMovies = [];

let currentSearchTerm = '';

function fetchMovies(page) {


    const searchTerm = currentSearchTerm.trim();

    const apiUrl = `https://www.omdbapi.com/?apikey=${apiKey}&s=${searchTerm}&type=movie&page=${page}`;

    

    //const apiUrl = `${baseurl}?s=${searchTerm}&apikey=${apiKey}&page=${page}`;

   //const apiUrl = `${baseurl}?s=${searchTerm}&apikey=${apiKey}&type=movie&page=${page}`;

    fetch(apiUrl)
        .then((response) => response.json())
        .then((data) => {
            if (data.Response === 'True') {
                currentMovies = data.Search;
                if (currentMovies && currentMovies.length > 0){
                    displayMovies(currentMovies);
                    displayPagination(data.totalResults, page);
                } else{
                    displayMovies([]);
                    displayPagination(0, page);
                    if (searchTerm === '') {
                        alert('No movies found. Try searching for a movie.');
                    } else {
                        alert('No movies found!');
                    }
                }

                // displayMovies(currentMovies);
                // displayPagination(data.totalResults, page);
            } else {
                displayMovies([]);
                displayPagination(0, page);
                alert('No movies found!');
            }
        })
        .catch((error) => {
            console.error('Error fetching data:', error);
        });
}

function displayMovies(movies) {
    const movieContainer = document.getElementById('movie-container');
    movieContainer.innerHTML = '';

    movies.forEach((movie) => {
        const movieCard = document.createElement('div');
        movieCard.classList.add('movie-card');
        movieCard.innerHTML = `
            <img src="${movie.Poster}" alt="${movie.Title}">
            <h3>${movie.Title}</h3>
        `;
        movieCard.addEventListener('click', () => displayMovieDetails(movie.imdbID));
        movieContainer.appendChild(movieCard);
    });
}

function displayPagination(totalResults, currentPage) {
    

    const paginationContainer = document.getElementById('pagination');
    paginationContainer.innerHTML = '';

    const totalPages = Math.ceil(totalResults / itemsPerPage);
    const maxVisiblePages = 5; // Maximum number of page buttons to display

    // Calculate the range of pages to display based on the current page
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    // Adjust startPage and endPage to always show maxVisiblePages buttons
    if (endPage - startPage < maxVisiblePages - 1) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    // Previous button
    if (currentPage > 1) {
        const prevButton = document.createElement('button');
        prevButton.innerText = 'Previous';
        prevButton.addEventListener('click', () => {
            fetchMovies(currentPage - 1);
        });
        paginationContainer.appendChild(prevButton);
    }

    // Page buttons
    for (let i = startPage; i <= endPage; i++) {
        const pageButton = document.createElement('button');
        pageButton.innerText = i;
        pageButton.addEventListener('click', () => {
            fetchMovies(i);
        });

        if (i === currentPage) {
            pageButton.classList.add('active');
        }

        paginationContainer.appendChild(pageButton);
    }

    // Next button
    if (currentPage < totalPages) {
        const nextButton = document.createElement('button');
        nextButton.innerText = 'Next';
        nextButton.addEventListener('click', () => {
            fetchMovies(currentPage + 1);
        });
        paginationContainer.appendChild(nextButton);
    }
}


// Function to save user rating and comment in local storage
function saveUserRatingAndComment(imdbID, rating, comment) {
    const savedData = getSavedData();
    const updatedData = { ...savedData, [imdbID]: { rating, comment } };
    localStorage.setItem('movieRatingsComments', JSON.stringify(updatedData));
}

// Function to get saved user ratings and comments from local storage
function getSavedData() {
    const data = localStorage.getItem('movieRatingsComments');
    return data ? JSON.parse(data) : {};
}

function displayMovieDetails(imdbID) {
    const modal = document.getElementById('modal');
    const modalContent = document.getElementById('modal-content');

    const userRatingInput = document.getElementById('user-rating');
    const userCommentInput = document.getElementById('user-comment');
    const saveRatingCommentBtn = document.getElementById('save-rating-comment-btn');

   

    fetch(`http://www.omdbapi.com/?apikey=${apiKey}&i=${imdbID}`)
        .then((response) => response.json())
        .then((data) => {
            debugger
            modalContent.innerHTML = `
                <span class="close-btn" id="close-btn">&times;</span>
                <h2>${data.Title}</h2>
                <p>Year: ${data.Year}</p>
                <p>Director: ${data.Director}</p>
                <p>Plot: ${data.Plot}</p>
                <p><strong>Language:</strong> <span>${data.Language}</span></p>
                <p><strong>Country:</strong> <span>${data.Country}</span></p>
                <p><strong>Awards:</strong> <span>${data.Awards}</span></p>
                <p><strong>IMDb Rating:</strong> <span>${data.imdbRating}</span></p>
                
                <p><strong>Metacritic Rating:</strong> <span>${data.Metascore}</span></p>
                <!-- Add rating and comment input fields here -->
                <!-- Add other movie details here -->

            `;

            // Show user rating and comment input fields
        

            // Check if the user has already rated and commented on this movie
            const savedData =  getSavedData(imdbID);
            debugger
            if (savedData) {
                // userRatingInput.value = savedData.rating;
                // userCommentInput.value = savedData.comment;
            } else {
                userRatingInput.value = '';
                userCommentInput.value = '';
            }
              
            // Add event listener to the Save Rating & Comment button
            saveRatingCommentBtn?.addEventListener('click', () => {
                const rating = parseInt(userRatingInput.value, 10);
                const comment = userCommentInput.value.trim();
                if (rating >= 1 && rating <= 5 && comment !== '') {
                    saveUserRatingAndComment(imdbID, rating, comment);
                    alert('Rating and comment saved successfully!');
                } else {
                    alert('Please provide a valid rating (1-5 stars) and a comment.');
                }
            });

            modal.style.display = 'block';

            document.getElementById('close-btn')?.addEventListener('click', () => {
                modal.style.display = 'none';
            });
            
        })
        .catch((error) => {
            console.error('Error fetching movie details:', error);
        });

    //  // Show user rating and comment input fields
    //  const userRatingInput = document.getElementById('user-rating');
    //  const userCommentInput = document.getElementById('user-comment');
    //  const saveRatingCommentBtn = document.getElementById('save-rating-comment-btn');
        
    // // Check if the user has already rated and commented on this movie
    // const savedData = getSavedData(imdbID);
    // if (savedData) {
    //     userRatingInput.value = savedData.rating;
    //     userCommentInput.value = savedData.comment;
    // } else {
    //     userRatingInput.value = '';
    //     userCommentInput.value = '';
    // }

    // // Add event listener to the Save Rating & Comment button
    // saveRatingCommentBtn.addEventListener('click', () => {
    //     const rating = parseInt(userRatingInput.value, 10);
    //     const comment = userCommentInput.value.trim();
    //     if (rating >= 1 && rating <= 5 && comment !== '') {
    //         saveUserRatingAndComment(imdbID, rating, comment);
    //         alert('Rating and comment saved successfully!');
    //     } else {
    //         alert('Please provide a valid rating (1-5 stars) and a comment.');
    //     }
    // });
    
}





document.getElementById('search-btn').addEventListener('click', () => {
    const searchTerm = document.getElementById('search').value.trim();
    currentSearchTerm = searchTerm; // Store the current search term
    if (searchTerm !== '') {
        fetchMovies(1);
    }
});

document.getElementById('pagination').addEventListener('click', (event) => {
    if (event.target.tagName === 'BUTTON') {
        const page = parseInt(event.target.innerText, 10);
        fetchMovies(page);
    }
});

// Initial fetch to display movies on page load
fetchMovies(currentPage);
