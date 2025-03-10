import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import React from "react";
import Cursor from "./components/Cursor";  // Import the Cursor component
import StoryGenerator from "./components/StoryGenerator"; 
import StoryDisplay from "./components/StoryDisplay";
const App = () => {
  return (
    <Router>
      <div className="app">
        <Routes>
          <Route path="/" element={<StoryGenerator />} />
          <Route path="/story" element={<StoryDisplay />} />
        </Routes>
      </div>
    </Router>

    // <div>
    //   {/* <Cursor /> Add the cursor effect globally */}
    //   <StoryGenerator />
    // </div>
  );
};

export default App;

