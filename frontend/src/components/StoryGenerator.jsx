import { useState, useEffect } from "react";
import "./StoryGenerator.css";
import React from "react";

const genreGradients = {
  fantasy: "linear-gradient(to right, #ff9a9e, #fad0c4)", // Pink Gradient
  "sci-fi": "linear-gradient(to right, #2c3e50, #4ca1af)", // Dark Blue to Teal
  mystery: "linear-gradient(to right, #434343, #000000)", // Dark Gray to Black
  romance: "linear-gradient(to right, #ff758c, #ff7eb3)", // Soft Pink Gradient
  horror: "linear-gradient(to right, #8b0000, #000000)", // Dark Red to Black
  adventure: "linear-gradient(to right, #ffa500, #ff4500)", // Orange Gradient
};

const buttonColors = {
  fantasy: "#c0392b", // Dark Red
  "sci-fi": "#27ae60", // Green
  mystery: "#9b59b6", // Purple
  romance: "#e74c3c", // Red
  horror: "#ffcc00", // Yellow
  adventure: "#000000", // Black
};

const StoryGenerator = () => {
  const [prompt, setPrompt] = useState("");
  const [ageCategory, setAgeCategory] = useState("all");
  const [genre, setGenre] = useState("fantasy");
  const [wordLimit, setWordLimit] = useState(300);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [storyTitle, setStoryTitle] = useState("");

  useEffect(() => {
    document.body.style.background = genreGradients[genre];
    document.body.style.transition = "background 0.5s ease-in-out";
  }, [genre]);

  return (
    <div className="story-generator" style={{ background: genreGradients[genre], minHeight: "100vh", transition: "background 0.5s ease-in-out" }}>
      <h1>AI Story Generator</h1>
      <p className="subtitle">
        Enter a prompt, select your preferences, and let AI create a unique story for you.
      </p>
      <form onSubmit={(e) => e.preventDefault()}>
        <div className="form-group">
          <label htmlFor="prompt">Story Prompt</label>
          <textarea
            id="prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Enter a prompt for your story..."
            required
          ></textarea>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="age-category">Age Category</label>
            <select id="age-category" value={ageCategory} onChange={(e) => setAgeCategory(e.target.value)}>
              <option value="all">All ages</option>
              <option value="children">Children (3-8)</option>
              <option value="teen">Middle Grade (9-12)</option>
              <option value="young-adult">Young Adult (13-18)</option>
              <option value="adult">Adult (18+)</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="genre">Genre</label>
            <select id="genre" value={genre} onChange={(e) => setGenre(e.target.value)}>
              <option value="fantasy">Fantasy</option>
              <option value="sci-fi">Sci-Fi</option>
              <option value="mystery">Mystery</option>
              <option value="romance">Romance</option>
              <option value="horror">Horror</option>
              <option value="adventure">Adventure</option>
            </select>
          </div>
        </div>
        <div className="form-group">
          <div className="word-limit-header">
            <label htmlFor="word-limit">Word Limit {wordLimit}</label>
            <span>{wordLimit} words</span>
          </div>
          <input
            type="range"
            id="word-limit"
            value={wordLimit}
            min="100"
            max="1000"
            step="100"
            onChange={(e) => setWordLimit(e.target.value)}
          />
        </div>
        <button 
          type="submit" 
          className="generate-button" 
          disabled={isLoading || !prompt} 
          style={{ 
            backgroundColor: buttonColors[genre], 
            color: "white", 
            transition: "background 0.5s ease-in-out" 
          }}
        >
          {isLoading ? "Generating..." : "Generate Story"}
        </button>
      </form>
    </div>
  );
};

export default StoryGenerator;