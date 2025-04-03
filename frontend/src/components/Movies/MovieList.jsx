import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

function MovieList() {
  const [movies, setMovies] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [genre, setGenre] = useState('');
  const [rating, setRating] = useState('');
  const [decade, setDecade] = useState('');

  const genres = [
    { id: 27, name: 'Horror' },
    { id: 28, name: 'Action' },
    { id: 35, name: 'Comedy' },
    { id: 18, name: 'Drama' },
    { id: 10749, name: 'Romance' },
  ];

  const ratings = ['5', '4.5', '4', '3.5', '3'];
  const decades = ['2020', '2010', '2000', '1990', '1980', '1970', '1960', '1950', '1940', '1930'];

  useEffect(() => {
    if (searchQuery) {
      axios.get(`${import.meta.env.VITE_API_URL}/movies/search`, { params: { query: searchQuery } })
        .then(res => setMovies(res.data.results))
        .catch(err => console.error(err));
    } else {
      axios.get(`${import.meta.env.VITE_API_URL}/movies/discover`, {
        params: { genre, rating, decade },
      })
        .then(res => setMovies(res.data.results))
        .catch(err => console.error(err));
    }
  }, [searchQuery, genre, rating, decade]);

  const handleSearch = (e) => {
    e.preventDefault();
    setGenre('');
    setRating('');
    setDecade('');
  };

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Browse Movies</h2>
      <form onSubmit={handleSearch} className="mb-4 flex space-x-4">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search movies..."
          className="w-full p-2 bg-gray-800 border border-gray-600 rounded"
        />
        <button type="submit" className="p-2 bg-accent text-primary rounded hover:bg-yellow-500">
          Search
        </button>
      </form>
      <div className="flex space-x-4 mb-4">
        <select
          value={genre}
          onChange={(e) => setGenre(e.target.value)}
          className="p-2 bg-gray-800 border border-gray-600 rounded"
        >
          <option value="">All Genres</option>
          {genres.map(g => (
            <option key={g.id} value={g.id}>{g.name}</option>
          ))}
        </select>
        <select
          value={rating}
          onChange={(e) => setRating(e.target.value)}
          className="p-2 bg-gray-800 border border-gray-600 rounded"
        >
          <option value="">All Ratings</option>
          {ratings.map(r => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
        <select
          value={decade}
          onChange={(e) => setDecade(e.target.value)}
          className="p-2 bg-gray-800 border border-gray-600 rounded"
        >
          <option value="">All Decades</option>
          {decades.map(d => (
            <option key={d} value={d}>{d}s</option>
          ))}
        </select>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {movies.map(movie => (
          <Link to={`/movie/${movie.id}`} key={movie.id} className="p-4 bg-gray-800 rounded-lg shadow-md">
            <img
              src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
              alt={movie.title}
              className="w-full h-64 object-cover rounded-lg mb-2"
            />
            <h3 className="text-lg font-semibold">{movie.title}</h3>
            <p>Rating: {movie.vote_average}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default MovieList;