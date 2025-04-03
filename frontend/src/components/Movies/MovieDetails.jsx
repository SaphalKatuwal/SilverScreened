import { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import Rating from 'react-rating';
import { Editor } from 'react-draft-wysiwyg';
import { EditorState, ContentState, convertToRaw, convertFromHTML } from 'draft-js';
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';
import YouTube from 'react-youtube';
import draftToHtml from 'draftjs-to-html';

function MovieDetails() {
  const { id } = useParams();
  const { user, token } = useContext(AuthContext);
  const [movie, setMovie] = useState(null);
  const [rating, setRating] = useState(0);
  const [userRating, setUserRating] = useState(0);
  const [editorState, setEditorState] = useState(EditorState.createEmpty());
  const [reviews, setReviews] = useState([]);
  const [editReviewId, setEditReviewId] = useState(null);
  const [editRating, setEditRating] = useState(0);
  const [editEditorState, setEditEditorState] = useState(EditorState.createEmpty());

  useEffect(() => {
    axios.get(`${import.meta.env.VITE_API_URL}/movies/${id}`)
      .then(res => setMovie(res.data))
      .catch(err => console.error(err));

    axios.get(`${import.meta.env.VITE_API_URL}/reviews/movie/${id}`)
      .then(res => {
        setReviews(res.data.map(review => ({
          ...review,
          editorState: EditorState.createWithContent(
            ContentState.createFromBlockArray(convertFromHTML(review.comment))
          ),
        })));
      })
      .catch(err => console.error(err));

    if (user) {
      axios.get(`${import.meta.env.VITE_API_URL}/ratings/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => setUserRating(res.data.rating))
        .catch(err => console.error(err));
    }
  }, [id, user, token]);

  const handleWatchlist = async (action) => {
    await axios.post(
      `${import.meta.env.VITE_API_URL}/users/watchlist/${action}`,
      { movieId: id },
      { headers: { Authorization: `Bearer ${token}` } }
    );
  };

  const handleWatched = async () => {
    await axios.post(
      `${import.meta.env.VITE_API_URL}/users/watched`,
      { movieId: id },
      { headers: { Authorization: `Bearer ${token}` } }
    );
  };

  const handleRatingChange = async (value) => {
    setRating(value);
    if (user) {
      try {
        await axios.post(
          `${import.meta.env.VITE_API_URL}/ratings`,
          { movieId: id, rating: value },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setUserRating(value);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    const comment = draftToHtml(convertToRaw(editorState.getCurrentContent()));
    const editComment = draftToHtml(convertToRaw(editEditorState.getCurrentContent()));

    if (editReviewId) {
      await axios.put(
        `${import.meta.env.VITE_API_URL}/reviews/${editReviewId}`,
        { rating: editRating, comment: editComment },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEditReviewId(null);
      setEditRating(0);
      setEditEditorState(EditorState.createEmpty());
    } else {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/reviews`,
        { movieId: id, rating, comment },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    }
    setRating(0);
    setEditorState(EditorState.createEmpty());
    axios.get(`${import.meta.env.VITE_API_URL}/reviews/movie/${id}`)
      .then(res => {
        setReviews(res.data.map(review => ({
          ...review,
          editorState: EditorState.createWithContent(
            ContentState.createFromBlockArray(convertFromHTML(review.comment))
          ),
        })));
      });
  };

  const handleEdit = (review) => {
    setEditReviewId(review._id);
    setEditRating(review.rating);
    setEditEditorState(review.editorState);
  };

  const handleDelete = async (reviewId) => {
    await axios.delete(`${import.meta.env.VITE_API_URL}/reviews/${reviewId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setReviews(reviews.filter(r => r._id !== reviewId));
  };

  if (!movie) return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500"></div>
    </div>
  );

  const director = movie.credits?.crew.find(member => member.job === 'Director')?.name;
  const mainCast = movie.credits?.cast.slice(0, 3).map(c => c.name).join(', ');
  const trailer = movie.videos?.results.find(video => video.type === 'Trailer' && video.site === 'YouTube');

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Hero Section */}
      <div className="relative h-[60vh] w-full">
        <div className="absolute inset-0 bg-gradient-to-r from-gray-900 to-transparent z-10"></div>
        <img
          src={`https://image.tmdb.org/t/p/original${movie.backdrop_path}`}
          alt={movie.title}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Movie Details Section */}
      <div className="container mx-auto px-4 -mt-32 relative z-20">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Poster */}
          <div className="md:w-1/3">
            <img
              src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
              alt={movie.title}
              className="w-full rounded-lg shadow-2xl"
            />
          </div>

          {/* Movie Info and Reviews */}
          <div className="md:w-2/3">
            <div>
              <h1 className="text-4xl font-bold mb-4">{movie.title}</h1>
              <div className="flex items-center space-x-4 mb-6">
                <div className="flex items-center">
                  <svg className="w-6 h-6 text-yellow-400 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span className="text-xl">{movie.vote_average.toFixed(1)}</span>
                </div>
                <span className="text-gray-400">•</span>
                <span>{movie.runtime} minutes</span>
                <span className="text-gray-400">•</span>
                <span>{new Date(movie.release_date).getFullYear()}</span>
              </div>

              <div className="prose prose-invert max-w-none mb-6">
                <p className="text-lg leading-relaxed">{movie.overview}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <h3 className="text-gray-400 text-sm">Director</h3>
                  <p className="font-semibold">{director}</p>
                </div>
                <div>
                  <h3 className="text-gray-400 text-sm">Main Cast</h3>
                  <p className="font-semibold">{mainCast}</p>
                </div>
              </div>

              {/* Log this movie Section */}
              <div className="bg-gray-800 rounded-lg p-4 mb-8">
                <h2 className="text-xl font-bold mb-4">Log this movie</h2>
                <div className="space-y-4">
                  {/* Rating */}
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Rate this movie</label>
                    <Rating
                      initialRating={userRating}
                      onChange={handleRatingChange}
                      emptySymbol={<span className="text-gray-600 text-2xl">☆</span>}
                      fullSymbol={<span className="text-yellow-400 text-2xl">★</span>}
                      fractions={2}
                    />
                    {!user && (
                      <p className="text-sm text-gray-400 mt-2">Please log in to rate this movie</p>
                    )}
                  </div>

                  {/* Action Buttons */}
                  {user && (
                    <div className="flex space-x-4">
                      <button
                        onClick={() => handleWatchlist('add')}
                        className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                      >
                        Add to Watchlist
                      </button>
                      <button
                        onClick={handleWatched}
                        className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      >
                        Mark as Watched
                      </button>
                    </div>
                  )}

                  {/* Review Form */}
                  {user && (
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Write a Review</h3>
                      <form onSubmit={handleReviewSubmit} className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-400 mb-1">Review</label>
                          {editReviewId ? (
                            <Editor
                              editorState={editEditorState}
                              onEditorStateChange={setEditEditorState}
                              wrapperClassName="bg-gray-700 rounded-lg"
                              editorClassName="bg-gray-700 text-white border border-gray-600 rounded-lg p-2"
                              toolbar={{
                                options: ['inline', 'list', 'textAlign', 'history'],
                                inline: { options: ['bold', 'italic'] },
                                list: { options: ['unordered', 'ordered'] },
                              }}
                            />
                          ) : (
                            <Editor
                              editorState={editorState}
                              onEditorStateChange={setEditorState}
                              wrapperClassName="bg-gray-700 rounded-lg"
                              editorClassName="bg-gray-700 text-white border border-gray-600 rounded-lg p-2"
                              toolbar={{
                                options: ['inline', 'list', 'textAlign', 'history'],
                                inline: { options: ['bold', 'italic'] },
                                list: { options: ['unordered', 'ordered'] },
                              }}
                            />
                          )}
                        </div>
                        <div className="flex space-x-3">
                          <button
                            type="submit"
                            className="px-4 py-1.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
                          >
                            {editReviewId ? 'Update Review' : 'Submit Review'}
                          </button>
                          {editReviewId && (
                            <button
                              onClick={() => setEditReviewId(null)}
                              className="px-4 py-1.5 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm"
                            >
                              Cancel
                            </button>
                          )}
                        </div>
                      </form>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Trailer and Reviews Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
          {/* Trailer Section */}
          <div>
            <h2 className="text-2xl font-bold mb-4">Trailer</h2>
            {trailer ? (
              <div className="relative pt-[56.25%] bg-gray-800 rounded-lg overflow-hidden">
                <YouTube
                  videoId={trailer.key}
                  opts={{
                    width: '100%',
                    height: '100%',
                    playerVars: {
                      autoplay: 0,
                    },
                  }}
                  className="absolute top-0 left-0 w-full h-full"
                />
              </div>
            ) : (
              <div className="bg-gray-800 rounded-lg p-6 text-center">
                <p className="text-gray-400 text-lg">No trailer available for this movie.</p>
              </div>
            )}
          </div>

          {/* Reviews Section */}
          <div>
            <h2 className="text-2xl font-bold mb-4">Popular Reviews</h2>
            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
              {reviews.map(review => (
                <div key={review._id} className="bg-gray-800 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-semibold text-sm">{review.user.email}</p>
                      <Rating
                        initialRating={review.rating}
                        readonly
                        emptySymbol={<span className="text-gray-600 text-lg">☆</span>}
                        fullSymbol={<span className="text-yellow-400 text-lg">★</span>}
                        fractions={2}
                      />
                    </div>
                    {user && review.user._id === user._id && (
                      <div className="flex space-x-1">
                        <button
                          onClick={() => handleEdit(review)}
                          className="px-2 py-0.5 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-xs"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(review._id)}
                          className="px-2 py-0.5 bg-red-600 text-white rounded hover:bg-red-700 transition-colors text-xs"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="prose prose-invert max-w-none text-sm">
                    <div dangerouslySetInnerHTML={{ __html: review.comment }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MovieDetails;