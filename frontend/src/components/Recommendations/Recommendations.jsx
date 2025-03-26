import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { AuthContext } from '../../context/AuthContext';

const Recommendations = () => {
  const { token } = useContext(AuthContext);
  const [socialRecs, setSocialRecs] = useState([]);
  const [genreRecs, setGenreRecs] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) return;
    const fetchRecommendations = async () => {
      try {
        const response = await api.get('/recommendations');
        setSocialRecs(response.data.social);
        setGenreRecs(response.data.genre);
      } catch (err) {
        setError('Failed to fetch recommendations');
      }
    };
    fetchRecommendations();
  }, [token]);

  if (!token) return <div className="container mx-auto p-4">Please log in to view recommendations.</div>;

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Recommendations</h2>
      {error && <p className="text-red-500 mb-4">{error}</p>}

      <h3 className="text-xl font-bold mb-2">Based on Your Followed Users</h3>
      {socialRecs.length === 0 ? (
        <p>No social recommendations available.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
          {socialRecs.map((movie) => (
            <Link to={`/movie/${movie.id}`} key={movie.id} className="bg-secondary rounded-lg overflow-hidden shadow-md hover:shadow-lg">
              <img
                src={`https://image.tmdb.org/t/p/w200${movie.poster_path}`}
                alt={movie.title}
                className="w-full h-64 object-cover"
              />
              <div className="p-4">
                <h4 className="text-lg font-semibold">{movie.title}</h4>
                <p className="text-sm text-gray-400">{movie.release_date}</p>
              </div>
            </Link>
          ))}
        </div>
      )}

      <h3 className="text-xl font-bold mb-2">Based on Your Recent Genres</h3>
      {genreRecs.length === 0 ? (
        <p>No genre-based recommendations available.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {genreRecs.map((movie) => (
            <Link to={`/movie/${movie.id}`} key={movie.id} className="bg-secondary rounded-lg overflow-hidden shadow-md hover:shadow-lg">
              <img
                src={`https://image.tmdb.org/t/p/w200${movie.poster_path}`}
                alt={movie.title}
                className="w-full h-64 object-cover"
              />
              <div className="p-4">
                <h4 className="text-lg font-semibold">{movie.title}</h4>
                <p className="text-sm text-gray-400">{movie.release_date}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Recommendations;