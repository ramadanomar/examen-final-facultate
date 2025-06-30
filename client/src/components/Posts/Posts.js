import React, { useState, useContext, useEffect } from "react";
import "./Posts.css";
import AppContext from "../../state/AppContext";

const Posts = () => {
  const globalState = useContext(AppContext);
  const [posts, setPosts] = useState([]);
  const [feedPosts, setFeedPosts] = useState([]);
  const [newPostContent, setNewPostContent] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const postsFetchSuccessListener = globalState.posts.emitter.addListener(
      "POSTS_FETCH_SUCCESS",
      () => {
        setPosts(globalState.posts.posts);
      }
    );

    const feedFetchSuccessListener = globalState.posts.emitter.addListener(
      "FEED_FETCH_SUCCESS",
      () => {
        setFeedPosts(globalState.posts.feedPosts);
      }
    );

    const postCreateSuccessListener = globalState.posts.emitter.addListener(
      "POST_CREATE_SUCCESS",
      () => {
        setPosts([...globalState.posts.posts]);
        setNewPostContent("");
        setIsCreating(false);
        setError("");
      }
    );

    const postCreateErrorListener = globalState.posts.emitter.addListener(
      "POST_CREATE_ERROR",
      (err) => {
        setError(err.message || "Failed to create post");
        setIsCreating(false);
      }
    );

    const postDeleteSuccessListener = globalState.posts.emitter.addListener(
      "POST_DELETE_SUCCESS",
      () => {
        setPosts([...globalState.posts.posts]);
      }
    );

    const postDeleteErrorListener = globalState.posts.emitter.addListener(
      "POST_DELETE_ERROR",
      (err) => {
        setError(err.message || "Failed to delete post");
      }
    );

    return () => {
      postsFetchSuccessListener.remove();
      feedFetchSuccessListener.remove();
      postCreateSuccessListener.remove();
      postCreateErrorListener.remove();
      postDeleteSuccessListener.remove();
      postDeleteErrorListener.remove();
      globalState.posts.clearPosts();
    };
  }, []);

  useEffect(() => {
    globalState.posts.getUserPosts(globalState);
    globalState.posts.getSubscriptionFeed(globalState);
  }, []);

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!newPostContent.trim()) {
      setError("Post content cannot be empty");
      return;
    }
    if (newPostContent.length > 500) {
      setError("Post content must be 500 characters or less");
      return;
    }

    setIsCreating(true);
    setError("");
    await globalState.posts.createPost(globalState, newPostContent);
  };

  const handleDeletePost = async (postId) => {
    if (window.confirm("Are you sure you want to delete this post?")) {
      await globalState.posts.deletePost(globalState, postId);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString();
  };

  return (
    <div className="posts-container">
      <div className="page-title">
        <h2>Posts</h2>
        <p>Share your thoughts and see what others are posting</p>
      </div>

      <div className="create-post-form">
        <h3>Create New Post</h3>
        <form onSubmit={handleCreatePost}>
          <textarea
            value={newPostContent}
            onChange={(e) => setNewPostContent(e.target.value)}
            placeholder="What's on your mind? (Max 500 characters)"
            maxLength={500}
            rows={4}
            disabled={isCreating}
          />
          <div className="form-footer">
            <span className="character-count">{newPostContent.length}/500</span>
            <button
              type="submit"
              disabled={isCreating || !newPostContent.trim()}
            >
              {isCreating ? "Creating..." : "Create Post"}
            </button>
          </div>
        </form>
        {error && <div className="error-message">{error}</div>}
      </div>

      {/* My Posts Section */}
      <div className="posts-section">
        <h3 className="section-title">My Posts</h3>
        <div className="posts-list">
          {posts.length === 0 ? (
            <div className="no-posts">
              <p>No posts yet. Create your first post above!</p>
            </div>
          ) : (
            posts.map((post) => (
              <div key={`my-${post.id}`} className="post-item">
                <div className="post-content">
                  <p>{post.content}</p>
                </div>
                <div className="post-footer">
                  <span className="post-date">
                    {formatDate(post.createdAt)}
                  </span>
                  <button
                    className="delete-button"
                    onClick={() => handleDeletePost(post.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Subscription Feed Section */}
      <div className="posts-section">
        <h3 className="section-title">Posts from People You Follow</h3>
        <div className="posts-list">
          {feedPosts.length === 0 ? (
            <div className="no-posts">
              <p>
                No posts from your subscriptions yet. Follow some users to see
                their posts!
              </p>
            </div>
          ) : (
            feedPosts.map((post) => (
              <div
                key={`feed-${post.id}`}
                className="post-item subscription-post"
              >
                <div className="post-header">
                  <span className="post-author">@{post.author.username}</span>
                  <span className="post-author-name">({post.author.name})</span>
                </div>
                <div className="post-content">
                  <p>{post.content}</p>
                </div>
                <div className="post-footer">
                  <span className="post-date">
                    {formatDate(post.createdAt)}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Posts;
