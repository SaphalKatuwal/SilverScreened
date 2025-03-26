import { useState, useEffect, useContext } from 'react';
import api from '../../services/api';
import { AuthContext } from '../../context/AuthContext';

const Following = () => {
  const { token } = useContext(AuthContext);
  const [following, setFollowing] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) return;
    const fetchFollowing = async () => {
      try {
        const response = await api.get('/users/profile');
        const followingUsers = await Promise.all(
          response.data.following.map(async (id) => {
            const userResponse = await api.get(`/users/profile/${id}`);
            return userResponse.data;
          })
        );
        setFollowing(followingUsers);
      } catch (err) {
        setError('Failed to fetch following');
      }
    };
    fetchFollowing();
  }, [token]);

  const handleUnfollow = async (followId) => {
    try {
      await api.post('/users/unfollow', { followId });
      setFollowing(following.filter(user => user._id !== followId));
    } catch (err) {
      setError('Failed to unfollow user');
    }
  };

  if (!token) return <div className="container mx-auto p-4">Please log in to view following.</div>;

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Following</h2>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      {following.length === 0 ? (
        <p>You are not following anyone.</p>
      ) : (
        <div className="space-y-4">
          {following.map((user) => (
            <div key={user._id} className="bg-secondary p-4 rounded-lg flex justify-between items-center">
              <p>{user.email}</p>
              <button onClick={() => handleUnfollow(user._id)} className="p-2 bg-accent text-white rounded hover:bg-orange-600">
                Unfollow
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Following;