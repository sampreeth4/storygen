import { useState } from "react";
import "./StoryGenerator.css";
import React from 'react'

const StoryGenerator = () => {
    const [prompt, setPrompt] = useState("");
    const [ageCategory, setAgeCategory] = useState("all");
    const [genre, setGenre] = useState("fantasy");
    const [wordLimit, setWordLimit] = useState(300);
    const [generatedStory, setGeneratedStory] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [storyTitle, setStoryTitle] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try{
            const response = await fetch("http://localhost:5000/api/generate-story", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    prompt,
                    ageCategory,
                    genre,
                    wordLimit,
                }),
            })
            if(!response.ok){
                throw new Error("Failed to generate story");
            }
            const data = await response.json();
            console.log(data);
        }catch(err){
            console.error(err);
        }finally{
            setIsLoading(false);
        }
    }
  return (
    <div className="story-generator">
        <h1>AI story Generator</h1>
        <p className="subtitle">Enter a prompt, select your preferences, and let AI create a unique story for you.</p>
        <form onSubmit={handleSubmit}>
            <div className="form-group">
                <label htmlFor="prompt">Story Prompt</label>
                <textarea
                    id="prompt"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Enter a prompt for your story (e.g., 'A young wizard discovers a hidden door in the forest')"
                    required
                ></textarea>
            </div>
            <div className="form-row">
                <div className="for-group">
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
            <button type="submit" className="generate-button" disabled={isLoading || !prompt}> {isLoading? "Generating..." : "Generate Story"} </button>
        </form>
      
    </div>
  )
}

export default StoryGenerator
