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
      () => {
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
    setCurrentPage(1);
  };

  const handleSortByChange = (e) => {
    setSortBy(e.target.value);
    setCurrentPage(1);
  };

  const handleSortOrderChange = (e) => {
    setSortOrder(e.target.value);
    setCurrentPage(1);
  };

  const handleFilterChange = (e) => {
    setFilter(e.target.value);
    setCurrentPage(1);
  };

  const handleFilterByChange = (e) => {
    setFilterBy(e.target.value);
    setCurrentPage(1);
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

        <div className="controls-row">
          <div className="sort-section">
            <div className="sort-group">
              <label htmlFor="sortBy">Sort by:</label>
              <select
                id="sortBy"
                value={sortBy}
                onChange={handleSortByChange}
                className="sort-select"
              >
                <option value="name">Name</option>
                <option value="email">Email</option>
              </select>
            </div>
            <div className="sort-group">
              <label htmlFor="sortOrder">Order:</label>
              <select
                id="sortOrder"
                value={sortOrder}
                onChange={handleSortOrderChange}
                className="sort-select"
              >
                <option value="ASC">Ascending</option>
                <option value="DESC">Descending</option>
              </select>
            </div>
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

      {isLoading && <div className="loading">Loading...</div>}

      {!isLoading && (
        <>
          <UserCardList
            data={subscriptionData.map((subscription, index) => ({
              ...subscription.subscribed,
            }))}
          />

          {pagination.totalPages > 1 && (
            <Paginator
              currentPage={pagination.currentPage}
              totalPages={pagination.totalPages}
              onPageChange={handlePageChange}
              hasNext={pagination.hasNext}
              hasPrev={pagination.hasPrev}
            />
          )}

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
