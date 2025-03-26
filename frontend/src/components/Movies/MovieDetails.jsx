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
  }, [id]);

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

  if (!movie) return <div>Loading...</div>;

  const director = movie.credits?.crew.find(member => member.job === 'Director')?.name;
  const mainCast = movie.credits?.cast.slice(0, 3).map(c => c.name).join(', ');
  const trailer = movie.videos?.results.find(video => video.type === 'Trailer' && video.site === 'YouTube');

  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
        <img
          src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
          alt={movie.title}
          className="w-full md:w-1/3 h-96 object-cover rounded-lg"
        />
        <div className="md:w-2/3">
          <h2 className="text-3xl font-bold">{movie.title}</h2>
          <p className="mt-2">{movie.overview}</p>
          <p className="mt-2">Director: {director}</p>
          <p>Main Cast: {mainCast}</p>
          <p>Duration: {movie.runtime} minutes</p>
          <p>Rating: {movie.vote_average}</p>
          {trailer && (
            <div className="mt-4">
              <h3 className="text-lg font-semibold">Trailer</h3>
              <YouTube videoId={trailer.key} opts={{ width: '100%', height: '300' }} />
            </div>
          )}
          {user && (
            <div className="mt-4 space-x-2">
              <button
                onClick={() => handleWatchlist('add')}
                className="p-2 bg-accent text-primary rounded hover:bg-yellow-500"
              >
                Add to Watchlist
              </button>
              <button
                onClick={() => handleWatchlist('remove')}
                className="p-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Remove from Watchlist
              </button>
              <button
                onClick={handleWatched}
                className="p-2 bg-green-500 text-white rounded hover:bg-green-600"
              >
                Mark as Watched
              </button>
            </div>
          )}
        </div>
      </div>
      {user && (
        <div className="mt-8">
          <h3 className="text-xl font-semibold mb-2">Write a Review</h3>
          <form onSubmit={handleReviewSubmit} className="space-y-4">
            <div>
              <label className="block mb-1">Rating</label>
              {editReviewId ? (
                <Rating
                  initialRating={editRating}
                  onChange={(value) => setEditRating(value)}
                  emptySymbol={<span className="text-gray-400 text-2xl">☆</span>}
                  fullSymbol={<span className="text-yellow-400 text-2xl">★</span>}
                  fractions={2}
                />
              ) : (
                <Rating
                  initialRating={rating}
                  onChange={(value) => setRating(value)}
                  emptySymbol={<span className="text-gray-400 text-2xl">☆</span>}
                  fullSymbol={<span className="text-yellow-400 text-2xl">★</span>}
                  fractions={2}
                />
              )}
            </div>
            <div>
              <label className="block mb-1">Review</label>
              {editReviewId ? (
                <Editor
                  editorState={editEditorState}
                  onEditorStateChange={setEditEditorState}
                  wrapperClassName="bg-gray-800 text-white"
                  editorClassName="bg-gray-800 text-white border border-gray-600 rounded p-2"
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
                  wrapperClassName="bg-gray-800 text-white"
                  editorClassName="bg-gray-800 text-white border border-gray-600 rounded p-2"
                  toolbar={{
                    options: ['inline', 'list', 'textAlign', 'history'],
                    inline: { options: ['bold', 'italic'] },
                    list: { options: ['unordered', 'ordered'] },
                  }}
                />
              )}
            </div>
            <button type="submit" className="p-2 bg-accent text-primary rounded hover:bg-yellow-500">
              {editReviewId ? 'Update Review' : 'Submit Review'}
            </button>
            {editReviewId && (
              <button
                onClick={() => setEditReviewId(null)}
                className="p-2 bg-gray-500 text-white rounded hover:bg-gray-600 ml-2"
              >
                Cancel
              </button>
            )}
          </form>
        </div>
      )}
      <div className="mt-8">
        <h3 className="text-xl font-semibold mb-2">Reviews</h3>
        {reviews.map(review => (
          <div key={review._id} className="p-4 bg-gray-800 rounded-lg mb-4">
            <div className="flex justify-between">
              <div>
                <p className="font-semibold">{review.user.email}</p>
                <Rating
                  initialRating={review.rating}
                  readonly
                  emptySymbol={<span className="text-gray-400 text-xl">☆</span>}
                  fullSymbol={<span className="text-yellow-400 text-xl">★</span>}
                  fractions={2}
                />
              </div>
              {user && review.user._id === user._id && (
                <div className="space-x-2">
                  <button
                    onClick={() => handleEdit(review)}
                    className="p-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(review._id)}
                    className="p-1 bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
            <div className="mt-2" dangerouslySetInnerHTML={{ __html: review.comment }} />
          </div>
        ))}
      </div>
    </div>
  );
}

export default MovieDetails;