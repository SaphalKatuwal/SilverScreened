import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import axios from 'axios';

function Recommendations() {
  const { token } = useContext(AuthContext);
  const [socialRecs, setSocialRecs] = useState([]);
  const [genreRecs, setGenreRecs] = useState([]);

  useEffect(() => {
    axios.get(`${import.meta.env.VITE_API_URL}/recommendations`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => {
        setSocialRecs(res.data.social);
        setGenreRecs(res.data.genre);
      })
      .catch(err => console.error(err));
  }, [token]);

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Recommendations</h2>
      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-2">Based on Followed Users</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {socialRecs.map(movie => (
            <div key={movie.id} className="p-4 bg-gray-800 rounded-lg shadow-md">
              <img
                src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                alt={movie.title}
                className="w-full h-64 object-cover rounded-lg mb-2"
              />
              <h3 className="text-lg font-semibold">{movie.title}</h3>
            </div>
          ))}
        </div>
      </div>
      <div>
        <h3 className="text-xl font-semibold mb-2">Based on Your Genres</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {genreRecs.map(movie => (
            <div key={movie.id} className="p-4 bg-gray-800 rounded-lg shadow-md">
              <img
                src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                alt={movie.title}
                className="w-full h-64 object-cover rounded-lg mb-2"
              />
              <h3 className="text-lg font-semibold">{movie.title}</h3>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Recommendations;