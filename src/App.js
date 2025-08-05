import React, { useState } from 'react';
import Loading from './components/Loading/Loading';
import PageController from './components/PageController/PageController';
import FireflyCursor from './components/FireflyCursor/FireflyCursor';
import './App.css';

function App() {
  const [isLoading, setIsLoading] = useState(true);

  const handleLoadComplete = () => {
    setIsLoading(false);
  };

  return (
    <div className="App">
      <FireflyCursor />
      {isLoading ? (
        <Loading onLoadComplete={handleLoadComplete} />
      ) : (
        <PageController />
      )}
    </div>
  );
}

export default App;
