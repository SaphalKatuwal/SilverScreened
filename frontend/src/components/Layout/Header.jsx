import { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

function Header() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [activeDropdown, setActiveDropdown] = useState(null);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleDropdownEnter = (dropdown) => {
    setActiveDropdown(dropdown);
  };

  const handleDropdownLeave = () => {
    setActiveDropdown(null);
  };

  return (
    <header className="bg-gray-900 border-b border-gray-800">
      <nav className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold text-purple-500 hover:text-purple-400 transition-colors">
            SilverScreened
          </Link>
          
          <div className="flex items-center space-x-6">
            <Link to="/movies" className="text-gray-300 hover:text-purple-400 transition-colors">
              Browse Movies
            </Link>
            {user && (
              <>
                <Link to="/diary" className="text-gray-300 hover:text-purple-400 transition-colors">
                  My Diary
                </Link>
                <Link to="/recommendations" className="text-gray-300 hover:text-purple-400 transition-colors">
                  Recommendations
                </Link>
                <div 
                  className="relative"
                  onMouseEnter={() => handleDropdownEnter('social')}
                  onMouseLeave={handleDropdownLeave}
                >
                  <button className="text-gray-300 hover:text-purple-400 transition-colors">
                    Social
                  </button>
                  <div 
                    className={`absolute right-0 mt-2 w-48 bg-gray-800 rounded-lg shadow-lg py-2 transition-all duration-200 ${
                      activeDropdown === 'social' ? 'opacity-100 visible' : 'opacity-0 invisible'
                    }`}
                  >
                    <Link to="/following" className="block px-4 py-2 text-gray-300 hover:bg-gray-700 hover:text-purple-400">
                      Following
                    </Link>
                    <Link to="/friends" className="block px-4 py-2 text-gray-300 hover:bg-gray-700 hover:text-purple-400">
                      Friends
                    </Link>
                  </div>
                </div>
                <div 
                  className="relative"
                  onMouseEnter={() => handleDropdownEnter('account')}
                  onMouseLeave={handleDropdownLeave}
                >
                  <button className="text-gray-300 hover:text-purple-400 transition-colors">
                    Account
                  </button>
                  <div 
                    className={`absolute right-0 mt-2 w-48 bg-gray-800 rounded-lg shadow-lg py-2 transition-all duration-200 ${
                      activeDropdown === 'account' ? 'opacity-100 visible' : 'opacity-0 invisible'
                    }`}
                  >
                    <Link to="/profile" className="block px-4 py-2 text-gray-300 hover:bg-gray-700 hover:text-purple-400">
                      Profile
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-gray-300 hover:bg-gray-700 hover:text-purple-400"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              </>
            )}
            {!user && (
              <>
                <Link to="/login" className="text-gray-300 hover:text-purple-400 transition-colors">
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
}

export default Header;