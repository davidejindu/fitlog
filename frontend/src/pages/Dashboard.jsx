import Header from '../components/Header';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getWorkouts, deleteWorkout } from '../services/apiService';

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

  const handleDeleteWorkout = async (workoutId) => {
    if (window.confirm('Are you sure you want to delete this workout?')) {
      try {
        await deleteWorkout(workoutId);
        // Refresh the workouts list
        window.location.reload();
      } catch (error) {
        console.error('Error deleting workout:', error);
        alert('Failed to delete workout');
      }
    }
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
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-primary">Welcome back, {getUserFirstName()}!</h1>
          <p className="text-gray-600">Track your progress and stay motivated</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="stat bg-base-100 shadow rounded-lg">
            <div className="stat-figure text-primary">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-8 h-8 stroke-current">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
              </svg>
            </div>
            <div className="stat-title">Current Streak</div>
            <div className="stat-value text-primary">{calculateStreak()}</div>
            <div className="stat-desc text-xs">days</div>
          </div>

          <div className="stat bg-base-100 shadow rounded-lg">
            <div className="stat-figure text-secondary">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-8 h-8 stroke-current">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
              </svg>
            </div>
            <div className="stat-title">Total Workouts</div>
            <div className="stat-value text-secondary">{workouts.length}</div>
            <div className="stat-desc text-xs">last 30 days</div>
          </div>

          <div className="stat bg-base-100 shadow rounded-lg">
            <div className="stat-figure text-accent">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-8 h-8 stroke-current">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
              </svg>
            </div>
            <div className="stat-title">Total Exercises</div>
            <div className="stat-value text-accent">
              {workouts.reduce((total, workout) => {
                return total + workout.exercises.length;
              }, 0)}
            </div>
            <div className="stat-desc text-xs">exercises</div>
          </div>

          <div className="stat bg-base-100 shadow rounded-lg">
            <div className="stat-figure text-info">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-8 h-8 stroke-current">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
              </svg>
            </div>
            <div className="stat-title">Total Weight</div>
            <div className="stat-value text-info">
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
                  {workouts.slice(0, 10).map((workout, index) => {
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
                              onClick={() => handleDeleteWorkout(workout.id)}
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
              {workouts.length > 10 && (
                <div className="text-center mt-4">
                  <p className="text-sm text-gray-600">
                    Showing 10 most recent workouts. View all workouts in Analytics.
                  </p>
                </div>
              )}
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