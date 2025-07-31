import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { useAuth } from '../context/AuthContext';

const AiInsights = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedWorkout, setSelectedWorkout] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [goal, setGoal] = useState('STRENGTH'); // STRENGTH, MUSCLE_GROWTH, BOTH
  const [periodDays, setPeriodDays] = useState(30); // Days to analyze

  useEffect(() => {
    const fetchWorkouts = async () => {
      try {
        const from = new Date();
        from.setDate(from.getDate() - 30); // Last 30 days
        const to = new Date();
    
        const response = await fetch(
          `http://localhost:8080/api/workout?from=${from.toISOString().split('T')[0]}&to=${to.toISOString().split('T')[0]}`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
          }
        );
    
        if (!response.ok) {
          const errorText = await response.text();
          console.error('Response error:', errorText);
          
          if (response.status === 401 || (response.status === 500 && errorText.includes('JWT expired'))) {
            console.log('Token expired or invalid, redirecting to login');
            logout();
            navigate('/login');
            return;
          }
          
          throw new Error(`HTTP error! status: ${response.status}`);
        }
    
        const data = await response.json();
        setWorkouts(data);
      } catch (error) {
        console.error('Error fetching workouts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchWorkouts();
  }, [logout, navigate]);

  const analyzeWorkout = async (workoutId) => {
    setAnalyzing(true);
    try {
      const response = await fetch(
        `http://localhost:8080/api/gemini/workout/${workoutId}?goal=${goal}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to analyze workout');
      }

      const data = await response.json();
      setAnalysis(data.analysis);
    } catch (error) {
      console.error('Error analyzing workout:', error);
      alert('Failed to analyze workout. Please try again.');
    } finally {
      setAnalyzing(false);
    }
  };

  const analyzePeriod = async () => {
    setAnalyzing(true);
    try {
      const from = new Date();
      from.setDate(from.getDate() - periodDays);
      const to = new Date();

      const response = await fetch(
        `http://localhost:8080/api/gemini/period?goal=${goal}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
          body: JSON.stringify({
            from: from.toISOString().split('T')[0],
            to: to.toISOString().split('T')[0]
          })
        }
      );

      if (!response.ok) {
        throw new Error('Failed to analyze period');
      }

      const data = await response.json();
      setAnalysis(data.analysis);
    } catch (error) {
      console.error('Error analyzing period:', error);
      alert('Failed to analyze period. Please try again.');
    } finally {
      setAnalyzing(false);
    }
  };

  // Function to parse markdown bold text
  const parseMarkdown = (text) => {
    if (!text) return '';
    return text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-base-100">
        <Header />
        <div className="container mx-auto p-4">
          <div className="flex justify-center items-center h-64">
            <span className="loading loading-spinner loading-lg"></span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-100">
      <Header />
      
      <div className="container mx-auto p-4 max-w-6xl">
        <div className="mb-4">
          <h1 className="text-2xl font-bold mb-2">AI Insights</h1>
          <p className="text-sm text-gray-600 mb-4">Get personalized workout analysis and recommendations powered by AI</p>
        </div>

        {workouts.length === 0 ? (
          <div className="text-center py-8">
            <h2 className="text-xl font-semibold mb-2">No Workouts Available</h2>
            <p className="text-gray-600 mb-4">Create some workouts to get AI-powered insights!</p>
            <button
              onClick={() => navigate('/create-workout')}
              className="btn btn-primary btn-sm"
            >
              Create Your First Workout
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column - Controls */}
            <div className="space-y-4">
              {/* Goal Selection */}
              <div className="card bg-base-200 p-4">
                <h3 className="text-lg font-semibold mb-3">Training Goal</h3>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setGoal('STRENGTH')}
                    className={`btn btn-sm ${goal === 'STRENGTH' ? 'btn-primary' : 'btn-outline'}`}
                  >
                    💪 Strength
                  </button>
                  <button
                    onClick={() => setGoal('MUSCLE_GROWTH')}
                    className={`btn btn-sm ${goal === 'MUSCLE_GROWTH' ? 'btn-primary' : 'btn-outline'}`}
                  >
                    🏋️ Muscle Growth
                  </button>
                  <button
                    onClick={() => setGoal('BOTH')}
                    className={`btn btn-sm col-span-2 ${goal === 'BOTH' ? 'btn-primary' : 'btn-outline'}`}
                  >
                    🎯 Both
                  </button>
                </div>
              </div>

              {/* Workout Selection */}
              <div className="card bg-base-200 p-4">
                <h3 className="text-lg font-semibold mb-3">Analyze Specific Workout</h3>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {workouts.map((workout) => (
                    <div
                      key={workout.id}
                      className={`p-3 rounded cursor-pointer transition-colors ${
                        selectedWorkout?.id === workout.id
                          ? 'bg-primary text-primary-content'
                          : 'bg-base-100 hover:bg-base-300'
                      }`}
                      onClick={() => setSelectedWorkout(workout)}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-medium text-sm">{workout.name}</div>
                          <div className="text-xs opacity-70">
                            {new Date(workout.date).toLocaleDateString()} • {workout.exercises.length} exercises
                          </div>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            analyzeWorkout(workout.id);
                          }}
                          className="btn btn-xs btn-primary"
                          disabled={analyzing}
                        >
                          {analyzing ? 'Analyzing...' : 'Analyze'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Period Analysis */}
              <div className="card bg-base-200 p-4">
                <h3 className="text-lg font-semibold mb-3">Analyze Recent Period</h3>
                <p className="text-sm text-gray-600 mb-3">
                  Get insights on your recent training
                </p>
                
                {/* Timeframe Selector */}
                <div className="flex gap-2 mb-3">
                  <button
                    onClick={() => setPeriodDays(3)}
                    className={`btn btn-xs ${periodDays === 3 ? 'btn-primary' : 'btn-outline'}`}
                  >
                    3 Days
                  </button>
                  <button
                    onClick={() => setPeriodDays(7)}
                    className={`btn btn-xs ${periodDays === 7 ? 'btn-primary' : 'btn-outline'}`}
                  >
                    7 Days
                  </button>
                  <button
                    onClick={() => setPeriodDays(14)}
                    className={`btn btn-xs ${periodDays === 14 ? 'btn-primary' : 'btn-outline'}`}
                  >
                    14 Days
                  </button>
                  <button
                    onClick={() => setPeriodDays(30)}
                    className={`btn btn-xs ${periodDays === 30 ? 'btn-primary' : 'btn-outline'}`}
                  >
                    30 Days
                  </button>
                </div>
                
                <button
                  onClick={analyzePeriod}
                  className="btn btn-primary w-full"
                  disabled={analyzing}
                >
                  {analyzing ? 'Analyzing...' : `Analyze Last ${periodDays} Days`}
                </button>
              </div>
            </div>

            {/* Right Column - Analysis Results */}
            <div className="card bg-base-200 p-4">
              <h3 className="text-lg font-semibold mb-3">AI Analysis</h3>
              
              {!analysis ? (
                <div className="text-center py-8">
                  <div className="text-4xl mb-4">🤖</div>
                  <p className="text-gray-600">
                    Select a workout or analyze your recent period to get AI-powered insights
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-base-100 p-4 rounded">
                    <h4 className="font-semibold mb-2">Analysis Results</h4>
                    <div className="prose prose-sm max-w-none">
                      <div 
                        className="whitespace-pre-wrap text-sm"
                        dangerouslySetInnerHTML={{ __html: parseMarkdown(analysis) }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => setAnalysis(null)}
                      className="btn btn-outline btn-sm"
                    >
                      Clear Analysis
                    </button>
                    <button
                      onClick={() => {
                        if (selectedWorkout) {
                          analyzeWorkout(selectedWorkout.id);
                        } else {
                          analyzePeriod();
                        }
                      }}
                      className="btn btn-primary btn-sm"
                      disabled={analyzing}
                    >
                      {analyzing ? 'Analyzing...' : 'Refresh Analysis'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AiInsights; 