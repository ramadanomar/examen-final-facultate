import models from "../models/index.js";

const createPost = async (req, res, next) => {
  try {
    const { content } = req.body;
    const userId = req.user.id;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({ message: "Content is required" });
    }

    if (content.length > 500) {
      return res
        .status(400)
        .json({ message: "Content must be 500 characters or less" });
    }

    const post = await models.Post.create({
      content: content.trim(),
      userId: userId,
    });

    const postWithAuthor = await models.Post.findByPk(post.id, {
      include: [
        {
          model: models.User,
          as: "author",
          attributes: ["id", "username", "name", "email"],
        },
      ],
    });

    res.status(201).json({ post: postWithAuthor });
  } catch (err) {
    next(err);
  }
};

const getUserPosts = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const posts = await models.Post.findAll({
      where: {
        userId: userId,
      },
      include: [
        {
          model: models.User,
          as: "author",
          attributes: ["id", "username", "name", "email"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json({ posts });
  } catch (err) {
    next(err);
  }
};

const deletePost = async (req, res, next) => {
  try {
    const postId = req.params.postId;
    const userId = req.user.id;

    const post = await models.Post.findByPk(postId);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (post.userId !== userId) {
      return res
        .status(403)
        .json({ message: "You can only delete your own posts" });
    }

    await models.Post.destroy({
      where: {
        id: postId,
        userId: userId,
      },
    });

    res.status(200).json({ message: "Post deleted successfully" });
  } catch (err) {
    next(err);
  }
};

const getSubscriptionFeed = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const subscriptions = await models.Subscription.findAll({
      where: {
        subscriberId: userId,
      },
      attributes: ["subscribedId"],
    });

    const subscribedUserIds = subscriptions.map((sub) => sub.subscribedId);

    if (subscribedUserIds.length === 0) {
      return res.status(200).json({ posts: [] });
    }

    const posts = await models.Post.findAll({
      where: {
        userId: {
          [models.sequelize.Sequelize.Op.in]: subscribedUserIds,
        },
      },
      include: [
        {
          model: models.User,
          as: "author",
          attributes: ["id", "username", "name", "email"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json({ posts });
  } catch (err) {
    next(err);
  }
};

export default {
  createPost,
  getUserPosts,
  deletePost,
  getSubscriptionFeed,
};
