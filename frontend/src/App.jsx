


import React from "react";
import Cursor from "./components/Cursor";  // Import the Cursor component
import StoryGenerator from "./components/StoryGenerator"; 

const App = () => {
  return (
    <div>
      <Cursor /> {/* Add the cursor effect globally */}
      <StoryGenerator />
    </div>
  );
};

export default App;

