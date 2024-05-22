import React, { useEffect, useState, useCallback } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowRightLong,
  faArrowLeftLong,
  faNewspaper,
} from "@fortawesome/free-solid-svg-icons";
import { faRedditAlien } from "@fortawesome/free-brands-svg-icons";
import axios from "axios";
import { useSwipeable } from "react-swipeable";

const SwipeableCards = () => {
  const [stories, setStories] = useState([]);
  const [redditPosts, setRedditPosts] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [activeTab, setActiveTab] = useState("news");

  useEffect(() => {
    const fetchStories = async () => {
      try {
        const response = await axios.get("http://localhost:3001/api/nyt");
        setStories(response.data.results);
      } catch (err) {
        console.error("Error fetching NYTimes stories:", err);
      }
    };

    fetchStories();
  }, []);

  useEffect(() => {
    const fetchRedditPosts = async () => {
      try {
        const response = await axios.get("http://localhost:3001/api/popular");
        setRedditPosts(response.data.data.children.slice(0, 15));
      } catch (error) {
        console.error("Error fetching Reddit posts:", error);
      }
    };

    fetchRedditPosts();
  }, []);

  const handleNext = useCallback(() => {
    if (activeTab === "news") {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % stories.length);
    } else {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % redditPosts.length);
    }
  }, [activeTab, stories.length, redditPosts.length]);

  const handlePrev = useCallback(() => {
    if (activeTab === "news") {
      setCurrentIndex(
        (prevIndex) => (prevIndex - 1 + stories.length) % stories.length
      );
    } else {
      setCurrentIndex(
        (prevIndex) => (prevIndex - 1 + redditPosts.length) % redditPosts.length
      );
    }
  }, [activeTab, stories.length, redditPosts.length]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "ArrowRight") {
        handleNext();
      } else if (event.key === "ArrowLeft") {
        handlePrev();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleNext, handlePrev]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handlers = useSwipeable({
    onSwipedLeft: handleNext,
    onSwipedRight: handlePrev,
  });

  if (activeTab === "news" && stories.length === 0) {
    return <div>Loading...</div>;
  }

  if (activeTab === "reddit" && redditPosts.length === 0) {
    return <div>Loading...</div>;
  }

  const currentStory =
    activeTab === "news"
      ? stories[currentIndex]
      : redditPosts[currentIndex].data;

  // Log the image URL to ensure it is correct
  const imageUrl = currentStory.preview?.images?.[0]?.source?.url.replaceAll(
    "&amp;",
    "&"
  );
  console.log("Image URL:", imageUrl);

  return (
    <div className="card" {...handlers}>
      <div className="icon-tabs">
        <div
          className={`icon-tab ${activeTab === "news" ? "active" : ""}`}
          onClick={() => setActiveTab("news")}
        >
          <FontAwesomeIcon icon={faNewspaper} size="2x" />
        </div>
        <div
          className={`icon-tab ${activeTab === "reddit" ? "active" : ""}`}
          onClick={() => setActiveTab("reddit")}
        >
          <FontAwesomeIcon icon={faRedditAlien} size="2x" />
        </div>
      </div>
      {activeTab === "news" ? (
        <>
          <img
            src={currentStory.multimedia ? currentStory.multimedia[0].url : ""}
            alt={currentStory.title}
          />
          <h2>{currentStory.title}</h2>
          <p className="date-posted">
            {formatDate(currentStory.published_date)}
          </p>
          <p className="story-description">{currentStory.abstract}</p>
          <a href={currentStory.url} target="_blank" rel="noopener noreferrer">
            <p className="link-url">Read Full Story</p>
          </a>
        </>
      ) : (
        <>
          <h2>{currentStory.title}</h2>
          <div className="reddit-top-details">
            <p className="author">Posted by {currentStory.author}</p>
            <p className="subreddit">Subreddit: {currentStory.subreddit}</p>
          </div>
          {imageUrl ? (
            <img
              className="reddit-image"
              src={imageUrl}
              alt={currentStory.title}
            />
          ) : (
            <p>No image available</p>
          )}
          <div className="reddit-bottom-details">
            <p className="score">Score: {currentStory.score}</p>
            <p className="comments">Comments: {currentStory.num_comments}</p>
          </div>
          {currentStory.selftext && (
            <p className="story-description">{currentStory.selftext}</p>
          )}
          <a
            href={`https://www.reddit.com${currentStory.permalink}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <p className="link-url">Read Full Post</p>
          </a>
        </>
      )}
      <div className="navigation-buttons">
        <FontAwesomeIcon
          icon={faArrowLeftLong}
          onClick={handlePrev}
          className="icon-button"
          size="2x"
        />
        <FontAwesomeIcon
          icon={faArrowRightLong}
          onClick={handleNext}
          className="icon-button"
          size="2x"
        />
      </div>
      <div className="slide-indicators">
        {(activeTab === "news" ? stories : redditPosts).map((_, index) => (
          <span
            key={index}
            className={`dot ${index === currentIndex ? "active" : ""}`}
          ></span>
        ))}
      </div>
    </div>
  );
};

export default SwipeableCards;
