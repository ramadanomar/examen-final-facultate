import React, { useState, useContext, useEffect } from "react";
import "./Subscriptions.css";
import UserCardList from "../UserCardList";
import Paginator from "../Paginator";
import AppContext from "../../state/AppContext";

const Subscriptions = () => {
  const globalState = useContext(AppContext);

  const [subscriptionData, setSubscriptionData] = useState([]);
  const [pagination, setPagination] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState("ASC");
  const [filter, setFilter] = useState("");
  const [filterBy, setFilterBy] = useState("name");
  const [isLoading, setIsLoading] = useState(false);

  const loadSubscriptions = () => {
    setIsLoading(true);
    globalState.subscriptions.getSubscriptions(globalState, {
      page: currentPage,
      limit: itemsPerPage,
      sortBy,
      sortOrder,
      filter,
      filterBy,
    });
  };

  useEffect(() => {
    const searchSuccessListener = globalState.subscriptions.emitter.addListener(
      "SUBSCRIPTION_SEARCH_SUCCESS",
      (data) => {
        setSubscriptionData(globalState.subscriptions.subscriptions);
        setPagination(globalState.subscriptions.pagination || {});
        setIsLoading(false);
      }
    );

    const searchErrorListener = globalState.subscriptions.emitter.addListener(
      "SUBSCRIPTION_SEARCH_ERROR",
      () => {
        setIsLoading(false);
      }
    );

    return () => {
      searchSuccessListener.remove();
      searchErrorListener.remove();
      globalState.subscriptions.clearSubscriptions();
    };
  }, []);

  useEffect(() => {
    loadSubscriptions();
  }, [currentPage, itemsPerPage, sortBy, sortOrder, filter, filterBy]);

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const handleItemsPerPageChange = (newLimit) => {
    setItemsPerPage(newLimit);
    setCurrentPage(1); // Reset to first page when changing items per page
  };

  const handleSortChange = (field) => {
    if (field === sortBy) {
      setSortOrder(sortOrder === "ASC" ? "DESC" : "ASC");
    } else {
      setSortBy(field);
      setSortOrder("ASC");
    }
  };

  const handleFilterChange = (e) => {
    setFilter(e.target.value);
    setCurrentPage(1); // Reset to first page when filtering
  };

  const handleFilterByChange = (e) => {
    setFilterBy(e.target.value);
    setCurrentPage(1); // Reset to first page when changing filter field
  };

  return (
    <div className="subscriptions-container">
      <div className="page-title">
        <h2>Subscriptions</h2>
        <p>who are you listening to?</p>
      </div>

      {/* Controls */}
      <div className="subscriptions-controls">
        {/* Filters */}
        <div className="filter-section">
          <div className="filter-group">
            <label htmlFor="filter">Filter by:</label>
            <select
              id="filterBy"
              value={filterBy}
              onChange={handleFilterByChange}
              className="filter-select"
            >
              <option value="name">Name</option>
              <option value="email">Email</option>
            </select>
            <input
              type="text"
              id="filter"
              placeholder={`Search by ${filterBy}...`}
              value={filter}
              onChange={handleFilterChange}
              className="filter-input"
            />
          </div>
        </div>

        {/* Sort and Items per page */}
        <div className="controls-row">
          <div className="sort-section">
            <label>Sort by:</label>
            <button
              className={`sort-btn ${sortBy === "name" ? "active" : ""}`}
              onClick={() => handleSortChange("name")}
            >
              Name {sortBy === "name" && (sortOrder === "ASC" ? "↑" : "↓")}
            </button>
            <button
              className={`sort-btn ${sortBy === "email" ? "active" : ""}`}
              onClick={() => handleSortChange("email")}
            >
              Email {sortBy === "email" && (sortOrder === "ASC" ? "↑" : "↓")}
            </button>
          </div>

          <div className="items-per-page">
            <label htmlFor="itemsPerPage">Items per page:</label>
            <select
              id="itemsPerPage"
              value={itemsPerPage}
              onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>
      </div>

      {/* Loading indicator */}
      {isLoading && <div className="loading">Loading...</div>}

      {/* Subscription list */}
      {!isLoading && (
        <>
          <UserCardList
            data={subscriptionData.map((subscription, index) => ({
              ...subscription.subscribed,
            }))}
          />

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <Paginator
              currentPage={pagination.currentPage}
              totalPages={pagination.totalPages}
              onPageChange={handlePageChange}
              hasNext={pagination.hasNext}
              hasPrev={pagination.hasPrev}
            />
          )}

          {/* Results info */}
          <div className="results-info">
            {pagination.totalCount > 0 ? (
              <p>
                Showing {(pagination.currentPage - 1) * pagination.limit + 1} to{" "}
                {Math.min(
                  pagination.currentPage * pagination.limit,
                  pagination.totalCount
                )}{" "}
                of {pagination.totalCount} subscriptions
              </p>
            ) : (
              <p>No subscriptions found</p>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Subscriptions;
