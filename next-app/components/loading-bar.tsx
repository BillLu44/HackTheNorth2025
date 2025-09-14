import { useState, useEffect } from 'react';

const LoadingBar = () => {
  const [currentStage, setCurrentStage] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  const stages = [
    { label: "Initializing search...", duration: 1200 },
    { label: "Analyzing your preferences...", duration: 1500 },
    { label: "Scanning product database...", duration: 2000 },
    { label: "Comparing prices...", duration: 1000 },
    { label: "Finding best matches...", duration: 1300 },
    { label: "Finalizing results...", duration: 800 }
  ];

  useEffect(() => {
    const totalDuration = stages.reduce((acc, stage) => acc + stage.duration, 0);
    let elapsed = 0;
    
    const interval = setInterval(() => {
      elapsed += 50;
      const newProgress = Math.min((elapsed / totalDuration) * 100, 100);
      setProgress(newProgress);
      
      // Calculate which stage we're in
      let cumulativeDuration = 0;
      let stageIndex = 0;
      for (let i = 0; i < stages.length; i++) {
        cumulativeDuration += stages[i].duration;
        if (elapsed <= cumulativeDuration) {
          stageIndex = i;
          break;
        }
      }
      setCurrentStage(stageIndex);
      
      if (elapsed >= totalDuration) {
        setIsComplete(true);
        clearInterval(interval);
      }
    }, 50);

    return () => clearInterval(interval);
  }, []);

  const restart = () => {
    setCurrentStage(0);
    setProgress(0);
    setIsComplete(false);
  };

  return (
    <>
      <style jsx>{`
        :root {
          --c-bg: #ffffff;
          --c-surface: #f2f4f7;
          --c-panel: #f2f4f7;
          --c-text: #0b0f14;
          --c-text-secondary: #3b4453;
          --c-border: #ffffff;
          --c-btn-border: #cacbcc;
          --c-shadow: rgba(22, 28, 40, 0.06);
          --bubble-user-bg: #ffffff;
          --bubble-user-border: #ffffff;
          --bubble-shadow: 0 8px 20px rgba(22, 28, 40, 0.06);
        }

        @media (prefers-color-scheme: dark) {
          :root {
            --c-bg: #0b0f14;
            --c-surface: #0e1623;
            --c-panel: #0b111a;
            --c-text: #e5e7eb;
            --c-text-secondary: #a3b0c2;
            --c-border: #1f2937;
            --c-btn-border: #cacbcc;
            --c-shadow: rgba(0, 0, 0, 0.45);
            --bubble-user-bg: #eef2f6;
            --bubble-user-border: #263241;
            --bubble-shadow: 0 10px 26px rgba(0, 0, 0, 0.45);
          }
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        .loading-container {
          max-width: 500px;
          margin: 40px auto;
          padding: 30px;
          background: var(--c-surface);
          border-radius: 16px;
          box-shadow: var(--bubble-shadow);
          font-family: system-ui, -apple-system, sans-serif;
        }

        .loading-title {
          text-align: center;
          margin-bottom: 30px;
          color: var(--c-text);
          font-size: 20px;
          font-weight: 600;
        }

        .progress-container {
          width: 100%;
          height: 8px;
          background-color: var(--c-border);
          border-radius: 4px;
          overflow: hidden;
          margin-bottom: 20px;
        }

        .progress-bar {
          height: 100%;
          background: ${isComplete 
            ? 'linear-gradient(90deg, #10b981, #059669)' 
            : 'linear-gradient(90deg, #3b82f6, #1d4ed8)'};
          width: ${progress}%;
          transition: width 0.1s ease-out;
          border-radius: 4px;
        }

        .progress-percentage {
          text-align: center;
          font-size: 24px;
          font-weight: bold;
          color: ${isComplete ? '#059669' : '#1d4ed8'};
          margin-bottom: 15px;
        }

        .current-stage {
          text-align: center;
          font-size: 16px;
          color: var(--c-text-secondary);
          min-height: 24px;
          margin-bottom: 20px;
        }

        .stage-indicators {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 25px;
        }

        .stage-dot {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          transition: background-color 0.3s ease;
          position: relative;
        }

        .stage-list {
          margin-bottom: 20px;
        }

        .stage-item {
          display: flex;
          align-items: center;
          padding: 8px 0;
          font-size: 14px;
        }

        .stage-icon {
          margin-right: 10px;
          width: 16px;
          text-align: center;
        }

        .restart-button {
          width: 100%;
          padding: 12px 24px;
          background-color: #3b82f6;
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 500;
          cursor: pointer;
          transition: background-color 0.2s ease;
        }

        .restart-button:hover {
          background-color: #1d4ed8;
        }

        .loading-message {
          text-align: center;
          font-size: 12px;
          color: var(--c-text-secondary);
          margin-top: 10px;
        }

        .pulse-text {
          display: inline-block;
          animation: pulse 1.5s ease-in-out infinite;
        }
      `}</style>

      <div className="loading-container">
        <h2 className="loading-title">
          {isComplete ? '✅ Search Complete!' : '🔍 Searching Products...'}
        </h2>
        
        {/* Progress Bar Container */}
        <div className="progress-container">
          <div className="progress-bar" />
        </div>

        {/* Progress Percentage */}
        <div className="progress-percentage">
          {Math.round(progress)}%
        </div>

        {/* Current Stage */}
        <div className="current-stage">
          {isComplete ? 'Ready to show results!' : stages[currentStage]?.label}
        </div>

        {/* Stage Indicators */}
        <div className="stage-indicators">
          {stages.map((_, index) => (
            <div 
              key={index} 
              className="stage-dot"
              style={{
                backgroundColor: index <= currentStage 
                  ? (isComplete ? '#10b981' : '#3b82f6')
                  : 'var(--c-border)'
              }}
            >
              {index < currentStage && (
                <div style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  color: 'white',
                  fontSize: '8px',
                  fontWeight: 'bold'
                }}>
                  ✓
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Stage List */}
        <div className="stage-list">
          {stages.map((stage, index) => (
            <div 
              key={index} 
              className="stage-item"
              style={{
                color: index <= currentStage 
                  ? (index === currentStage && !isComplete ? '#1d4ed8' : '#059669')
                  : 'var(--c-text-secondary)'
              }}
            >
              <span className="stage-icon">
                {index < currentStage || isComplete 
                  ? '✅' 
                  : index === currentStage 
                    ? '⏳' 
                    : '⭕'}
              </span>
              <span style={{
                fontWeight: index === currentStage && !isComplete ? '500' : 'normal'
              }}>
                {stage.label}
              </span>
            </div>
          ))}
        </div>

        {/* Restart Button */}
        {isComplete && (
          <button onClick={restart} className="restart-button">
            Search Again
          </button>
        )}

        {/* Fun Loading Animation */}
        {!isComplete && (
          <div className="loading-message">
            <div className="pulse-text">
              Working hard to find the best deals... 🛍️
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default LoadingBar;