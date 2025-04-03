import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { Link } from 'react-router-dom';

function Profile() {
  const { user, token } = useContext(AuthContext);
  const [profile, setProfile] = useState(null);
  const [username, setUsername] = useState('');
  const [location, setLocation] = useState('');
  const [bio, setBio] = useState('');
  const [favoriteFilms, setFavoriteFilms] = useState([]);
  const [watchlist, setWatchlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editError, setEditError] = useState(null);
  const [profilePicture, setProfilePicture] = useState(null);
  const [isAddingFavorite, setIsAddingFavorite] = useState(false);

  const fetchData = async () => {
    try {
      if (user) {
        // Fetch user profile
        const profileRes = await axios.get(`${import.meta.env.VITE_API_URL}/users/profile`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const userProfile = profileRes.data;
        
        setProfile(userProfile);
        setUsername(userProfile.username || '');
        setLocation(userProfile.location || '');
        setBio(userProfile.bio || '');
        
        // Fetch favorite films (limit to 5)
        if (userProfile.favoriteFilms?.length > 0) {
          const favoriteFilmsData = await Promise.all(
            userProfile.favoriteFilms.slice(0, 5).map(async (id) => {
              const res = await axios.get(`${import.meta.env.VITE_API_URL}/movies/${id}`);
              return res.data;
            })
          );
          setFavoriteFilms(favoriteFilmsData);
        }

        // Set watchlist count
        setWatchlist(userProfile.watchlist || []);
        setLoading(false);
      }
    } catch (err) {
      console.error('Error fetching profile data:', err);
      setError('Failed to load profile data. Please try again later.');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user, token]);

  const handleEditProfile = async (e) => {
    e.preventDefault();
    try {
      setEditError(null);
      const formData = new FormData();
      formData.append('username', username);
      formData.append('location', location);
      formData.append('bio', bio);
      if (profilePicture) {
        formData.append('profilePicture', profilePicture);
      }

      const res = await axios.put(
        `${import.meta.env.VITE_API_URL}/users/profile`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      setProfile(res.data);
      setIsEditing(false);
    } catch (err) {
      console.error('Error updating profile:', err);
      setEditError(err.response?.data?.error || 'Failed to update profile. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-4">
        <p className="text-red-500">{error}</p>
        <button 
          onClick={fetchData}
          className="mt-4 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-gray-900 rounded-lg shadow-xl p-6">
        {/* Profile Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="w-24 h-24 bg-purple-600 rounded-full overflow-hidden">
              {profile?.profilePicture ? (
                <img 
                  src={profile.profilePicture}
                  alt="Profile"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '';
                    e.target.parentElement.innerHTML = `<span class="text-3xl text-white flex items-center justify-center h-full">${username?.charAt(0)?.toUpperCase()}</span>`;
                  }}
                />
              ) : (
                <span className="text-3xl text-white flex items-center justify-center h-full">
                  {username?.charAt(0)?.toUpperCase()}
                </span>
              )}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">{username}</h1>
              {location && <p className="text-gray-400">{location}</p>}
              {bio && <p className="text-gray-300 mt-2">{bio}</p>}
            </div>
          </div>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
          >
            {isEditing ? 'Cancel' : 'Edit Profile'}
          </button>
        </div>

        {/* Edit Profile Form */}
        {isEditing && (
          <form onSubmit={handleEditProfile} className="mb-6 p-4 bg-gray-800 rounded-lg">
            <div className="space-y-4">
              <div>
                <label className="block text-gray-300 mb-2">Username</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 text-white rounded"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-300 mb-2">Location</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 text-white rounded"
                />
              </div>
              <div>
                <label className="block text-gray-300 mb-2">Bio</label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 text-white rounded"
                  rows="3"
                />
              </div>
              <div>
                <label className="block text-gray-300 mb-2">Profile Picture</label>
                <input
                  type="file"
                  onChange={(e) => setProfilePicture(e.target.files[0])}
                  className="w-full px-3 py-2 bg-gray-700 text-white rounded"
                  accept="image/*"
                />
              </div>
              {editError && <p className="text-red-500">{editError}</p>}
              <button
                type="submit"
                className="w-full px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
              >
                Save Changes
              </button>
            </div>
          </form>
        )}

        {/* Statistics */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-gray-800 p-4 rounded-lg text-center">
            <p className="text-2xl font-bold text-purple-500">{watchlist.length}</p>
            <p className="text-gray-400">Watchlist</p>
          </div>
          <div className="bg-gray-800 p-4 rounded-lg text-center">
            <p className="text-2xl font-bold text-purple-500">{profile?.watchedMovies?.length || 0}</p>
            <p className="text-gray-400">Total Watched</p>
          </div>
          <div className="bg-gray-800 p-4 rounded-lg text-center">
            <p className="text-2xl font-bold text-purple-500">
              {profile?.watchedMovies?.filter(movie => 
                new Date(movie.watchedAt).getFullYear() === new Date().getFullYear()
              ).length || 0}
            </p>
            <p className="text-gray-400">Watched This Year</p>
          </div>
        </div>

        {/* Top 5 Favorite Movies Section */}
        <div className="mt-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-white">Top 5 Favorite Movies</h2>
            {favoriteFilms.length < 5 && (
              <Link
                to="/browse"
                className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
              >
                Add from Browse Movies
              </Link>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {[...Array(5)].map((_, index) => {
              const movie = favoriteFilms[index];
              
              return (
                <div key={index} className="relative bg-gray-800 rounded-lg overflow-hidden h-72">
                  {movie ? (
                    <>
                      <img
                        src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                        alt={movie.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black p-3">
                        <p className="text-white font-medium">{movie.title}</p>
                        <p className="text-gray-400 text-sm">{movie.release_date?.split('-')[0]}</p>
                      </div>
                      <button
                        onClick={() => handleRemoveFavorite(movie.id)}
                        className="absolute top-2 right-2 p-1 bg-red-500 rounded-full opacity-0 hover:opacity-100 transition-opacity"
                      >
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <p className="text-gray-500 text-center">
                        {isAddingFavorite ? "Search for a movie..." : "Empty slot"}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;