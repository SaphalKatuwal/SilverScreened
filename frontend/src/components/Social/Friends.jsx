import { useState, useEffect, useContext } from 'react';
import api from '../../services/api';
import { AuthContext } from '../../context/AuthContext';

const Friends = () => {
  const { token } = useContext(AuthContext);
  const [friends, setFriends] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) return;
    const fetchFriends = async () => {
      try {
        const response = await api.get('/users/friends');
        setFriends(response.data);
      } catch (err) {
        setError('Failed to fetch friends');
      }
    };
    fetchFriends();
  }, [token]);

  if (!token) return <div className="container mx-auto p-4">Please log in to view friends.</div>;

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Friends</h2>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      {friends.length === 0 ? (
        <p>You have no friends yet.</p>
      ) : (
        <div className="space-y-4">
          {friends.map((friend) => (
            <div key={friend._id} className="bg-secondary p-4 rounded-lg">
              <p>{friend.email}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Friends;