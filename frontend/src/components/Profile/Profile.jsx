import { useState, useEffect, useContext } from 'react';
import api from '../../services/api';
import { AuthContext } from '../../context/AuthContext';
import { Link } from 'react-router-dom';

const Profile = () => {
  const { token } = useContext(AuthContext);
  const [user, setUser] = useState(null);
  const [watchlistMovies, setWatchlistMovies] = useState([]);
  const [watchedMovies, setWatchedMovies] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) return;
    const fetchProfile = async () => {
      try {
        const userResponse = await api.get('/users/profile');
        setUser(userResponse.data);

        // Fetch watchlist movies
        const watchlistPromises = userResponse.data.watchlist.map(async (id) => {
          const response = await api.get(`/movies/${id}`);
          return response.data;
        });
        const watchlistData = await Promise.all(watchlistPromises);
        setWatchlistMovies(watchlistData);

        // Fetch watched movies
        const watchedPromises = userResponse.data.watchedMovies.map(async (wm) => {
          const response = await api.get(`/movies/${wm.movieId}`);
          return { ...response.data, watchedAt: wm.watchedAt };
        });
        const watchedData = await Promise.all(watchedPromises);
        setWatchedMovies(watchedData);
      } catch (err) {
        setError('Failed to fetch profile');
      }
    };
    fetchProfile();
  }, [token]);

  if (!token) return <div className="container mx-auto p-4">Please log in to view your profile.</div>;
  if (!user) return <div className="container mx-auto p-4">Loading...</div>;

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Profile</h2>
      <p className="mb-4">Email: {user.email}</p>
      {error && <p className="text-red-500 mb-4">{error}</p>}

      <h3 className="text-xl font-bold mb-2">Watchlist</h3>
      {watchlistMovies.length === 0 ? (
        <p>No movies in watchlist.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
          {watchlistMovies.map((movie) => (
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

      <h3 className="text-xl font-bold mb-2">Watched Movies</h3>
      {watchedMovies.length === 0 ? (
        <p>No movies watched yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {watchedMovies.map((movie) => (
            <Link to={`/movie/${movie.id}`} key={movie.id} className="bg-secondary rounded-lg overflow-hidden shadow-md hover:shadow-lg">
              <img
                src={`https://image.tmdb.org/t/p/w200${movie.poster_path}`}
                alt={movie.title}
                className="w-full h-64 object-cover"
              />
              <div className="p-4">
                <h4 className="text-lg font-semibold">{movie.title}</h4>
                <p className="text-sm text-gray-400">{movie.release_date}</p>
                <p className="text-sm text-gray-400">Watched on: {new Date(movie.watchedAt).toLocaleDateString()}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Profile;