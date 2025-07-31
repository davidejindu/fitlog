import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { useAuth } from '../context/AuthContext';

const Analytics = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [workouts, setWorkouts] = useState([]);
  const [calendarData, setCalendarData] = useState({});
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get the first and last day of the current month
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth();
        const from = new Date(year, month, 1);
        const to = new Date(year, month + 1, 0); // Last day of the month
    
        // Fetch workouts data
        const workoutsResponse = await fetch(
          `http://localhost:8080/api/workout?from=${from.toISOString().split('T')[0]}&to=${to.toISOString().split('T')[0]}`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
          }
        );
    
        if (!workoutsResponse.ok) {
          const errorText = await workoutsResponse.text();
          console.error('Response error:', errorText);
          
          if (workoutsResponse.status === 401 || (workoutsResponse.status === 500 && errorText.includes('JWT expired'))) {
            console.log('Token expired or invalid, redirecting to login');
            logout();
            navigate('/login');
            return;
          }
          
          throw new Error(`HTTP error! status: ${workoutsResponse.status}`);
        }
    
        const workoutsData = await workoutsResponse.json();
        setWorkouts(workoutsData);

        // Fetch calendar data
        const monthString = `${year}-${String(month + 1).padStart(2, '0')}`;
        const calendarResponse = await fetch(
          `http://localhost:8080/api/workout/calendar?month=${monthString}`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
          }
        );

        if (calendarResponse.ok) {
          const calendarData = await calendarResponse.json();
          setCalendarData(calendarData);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [logout, navigate, currentMonth]);

  // Calculate analytics data
  const calculateAnalytics = () => {
    if (workouts.length === 0) return {};

    const totalWeight = workouts.reduce((total, workout) => {
      return total + workout.exercises.reduce((exerciseTotal, exercise) => {
        return exerciseTotal + exercise.sets.reduce((setTotal, set) => {
          return setTotal + (set.weightLbs * set.reps);
        }, 0);
      }, 0);
    }, 0);

    const totalWorkouts = workouts.length;
    const totalExercises = workouts.reduce((total, workout) => total + workout.exercises.length, 0);
    const totalSets = workouts.reduce((total, workout) => {
      return total + workout.exercises.reduce((exerciseTotal, exercise) => {
        return exerciseTotal + exercise.sets.length;
      }, 0);
    }, 0);

    // Calculate average weight per workout
    const avgWeightPerWorkout = totalWorkouts > 0 ? totalWeight / totalWorkouts : 0;

    // Get most common exercises
    const exerciseCounts = {};
    workouts.forEach(workout => {
      workout.exercises.forEach(exercise => {
        exerciseCounts[exercise.name] = (exerciseCounts[exercise.name] || 0) + 1;
      });
    });

    const topExercises = Object.entries(exerciseCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }));



    return {
      totalWeight,
      totalWorkouts,
      totalExercises,
      totalSets,
      avgWeightPerWorkout,
      topExercises
    };
  };

  const analytics = calculateAnalytics();

  // Generate calendar grid
  const generateCalendarGrid = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(firstDay.getDate() - firstDay.getDay()); // Start from Sunday
    
    const calendar = [];
    const currentDate = new Date(startDate);
    
    // Generate 6 weeks (42 days) to ensure we cover the full month
    for (let week = 0; week < 6; week++) {
      const weekDays = [];
      for (let day = 0; day < 7; day++) {
        const dateString = currentDate.toISOString().split('T')[0];
        const workoutCount = calendarData[dateString] || 0;
        
        weekDays.push({
          date: new Date(currentDate),
          workoutCount,
          isCurrentMonth: currentDate.getMonth() === month,
          isToday: currentDate.toDateString() === new Date().toDateString()
        });
        
        currentDate.setDate(currentDate.getDate() + 1);
      }
      calendar.push(weekDays);
    }
    
    return calendar;
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
          <h1 className="text-2xl font-bold mb-2">Analytics</h1>
          
          {/* Month Navigation */}
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => {
                const prevMonth = new Date(currentMonth);
                prevMonth.setMonth(prevMonth.getMonth() - 1);
                setCurrentMonth(prevMonth);
              }}
              className="btn btn-sm btn-outline"
            >
              ← Previous Month
            </button>
            <div className="text-lg font-semibold">
              {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </div>
            <button
              onClick={() => {
                const nextMonth = new Date(currentMonth);
                nextMonth.setMonth(nextMonth.getMonth() + 1);
                setCurrentMonth(nextMonth);
              }}
              disabled={currentMonth.getMonth() === new Date().getMonth() && currentMonth.getFullYear() === new Date().getFullYear()}
              className={`btn btn-sm ${currentMonth.getMonth() === new Date().getMonth() && currentMonth.getFullYear() === new Date().getFullYear() ? 'btn-disabled' : 'btn-outline'}`}
            >
              Next Month →
            </button>
          </div>
        </div>

        {workouts.length === 0 ? (
          <div className="text-center py-8">
            <h2 className="text-xl font-semibold mb-2">No Data Available</h2>
            <p className="text-gray-600 mb-4">Start logging workouts to see your analytics!</p>
            <button
              onClick={() => navigate('/create-workout')}
              className="btn btn-primary btn-sm"
            >
              Create Your First Workout
            </button>
          </div>
        ) : (
          <>
            {/* Key Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
              <div className="stat bg-base-200 rounded-lg p-3">
                <div className="stat-title text-xs">Total Weight Lifted</div>
                <div className="stat-value text-primary text-lg">{analytics.totalWeight.toLocaleString()}</div>
                <div className="stat-desc text-xs">lbs this month</div>
              </div>
              
              <div className="stat bg-base-200 rounded-lg p-3">
                <div className="stat-title text-xs">Workouts Completed</div>
                <div className="stat-value text-secondary text-lg">{analytics.totalWorkouts}</div>
                <div className="stat-desc text-xs">sessions</div>
              </div>
              
              <div className="stat bg-base-200 rounded-lg p-3">
                <div className="stat-title text-xs">Average per Workout</div>
                <div className="stat-value text-accent text-lg">{Math.round(analytics.avgWeightPerWorkout).toLocaleString()}</div>
                <div className="stat-desc text-xs">lbs per session</div>
              </div>
              
              <div className="stat bg-base-200 rounded-lg p-3">
                <div className="stat-title text-xs">Total Exercises</div>
                <div className="stat-value text-lg">{analytics.totalExercises}</div>
                <div className="stat-desc text-xs">unique exercises</div>
              </div>
            </div>

            {/* Workout Calendar */}
            <div className="card bg-base-200 p-2 mb-6">
              <h2 className="text-lg font-semibold mb-1">Workout Calendar</h2>
              <div className="calendar-container">
                {/* Weekday headers */}
                <div className="grid grid-cols-7 gap-0.5 mb-0.5">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="text-center text-xs font-semibold text-gray-500">
                      {day}
                    </div>
                  ))}
                </div>
                
                {/* Calendar grid */}
                <div className="grid grid-cols-7 gap-0.5">
                  {generateCalendarGrid().map((week, weekIndex) => (
                    week.map((day, dayIndex) => (
                      <div
                        key={`${weekIndex}-${dayIndex}`}
                        className={`
                          h-6 w-full p-0 text-center text-xs relative
                          ${day.isCurrentMonth ? 'text-base-content' : 'text-gray-500'}
                          ${day.isToday ? 'ring-1 ring-primary ring-opacity-50' : ''}
                          ${day.workoutCount > 0 ? 'bg-primary text-primary-content' : 'bg-base-100'}
                          hover:bg-opacity-80 transition-colors cursor-pointer
                        `}
                        title={day.workoutCount > 0 ? `${day.workoutCount} workout${day.workoutCount > 1 ? 's' : ''} on ${day.date.toLocaleDateString()}` : `No workouts on ${day.date.toLocaleDateString()}`}
                      >
                        <div className="font-medium text-xs leading-6">
                          {day.date.getDate()}
                        </div>
                      </div>
                    ))
                  ))}
                </div>
              </div>
            </div>

            {/* Top Exercises */}
            <div className="card bg-base-200 p-4 mb-6">
              <h2 className="text-lg font-semibold mb-3">Most Performed Exercises</h2>
              <div className="space-y-2">
                {analytics.topExercises.map((exercise, index) => (
                  <div key={index} className="flex justify-between items-center p-2 bg-base-100 rounded">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white text-xs font-bold">
                        {exercise.count}
                      </div>
                      <span className="font-medium text-sm">{exercise.name}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Detailed Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="card bg-base-200 p-4">
                <h3 className="text-md font-semibold mb-3">Workout Frequency</h3>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Workouts per week:</span>
                    <span className="font-semibold">
                      {Math.round((analytics.totalWorkouts / 4) * 10) / 10}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total sets completed:</span>
                    <span className="font-semibold">{analytics.totalSets}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Average sets per workout:</span>
                    <span className="font-semibold">
                      {analytics.totalWorkouts > 0 ? Math.round(analytics.totalSets / analytics.totalWorkouts) : 0}
                    </span>
                  </div>
                </div>
              </div>

              <div className="card bg-base-200 p-4">
                <h3 className="text-md font-semibold mb-3">Progress Summary</h3>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Total volume:</span>
                    <span className="font-semibold">{analytics.totalWeight.toLocaleString()} lbs</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Average per day:</span>
                    <span className="font-semibold">
                      {Math.round(analytics.totalWeight / new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate()).toLocaleString()} lbs
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Exercises per workout:</span>
                    <span className="font-semibold">
                      {analytics.totalWorkouts > 0 ? Math.round(analytics.totalExercises / analytics.totalWorkouts) : 0}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Analytics; 