import EventEmitter from "../../utils/EventEmitter";
import { SERVER } from "../../config/global";

class PostStore {
  constructor() {
    this.emitter = new EventEmitter();
    this.posts = [];
  }

  async createPost(state, content) {
    try {
      const response = await fetch(`${SERVER}/api/posts`, {
        method: "POST",
        body: JSON.stringify({ content }),
        headers: {
          Authorization: `Bearer ${state.currentUser.data.token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create post");
      }

      const data = await response.json();
      this.posts.unshift(data.post); // Add to beginning of array
      this.emitter.emit("POST_CREATE_SUCCESS", data.post);
    } catch (err) {
      console.warn("Error creating post:", err);
      this.emitter.emit("POST_CREATE_ERROR", err);
    }
  }

  async getUserPosts(state) {
    try {
      const response = await fetch(`${SERVER}/api/posts`, {
        headers: {
          Authorization: `Bearer ${state.currentUser.data.token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch posts");
      }

      const data = await response.json();
      this.posts = data.posts;
      this.emitter.emit("POSTS_FETCH_SUCCESS");
    } catch (err) {
      console.warn("Error fetching posts:", err);
      this.emitter.emit("POSTS_FETCH_ERROR", err);
    }
  }

  async deletePost(state, postId) {
    try {
      const response = await fetch(`${SERVER}/api/posts/${postId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${state.currentUser.data.token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete post");
      }

      // Remove post from local state
      this.posts = this.posts.filter((post) => post.id !== postId);
      this.emitter.emit("POST_DELETE_SUCCESS", postId);
    } catch (err) {
      console.warn("Error deleting post:", err);
      this.emitter.emit("POST_DELETE_ERROR", err);
    }
  }

  clearPosts() {
    this.posts = [];
    this.emitter.emit("POSTS_CLEARED");
  }
}

export default PostStore;
