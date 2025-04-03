import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';

function Following() {
  const { user, token } = useContext(AuthContext);
  const [following, setFollowing] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFollowing = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/users/following`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setFollowing(response.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching following:', err);
        setError('Failed to load following list. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchFollowing();
    }
  }, [user, token]);

  const handleUnfollow = async (followId) => {
    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/users/unfollow`,
        { followId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setFollowing(following.filter(user => user._id !== followId));
    } catch (err) {
      console.error('Error unfollowing user:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-xl">Loading following list...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-red-500 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <h2 className="text-4xl font-bold mb-8 text-center bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
          Following
        </h2>
        {following.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-400 text-lg">You are not following anyone yet.</p>
            <p className="text-gray-400 mt-2">Start following users to see their movie activities!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {following.map(user => (
              <div key={user._id} className="bg-gray-800 rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center text-2xl font-bold">
                    {user.email[0].toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">{user.email}</h3>
                    <p className="text-gray-400 text-sm">Member since {new Date(user.createdAt).getFullYear()}</p>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-400">
                    <span className="font-semibold text-white">{user.watchedMovies?.length || 0}</span> movies watched
                  </div>
                  <button
                    onClick={() => handleUnfollow(user._id)}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Unfollow
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Following;