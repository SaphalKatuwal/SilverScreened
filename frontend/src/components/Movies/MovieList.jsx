import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';

const MovieList = () => {
  const [movies, setMovies] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState('');

  const handleSearch = async (e) => {
    e.preventDefault();
    try {
      const response = await api.get('/movies/search', { params: { query: searchQuery } });
      setMovies(response.data.results);
    } catch (err) {
      setError('Failed to search movies');
    }
  };

  useEffect(() => {
    const fetchPopularMovies = async () => {
      try {
        const response = await api.get('/movies/popular');
        setMovies(response.data.results);
      } catch (err) {
        setError('Failed to fetch popular movies');
      }
    };
    fetchPopularMovies();
  }, []);

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Browse Movies</h2>
      <form onSubmit={handleSearch} className="mb-4">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search movies..."
          className="p-2 rounded-l bg-secondary text-white w-64"
        />
        <button type="submit" className="p-2 bg-accent text-white rounded-r hover:bg-orange-600">
          Search
        </button>
      </form>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {movies.map((movie) => (
          <Link to={`/movie/${movie.id}`} key={movie.id} className="bg-secondary rounded-lg overflow-hidden shadow-md hover:shadow-lg">
            <img
              src={`https://image.tmdb.org/t/p/w200${movie.poster_path}`}
              alt={movie.title}
              className="w-full h-64 object-cover"
            />
            <div className="p-4">
              <h3 className="text-lg font-semibold">{movie.title}</h3>
              <p className="text-sm text-gray-400">{movie.release_date}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default MovieList;