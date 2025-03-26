import { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

const Header = () => {
  const { token, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="bg-primary p-4 shadow-md">
      <nav className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold text-white">
          SilverScreened
        </Link>
        <div className="space-x-4">
          <Link to="/movies" className="text-white hover:text-accent">Movies</Link>
          <Link to="/recommendations" className="text-white hover:text-accent">Recommendations</Link>
          {token ? (
            <>
              <Link to="/profile" className="text-white hover:text-accent">Profile</Link>
              <Link to="/following" className="text-white hover:text-accent">Following</Link>
              <Link to="/friends" className="text-white hover:text-accent">Friends</Link>
              <button onClick={handleLogout} className="text-white hover:text-accent">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-white hover:text-accent">Login</Link>
              <Link to="/signup" className="text-white hover:text-accent">Signup</Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Header;