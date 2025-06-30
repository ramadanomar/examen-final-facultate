import models from "../models/index.js";

const subscribe = async (req, res, next) => {
  try {
    const subscribedId = req.body.userId;
    const subscriberId = req.user.id;

    if (subscribedId === subscriberId) {
      return res
        .status(400)
        .json({ message: "You cannot subscribe to yourself" });
    }

    const userExists = await models.User.findByPk(subscribedId);
    if (!userExists) {
      return res.status(404).json({ message: "User not found" });
    }

    const existingSubscription = await models.Subscription.findOne({
      where: {
        subscriberId: subscriberId,
        subscribedId: subscribedId,
      },
    });

    if (existingSubscription) {
      return res
        .status(400)
        .json({ message: "Already subscribed to this user" });
    }

    await models.Subscription.create({
      subscriberId: subscriberId,
      subscribedId: subscribedId,
    });

    res.status(201).json({ message: "Subscription created successfully" });
  } catch (err) {
    next(err);
  }
};

const unsubscribe = async (req, res, next) => {
  try {
    const subscriptionId = req.params.subscriptionId;

    await models.Subscription.destroy({
      where: {
        id: subscriptionId,
        subscriberId: req.user.id,
      },
    });

    res.status(200).json({ message: "Unsubscribed successfully" });
  } catch (err) {
    next(err);
  }
};

const getSubscriptions = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      sortBy = "name",
      sortOrder = "ASC",
      filter = "",
      filterBy = "name",
    } = req.query;

    // Pagination
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const pageLimit = parseInt(limit);

    // Validation
    const validSortBy = ["name", "email"];
    const validSortOrder = ["ASC", "DESC"];
    const validFilterBy = ["name", "email"];

    if (!validSortBy.includes(sortBy)) {
      return res
        .status(400)
        .json({ message: "Invalid sortBy parameter. Use name or email." });
    }

    if (!validSortOrder.includes(sortOrder.toUpperCase())) {
      return res
        .status(400)
        .json({ message: "Invalid sortOrder parameter. Use ASC or DESC." });
    }

    if (!validFilterBy.includes(filterBy)) {
      return res
        .status(400)
        .json({ message: "Invalid filterBy parameter. Use name or email." });
    }

    // Build where clause for filtering
    const whereClause = {
      subscriberId: req.user.id,
    };

    // Build include with filtering
    const includeClause = {
      model: models.User,
      as: "subscribed",
      attributes: ["id", "username", "name", "email"],
      where: {},
    };

    // Add filter condition if provided
    if (filter && filter.trim() !== "") {
      includeClause.where[filterBy] = {
        [models.sequelize.Sequelize.Op.like]: `%${filter.trim()}%`,
      };
    }

    // Get total count for pagination
    const totalCount = await models.Subscription.count({
      where: whereClause,
      include: [
        {
          model: models.User,
          as: "subscribed",
          where: includeClause.where,
        },
      ],
    });

    // Get paginated results
    const subscriptions = await models.Subscription.findAll({
      where: whereClause,
      attributes: ["id"],
      include: [includeClause],
      order: [
        [
          { model: models.User, as: "subscribed" },
          sortBy,
          sortOrder.toUpperCase(),
        ],
      ],
      limit: pageLimit,
      offset: offset,
    });

    const totalPages = Math.ceil(totalCount / pageLimit);

    res.status(200).json({
      subscriptions,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalCount,
        limit: pageLimit,
        hasNext: parseInt(page) < totalPages,
        hasPrev: parseInt(page) > 1,
      },
    });
  } catch (err) {
    next(err);
  }
};

export default {
  subscribe,
  unsubscribe,
  getSubscriptions,
};
