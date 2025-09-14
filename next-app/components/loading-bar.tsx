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
    <div style={{ 
      maxWidth: '500px', 
      margin: '40px auto', 
      padding: '30px',
      background: '#f8fafc',
      borderRadius: '16px',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <h2 style={{ 
        textAlign: 'center', 
        marginBottom: '30px',
        color: '#1e293b',
        fontSize: '20px',
        fontWeight: '600'
      }}>
        {isComplete ? '✅ Search Complete!' : '🔍 Searching Products...'}
      </h2>
      
      {/* Progress Bar Container */}
      <div style={{
        width: '100%',
        height: '8px',
        backgroundColor: '#e2e8f0',
        borderRadius: '4px',
        overflow: 'hidden',
        marginBottom: '20px'
      }}>
        <div 
          style={{
            height: '100%',
            background: isComplete 
              ? 'linear-gradient(90deg, #10b981, #059669)' 
              : 'linear-gradient(90deg, #3b82f6, #1d4ed8)',
            width: `${progress}%`,
            transition: 'width 0.1s ease-out',
            borderRadius: '4px'
          }}
        />
      </div>

      {/* Progress Percentage */}
      <div style={{
        textAlign: 'center',
        fontSize: '24px',
        fontWeight: 'bold',
        color: isComplete ? '#059669' : '#1d4ed8',
        marginBottom: '15px'
      }}>
        {Math.round(progress)}%
      </div>

      {/* Current Stage */}
      <div style={{
        textAlign: 'center',
        fontSize: '16px',
        color: '#64748b',
        minHeight: '24px',
        marginBottom: '20px'
      }}>
        {isComplete ? 'Ready to show results!' : stages[currentStage]?.label}
      </div>

      {/* Stage Indicators */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '25px'
      }}>
        {stages.map((_, index) => (
          <div key={index} style={{
            width: '12px',
            height: '12px',
            borderRadius: '50%',
            backgroundColor: index <= currentStage 
              ? (isComplete ? '#10b981' : '#3b82f6')
              : '#cbd5e1',
            transition: 'background-color 0.3s ease',
            position: 'relative'
          }}>
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
      <div style={{ marginBottom: '20px' }}>
        {stages.map((stage, index) => (
          <div key={index} style={{
            display: 'flex',
            alignItems: 'center',
            padding: '8px 0',
            fontSize: '14px',
            color: index <= currentStage 
              ? (index === currentStage && !isComplete ? '#1d4ed8' : '#059669')
              : '#94a3b8'
          }}>
            <span style={{ 
              marginRight: '10px',
              width: '16px',
              textAlign: 'center'
            }}>
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
        <button
          onClick={restart}
          style={{
            width: '100%',
            padding: '12px 24px',
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: '500',
            cursor: 'pointer',
            transition: 'background-color 0.2s ease'
          }}
        //   onMouseEnter={(e) => e.target.style.backgroundColor = '#1d4ed8'}
        //   onMouseLeave={(e) => e.target.style.backgroundColor = '#3b82f6'}
        >
          Search Again
        </button>
      )}

      {/* Fun Loading Animation */}
      {!isComplete && (
        <div style={{
          textAlign: 'center',
          fontSize: '12px',
          color: '#94a3b8',
          marginTop: '10px'
        }}>
          <div style={{
            display: 'inline-block',
            animation: 'pulse 1.5s ease-in-out infinite'
          }}>
            Working hard to find the best deals... 🛍️
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
};

export default LoadingBar;