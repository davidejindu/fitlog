import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { useAuth } from '../context/AuthContext';
import { getWorkouts, getWorkoutAnalysis, getPeriodAnalysis } from '../services/apiService';

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
    
        const data = await getWorkouts(from, to);
        setWorkouts(data);
      } catch (error) {
        console.error('Error fetching workouts:', error);
        if (error.message.includes('401') || error.message.includes('JWT expired')) {
          logout();
          navigate('/login');
          return;
        }
      } finally {
        setLoading(false);
      }
    };

    fetchWorkouts();
  }, [logout, navigate]);

  const analyzeWorkout = async (workoutId) => {
    setAnalyzing(true);
    try {
      const data = await getWorkoutAnalysis(workoutId, goal);
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
      const data = await getPeriodAnalysis(goal);
      setAnalysis(data.analysis);
    } catch (error) {
      console.error('Error analyzing period:', error);
      alert('Failed to analyze period. Please try again.');
    } finally {
      setAnalyzing(false);
    }
  };

  const parseMarkdown = (text) => {
    if (!text) return '';
    
    // Simple markdown parsing for basic formatting
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/^### (.*$)/gim, '<h3 class="text-lg font-bold mb-2">$1</h3>')
      .replace(/^## (.*$)/gim, '<h2 class="text-xl font-bold mb-3">$1</h2>')
      .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold mb-4">$1</h1>')
      .replace(/\n/g, '<br>');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-base-200">
        <Header />
        <div className="flex items-center justify-center min-h-[calc(100vh-64px)]">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-200">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">AI Insights</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Controls */}
          <div className="space-y-6">
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <h2 className="card-title">Analysis Settings</h2>
                
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Fitness Goal</span>
                  </label>
                  <select 
                    className="select select-bordered"
                    value={goal}
                    onChange={(e) => setGoal(e.target.value)}
                  >
                    <option value="STRENGTH">Strength</option>
                    <option value="MUSCLE_GROWTH">Muscle Growth</option>
                    <option value="BOTH">Both</option>
                  </select>
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Period Analysis (Days)</span>
                  </label>
                  <input
                    type="number"
                    className="input input-bordered"
                    value={periodDays}
                    onChange={(e) => setPeriodDays(parseInt(e.target.value))}
                    min="7"
                    max="90"
                  />
                </div>

                <div className="card-actions justify-end">
                  <button
                    onClick={analyzePeriod}
                    className={`btn btn-primary ${analyzing ? 'loading' : ''}`}
                    disabled={analyzing}
                  >
                    {analyzing ? 'Analyzing...' : 'Analyze Period'}
                  </button>
                </div>
              </div>
            </div>

            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <h2 className="card-title">Workout Analysis</h2>
                
                {workouts.length === 0 ? (
                  <p className="text-gray-600">No workouts found. Create some workouts to get AI insights!</p>
                ) : (
                  <div className="space-y-2">
                    <label className="label">
                      <span className="label-text">Select a workout to analyze:</span>
                    </label>
                    <select 
                      className="select select-bordered w-full"
                      value={selectedWorkout || ''}
                      onChange={(e) => setSelectedWorkout(e.target.value)}
                    >
                      <option value="">Choose a workout...</option>
                      {workouts.map((workout) => (
                        <option key={workout.id} value={workout.id}>
                          {workout.name} - {new Date(workout.date).toLocaleDateString()}
                        </option>
                      ))}
                    </select>
                    
                    <button
                      onClick={() => analyzeWorkout(selectedWorkout)}
                      className={`btn btn-secondary w-full ${analyzing ? 'loading' : ''}`}
                      disabled={!selectedWorkout || analyzing}
                    >
                      {analyzing ? 'Analyzing...' : 'Analyze Workout'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Analysis Results */}
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title">AI Analysis</h2>
              
              {analysis ? (
                <div className="prose max-w-none">
                  <div 
                    dangerouslySetInnerHTML={{ __html: parseMarkdown(analysis) }}
                    className="text-base-content"
                  />
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-6xl mb-4">🤖</div>
                  <h3 className="text-lg font-semibold mb-2">Ready for Analysis</h3>
                  <p className="text-gray-600">
                    Select a workout or analyze your recent period to get AI-powered insights about your fitness progress.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AiInsights; 