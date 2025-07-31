import Header from '../components/Header';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Calculate current streak
  const calculateStreak = () => {
    if (workouts.length === 0) return 0;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Start of today
    
    // Get unique workout dates and sort them in descending order
    const workoutDates = [...new Set(workouts.map(w => new Date(w.date).toDateString()))]
      .map(dateStr => new Date(dateStr))
      .sort((a, b) => b - a); // Sort descending
    
    let streak = 0;
    let currentDate = new Date(today);
    
    // Check if there's a workout today
    const hasWorkoutToday = workoutDates.some(date => 
      date.toDateString() === today.toDateString()
    );
    
    if (!hasWorkoutToday) {
      // If no workout today, start checking from yesterday
      currentDate.setDate(currentDate.getDate() - 1);
    }
    
    // Count consecutive days with workouts
    while (true) {
      const hasWorkoutOnDate = workoutDates.some(date => 
        date.toDateString() === currentDate.toDateString()
      );
      
      if (hasWorkoutOnDate) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        break;
      }
    }
    
    return streak;
  };

  // Get user's first name for welcome message
  const getUserFirstName = () => {
    if (user && user.firstName) {
      return user.firstName;
    }
    return 'there'; // Fallback if no name available
  };

  useEffect(() => {
    const fetchWorkouts = async () => {
      try {
        const from = new Date();
        from.setDate(from.getDate() - 30); // 30 days ago
        const to = new Date();
    
        const response = await fetch(
          `http://localhost:8080/api/workout?from=${from.toISOString().split('T')[0]}&to=${to.toISOString().split('T')[0]}`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${localStorage.getItem('token')}`, // Include token if required
            },
          }
        );
    
        if (!response.ok) {
          const errorText = await response.text(); // Log the response body for debugging
          console.error('Response error:', errorText);
          
          // Check if it's an authentication error (401) or JWT expired (500 with JWT error)
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

  return (
    <div className="min-h-screen bg-base-100">
      {/* Navbar */}
      <Header logout={logout} />

      {/* Main Content */}
      <div className="container mx-auto p-4 max-w-6xl">
        {/* Welcome Section */}
        <div className="hero bg-base-200 rounded-lg mb-6">
          <div className="hero-content text-center">
            <div className="max-w-md">
              <h1 className="text-4xl font-bold">Welcome back, {getUserFirstName()}!</h1>
              <p className="py-4">Ready to crush your fitness goals today? Let's track your progress and get some AI-powered insights.</p>
              <button 
                className="btn btn-primary btn-sm"
                onClick={() => navigate('/create-workout')}
              >
                Start Workout
              </button>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <div className="stat bg-base-200 rounded-lg p-3">
            <div className="stat-title text-xs">Total Workouts</div>
            <div className="stat-value text-lg">{workouts.length}</div>
            <div className="stat-desc text-xs">Last 30 days</div>
          </div>
          
          <div className="stat bg-base-200 rounded-lg p-3">
            <div className="stat-title text-xs">This Week</div>
            <div className="stat-value text-lg">
              {workouts.filter(workout => {
                const workoutDate = new Date(workout.date);
                const now = new Date();
                const oneWeekAgo = new Date();
                oneWeekAgo.setDate(now.getDate() - 7);
                return workoutDate >= oneWeekAgo && workoutDate <= now;
              }).length}
            </div>
            <div className="stat-desc text-xs">Workouts this week</div>
          </div>
          
          <div className="stat bg-base-200 rounded-lg p-3">
            <div className="stat-title text-xs">Streak</div>
            <div className="stat-value text-lg">{calculateStreak()}</div>
            <div className="stat-desc text-xs">days</div>
          </div>
          
          <div className="stat bg-base-200 rounded-lg p-3">
            <div className="stat-title text-xs">Total Weight</div>
            <div className="stat-value text-lg">
              {workouts.reduce((total, workout) => {
                return total + workout.exercises.reduce((exerciseTotal, exercise) => {
                  return exerciseTotal + exercise.sets.reduce((setTotal, set) => {
                    return setTotal + (set.weightLbs * set.reps);
                  }, 0);
                }, 0);
              }, 0).toLocaleString()}
            </div>
            <div className="stat-desc text-xs">lbs lifted</div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="mt-6">
          <h3 className="text-lg font-bold mb-3">Recent Activity</h3>
          {loading ? (
            <p>Loading...</p>
          ) : workouts.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="table table-zebra table-sm">
                <thead>
                  <tr>
                    <th className="text-xs">Date</th>
                    <th className="text-xs">Workout</th>
                    <th className="text-xs">Exercises</th>
                    <th className="text-xs">Total Weight</th>
                    <th className="text-xs">Status</th>
                    <th className="text-xs">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {workouts.map((workout, index) => {
                    const totalWeight = workout.exercises.reduce((exerciseTotal, exercise) => {
                      return exerciseTotal + exercise.sets.reduce((setTotal, set) => {
                        return setTotal + (set.weightLbs * set.reps);
                      }, 0);
                    }, 0);
                    
                    return (
                      <tr key={index}>
                        <td className="text-xs">{new Date(workout.date).toLocaleDateString()}</td>
                        <td className="text-xs">{workout.name}</td>
                        <td className="text-xs">{workout.exercises.length} exercise{workout.exercises.length !== 1 ? 's' : ''}</td>
                        <td className="text-xs">{totalWeight.toLocaleString()} lbs</td>
                        <td>
                          <span className="badge badge-success badge-sm">Completed</span>
                        </td>
                        <td>
                          <div className="flex gap-1">
                            <button
                              onClick={() => navigate(`/edit-workout/${workout.id}`)}
                              className="btn btn-xs btn-outline"
                            >
                              Edit
                            </button>
                            <button
                              onClick={async () => {
                                if (window.confirm('Are you sure you want to delete this workout?')) {
                                  try {
                                    const response = await fetch(`http://localhost:8080/api/workout/${workout.id}`, {
                                      method: 'DELETE',
                                      headers: {
                                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                                      }
                                    });
                                    
                                    if (response.ok) {
                                      // Refresh the workouts list
                                      window.location.reload();
                                    } else {
                                      alert('Failed to delete workout');
                                    }
                                  } catch (error) {
                                    console.error('Error deleting workout:', error);
                                    alert('Failed to delete workout');
                                  }
                                }
                              }}
                              className="btn btn-xs btn-error"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm">No recent activity found.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;