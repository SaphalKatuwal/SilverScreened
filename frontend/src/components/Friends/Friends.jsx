import { useState, useEffect } from 'react';
import axios from 'axios';

function Friends() {
  const [suggestedUsers, setSuggestedUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSuggestedUsers = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/users/suggested`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setSuggestedUsers(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching suggested users:', error);
        setLoading(false);
      }
    };

    fetchSuggestedUsers();
  }, []);

  const handleFollow = async (userId) => {
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/users/follow/${userId}`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      // Remove user from suggestions after following
      setSuggestedUsers(prev => prev.filter(user => user._id !== userId));
    } catch (error) {
      console.error('Error following user:', error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold text-white mb-6">Suggested Users to Follow</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {suggestedUsers.map(user => (
          <div key={user._id} className="bg-gray-800 rounded-lg p-4 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center">
                {user.profilePicture ? (
                  <img 
                    src={user.profilePicture} 
                    alt={user.username} 
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <span className="text-xl text-white">{user.username[0].toUpperCase()}</span>
                )}
              </div>
              <div>
                <p className="text-white font-medium">{user.username}</p>
                <p className="text-gray-400 text-sm">{user.watchedMovies?.length || 0} movies watched</p>
              </div>
            </div>
            <button
              onClick={() => handleFollow(user._id)}
              className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
            >
              Follow
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Friends; 