import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

function Diary() {
  const [watchedMovies, setWatchedMovies] = useState([]);
  const [watchlist, setWatchlist] = useState([]);
  const [favoriteMovies, setFavoriteMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        // First get the user's profile with watched movies and watchlist IDs
        const profileResponse = await axios.get(`${import.meta.env.VITE_API_URL}/users/profile`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });

        // Fetch full movie details for watched movies
        const watchedPromises = profileResponse.data.watchedMovies.map(async (watched) => {
          const movieResponse = await axios.get(`${import.meta.env.VITE_API_URL}/movies/${watched.movieId}`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
          });
          return {
            ...movieResponse.data,
            watchedAt: watched.watchedAt,
            rating: watched.rating
          };
        });

        // Fetch full movie details for watchlist
        const watchlistPromises = profileResponse.data.watchlist.map(async (movieId) => {
          const movieResponse = await axios.get(`${import.meta.env.VITE_API_URL}/movies/${movieId}`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
          });
          return movieResponse.data;
        });

        const watchedResults = await Promise.all(watchedPromises);
        const watchlistResults = await Promise.all(watchlistPromises);

        setWatchedMovies(watchedResults);
        setWatchlist(watchlistResults);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching movies:', err);
        setError('Failed to load movies');
        setLoading(false);
      }
    };

    fetchMovies();
  }, []);

  // Function to remove movie from watchlist
  const removeFromWatchlist = async (movieId) => {
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/users/watchlist/${movieId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setWatchlist(watchlist.filter(movie => movie._id !== movieId));
    } catch (err) {
      console.error('Error removing from watchlist:', err);
    }
  };

  // Function to remove movie from watched
  const removeFromWatched = async (movieId) => {
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/users/watched/${movieId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setWatchedMovies(watchedMovies.filter(movie => movie._id !== movieId));
    } catch (err) {
      console.error('Error removing from watched:', err);
    }
  };

  // Function to toggle favorite status
  const toggleFavorite = async (movie) => {
    try {
      if (favoriteMovies.some(fav => fav._id === movie._id)) {
        // Remove from favorites
        await axios.delete(`${import.meta.env.VITE_API_URL}/users/favorites/${movie._id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setFavoriteMovies(favoriteMovies.filter(fav => fav._id !== movie._id));
      } else if (favoriteMovies.length < 5) {
        // Add to favorites
        await axios.post(`${import.meta.env.VITE_API_URL}/users/favorites`, 
          { movieId: movie._id },
          { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }}
        );
        setFavoriteMovies([...favoriteMovies, movie]);
      }
    } catch (err) {
      console.error('Error updating favorites:', err);
    }
  };

  const MovieCard = ({ movie, isWatched }) => (
    <div className="bg-gray-800 rounded-lg overflow-hidden shadow-lg relative group">
      <Link to={`/movies/${movie._id}`}>
        <div className="relative">
          <img 
            src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
            alt={movie.title}
            className="w-full h-64 object-cover"
          />
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black">
            <h3 className="text-white font-semibold text-lg">{movie.title}</h3>
            <p className="text-gray-300 text-sm">{movie.release_date?.split('-')[0]}</p>
          </div>
        </div>
      </Link>

      <div className="p-4">
        {isWatched && (
          <>
            {movie.rating && (
              <div className="text-purple-400 mb-2">
                {'★'.repeat(movie.rating)}
                {'☆'.repeat(5 - movie.rating)}
              </div>
            )}
            {movie.watchedAt && (
              <p className="text-gray-400 text-sm">
                Watched on {new Date(movie.watchedAt).toLocaleDateString()}
              </p>
            )}
          </>
        )}
      </div>

      {/* Action buttons */}
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
        {isWatched ? (
          <>
            <button
              onClick={(e) => {
                e.preventDefault();
                removeFromWatched(movie._id);
              }}
              className="p-2 bg-red-500 rounded-full hover:bg-red-600 transition-colors"
              title="Remove from watched"
            >
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <button
              onClick={(e) => {
                e.preventDefault();
                toggleFavorite(movie);
              }}
              className={`p-2 rounded-full transition-colors ${
                favoriteMovies.some(fav => fav._id === movie._id)
                  ? 'bg-yellow-500 hover:bg-yellow-600'
                  : 'bg-gray-600 hover:bg-gray-700'
              }`}
              title={favoriteMovies.some(fav => fav._id === movie._id) ? 'Remove from favorites' : 'Add to favorites'}
              disabled={!favoriteMovies.some(fav => fav._id === movie._id) && favoriteMovies.length >= 5}
            >
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </button>
          </>
        ) : (
          <button
            onClick={(e) => {
              e.preventDefault();
              removeFromWatchlist(movie._id);
            }}
            className="p-2 bg-red-500 rounded-full hover:bg-red-600 transition-colors"
            title="Remove from watchlist"
          >
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500 p-4">
        {error}
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Favorite Movies Counter */}
      <div className="mb-6 bg-gray-800 p-4 rounded-lg">
        <h3 className="text-white font-semibold">
          Favorite Movies Selected: {favoriteMovies.length}/5
        </h3>
        <p className="text-gray-400 text-sm mt-1">
          {favoriteMovies.length < 5 
            ? 'Select your favorite movies from your watched list'
            : 'You have selected all 5 favorite movies'}
        </p>
      </div>

      {/* Watched Movies Section */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-6">
          Watched Movies
          <span className="text-gray-400 text-lg ml-2">({watchedMovies.length})</span>
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {watchedMovies.map(movie => (
            <MovieCard key={movie._id} movie={movie} isWatched={true} />
          ))}
        </div>
      </section>

      {/* Watchlist Section */}
      <section>
        <h2 className="text-2xl font-bold text-white mb-6">
          Watchlist
          <span className="text-gray-400 text-lg ml-2">({watchlist.length})</span>
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {watchlist.map(movie => (
            <MovieCard key={movie._id} movie={movie} isWatched={false} />
          ))}
        </div>
      </section>
    </div>
  );
}

export default Diary;