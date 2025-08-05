import React, { useState } from 'react';
import Loading from './components/Loading/Loading';
import PageController from './components/PageController/PageController';
import './App.css';

function App() {
  const [isLoading, setIsLoading] = useState(true);

  const handleLoadComplete = () => {
    setIsLoading(false);
  };

  return (
    <div className="App">
      {isLoading ? (
        <Loading onLoadComplete={handleLoadComplete} />
      ) : (
        <PageController />
      )}
    </div>
  );
}

export default App;
