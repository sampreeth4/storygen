"use client"

import { useState, useEffect, useRef } from "react"
import "./StoryGenerator.css"

export default function StoryGenerator() {
  const [prompt, setPrompt] = useState("")
  const [ageCategory, setAgeCategory] = useState("all")
  const [genre, setGenre] = useState("fantasy")
  const [previousGenre, setPreviousGenre] = useState("fantasy")
  const [wordLimit, setWordLimit] = useState(300)
  const [isLoading, setIsLoading] = useState(false)
  const [generatedStory, setGeneratedStory] = useState("")
  const [storyTitle, setStoryTitle] = useState("")
  const [error, setError] = useState("")
  const [showStory, setShowStory] = useState(false)
  const [isTransitioning, setIsTransitioning] = useState(false)

  const audioRef = useRef(null)

  // Handle genre change with animation and sound
  useEffect(() => {
    if (genre !== previousGenre) {
      setIsTransitioning(true)

      // Play genre-specific sound
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current.currentTime = 0
        audioRef.current.src = `/sounds/${genre}.mp3`
        audioRef.current.volume = 0.3
        audioRef.current.play().catch((e) => console.log("Audio play failed:", e))
      }

      // After transition completes
      const timer = setTimeout(() => {
        setPreviousGenre(genre)
        setIsTransitioning(false)
      }, 1000)

      return () => clearTimeout(timer)
    }
  }, [genre, previousGenre])

  // Get genre-specific class for styling
  const getGenreClass = () => {
    return `genre-${genre}`
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    setGeneratedStory("")
    setStoryTitle("")
    setShowStory(false)

    try {
      const response = await fetch("http://localhost:5000/api/generate-story", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt,
          ageCategory,
          genre,
          wordCount: getWordCountCategory(wordLimit),
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to generate story")
      }

      const data = await response.json()

      if (data.error || data.message) {
        throw new Error(data.error || data.message)
      }

      setStoryTitle(data.title || "Generated Story")
      setGeneratedStory(data.story)
      setShowStory(true)

      // Play success sound
      const successSound = new Audio("/frontend/public/sounds/horror.wav")
      successSound.volume = 0.5
      successSound.play().catch((e) => console.log("Audio play failed:", e))
    } catch (err) {
      console.error(err)
      setError("Something went wrong. Please try again.")

      // Play error sound
      const errorSound = new Audio("/frontend/public/sounds/horror.wav")
      errorSound.volume = 0.5
      errorSound.play().catch((e) => console.log("Audio play failed:", e))
    } finally {
      setIsLoading(false)
    }
  }

  // Convert word limit to category for API
  const getWordCountCategory = (limit) => {
    if (limit <= 300) return "short"
    if (limit <= 600) return "medium"
    return "long"
  }

  return (
    <div className={`story-generator-container ${getGenreClass()} ${isTransitioning ? "transitioning" : ""}`}>
      <div className="genre-background"></div>
      <div className="genre-overlay"></div>

      <audio ref={audioRef} className="genre-audio" />

      <div className="content-wrapper">
        <div className="genre-icon"></div>

        <h1 className="main-title">AI Story Generator</h1>
        <p className="subtitle">Enter a prompt, select your preferences, and let AI create a unique story for you.</p>

        {!showStory ? (
          <form onSubmit={handleSubmit} className="story-form">
            <div className="form-group">
              <label htmlFor="prompt">Story Prompt</label>
              <textarea
                id="prompt"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Enter a prompt for your story (e.g., 'A young wizard discovers a hidden door in the forest')"
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="age-category">Age Category</label>
                <select id="age-category" value={ageCategory} onChange={(e) => setAgeCategory(e.target.value)}>
                  <option value="all">All Ages</option>
                  <option value="children">Children (3-8)</option>
                  <option value="middle-grade">Middle Grade (9-12)</option>
                  <option value="young-adult">Young Adult (13-17)</option>
                  <option value="adult">Adult (18+)</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="genre">Genre</label>
                <select id="genre" value={genre} onChange={(e) => setGenre(e.target.value)} className={getGenreClass()}>
                  <option value="fantasy">Fantasy</option>
                  <option value="sci-fi">Science Fiction</option>
                  <option value="mystery">Mystery</option>
                  <option value="adventure">Adventure</option>
                  <option value="romance">Romance</option>
                  <option value="horror">Horror</option>
                  <option value="comedy">Comedy</option>
                  <option value="historical">Historical</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <div className="word-limit-header">
                <label htmlFor="word-limit">Word Limit: {wordLimit}</label>
                <span>{wordLimit} words</span>
              </div>
              <input
                type="range"
                id="word-limit"
                min="100"
                max="1000"
                step="100"
                value={wordLimit}
                onChange={(e) => setWordLimit(Number(e.target.value))}
              />
            </div>

            <button type="submit" className={`generate-button ${getGenreClass()}`} disabled={isLoading || !prompt}>
              {isLoading ? (
                <>
                  <span className="loading-spinner"></span>
                  <span>Crafting your story...</span>
                </>
              ) : (
                "Generate Story"
              )}
            </button>

            {error && <p className="error">{error}</p>}
          </form>
        ) : (
          <div className={`story-display ${getGenreClass()}`}>
            <div className="story-content animate-in">
              <h2 className="story-title">{storyTitle}</h2>

              <div className="story-prompt">
                <h3>Prompt</h3>
                <p>{prompt}</p>
              </div>

              <div className="story-text">
                {generatedStory
                  .split("\n")
                  .filter((p) => p.trim() !== "")
                  .map((paragraph, index) => (
                    <p key={index} className="story-paragraph">
                      {paragraph}
                    </p>
                  ))}
              </div>

              <div className="story-actions">
                <button
                  className="action-button"
                  onClick={() => {
                    const fullText = `${storyTitle}\n\n${generatedStory}`
                    navigator.clipboard.writeText(fullText)

                    // Play copy sound
                    const copySound = new Audio("/sounds/copy.mp3")
                    copySound.volume = 0.5
                    copySound.play().catch((e) => console.log("Audio play failed:", e))

                    // Show copy notification
                    const notification = document.createElement("div")
                    notification.className = "copy-notification"
                    notification.textContent = "Story copied to clipboard!"
                    document.body.appendChild(notification)

                    setTimeout(() => {
                      notification.classList.add("show")
                      setTimeout(() => {
                        notification.classList.remove("show")
                        setTimeout(() => {
                          document.body.removeChild(notification)
                        }, 300)
                      }, 2000)
                    }, 10)
                  }}
                >
                  Copy Story
                </button>
                <button
                  className="action-button"
                  onClick={() => {
                    // Play click sound
                    const clickSound = new Audio("/sounds/click.mp3")
                    clickSound.volume = 0.5
                    clickSound.play().catch((e) => console.log("Audio play failed:", e))

                    setShowStory(false)
                  }}
                >
                  Create Another Story
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

