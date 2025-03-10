import { useEffect, useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import "./StoryDisplay.css"

export default function StoryDisplay() {
  const location = useLocation()
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(true)
  const [storyData, setStoryData] = useState(null)
  const [animation, setAnimation] = useState(false)

  useEffect(() => {
    if (!location.state?.story) {
      navigate("/")
      return
    }

    setStoryData(location.state)

    // Simulate loading for a smoother transition
    const timer = setTimeout(() => {
      setIsLoading(false)
      setTimeout(() => setAnimation(true), 100)
    }, 1000)

    return () => clearTimeout(timer)
  }, [location, navigate])

  if (isLoading || !storyData) {
    return (
      <div className={`story-loading genre-${location.state?.genre || "fantasy"}`}>
        <div className="loading-animation"></div>
        <p>Preparing your story...</p>
      </div>
    )
  }

  const { story, title, genre, prompt } = storyData

  // Split story into paragraphs
  const paragraphs = story.split("\n").filter((p) => p.trim() !== "")

  return (
    <div className={`story-display genre-${genre}`}>
      <div className="story-header">
        <button className="back-button" onClick={() => navigate("/")}>
          ← Back
        </button>
        <div className="genre-badge">{genre}</div>
      </div>

      <div className={`story-content ${animation ? "animate-in" : ""}`}>
        <h1 className="story-title">{title}</h1>

        <div className="story-prompt">
          <h3>Prompt</h3>
          <p>{prompt}</p>
        </div>

        <div className="story-text">
          {paragraphs.map((paragraph, index) => (
            <p key={index} className="story-paragraph">
              {paragraph}
            </p>
          ))}
        </div>
      </div>

      <div className="story-actions">
        <button
          className="action-button"
          onClick={() => {
            const fullText = `${title}\n\n${story}`
            navigator.clipboard.writeText(fullText)
            alert("Story copied to clipboard!")
          }}
        >
          Copy Story
        </button>
        <button className="action-button" onClick={() => navigate("/")}>
          Create Another Story
        </button>
      </div>
    </div>
  )
}