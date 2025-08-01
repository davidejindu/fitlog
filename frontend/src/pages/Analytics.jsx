import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { useAuth } from '../context/AuthContext';
import { getWorkouts, getWorkoutCalendar } from '../services/apiService';

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
        const workoutsData = await getWorkouts(from, to);
        setWorkouts(workoutsData);

        // Fetch calendar data
        const monthString = `${year}-${String(month + 1).padStart(2, '0')}`;
        try {
          const calendarData = await getWorkoutCalendar(monthString);
          setCalendarData(calendarData);
        } catch (error) {
          console.error('Error fetching calendar data:', error);
          // Calendar data is optional, so we don't fail the whole request
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        if (error.message.includes('401') || error.message.includes('JWT expired')) {
          logout();
          navigate('/login');
          return;
        }
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

    // Calculate average sets per workout
    const avgSetsPerWorkout = totalWorkouts > 0 ? totalSets / totalWorkouts : 0;

    // Calculate average exercises per workout
    const avgExercisesPerWorkout = totalWorkouts > 0 ? totalExercises / totalWorkouts : 0;

    // Calculate average weight per set
    const avgWeightPerSet = totalSets > 0 ? totalWeight / totalSets : 0;

    // Get most common exercises
    const exerciseCounts = {};
    workouts.forEach(workout => {
      workout.exercises.forEach(exercise => {
        exerciseCounts[exercise.name] = (exerciseCounts[exercise.name] || 0) + 1;
      });
    });

    const topExercises = Object.entries(exerciseCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5) // Limit to top 5 exercises
      .map(([name, count]) => ({ name, count }));

    return {
      totalWeight,
      totalWorkouts,
      totalExercises,
      totalSets,
      avgWeightPerWorkout,
      avgSetsPerWorkout,
      avgExercisesPerWorkout,
      avgWeightPerSet,
      topExercises
    };
  };

  const analytics = calculateAnalytics();

  const changeMonth = (direction) => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev);
      if (direction === 'next') {
        newMonth.setMonth(newMonth.getMonth() + 1);
      } else {
        newMonth.setMonth(newMonth.getMonth() - 1);
      }
      return newMonth;
    });
  };

  const generateCalendarGrid = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const calendar = [];
    const currentDate = new Date(startDate);

    for (let week = 0; week < 6; week++) {
      const weekDays = [];
      for (let day = 0; day < 7; day++) {
        const dateString = currentDate.toISOString().split('T')[0];
        const isCurrentMonth = currentDate.getMonth() === month;
        const hasWorkout = calendarData[dateString] || false;
        
        weekDays.push({
          date: new Date(currentDate),
          dateString,
          isCurrentMonth,
          hasWorkout
        });
        
        currentDate.setDate(currentDate.getDate() + 1);
      }
      calendar.push(weekDays);
    }

    return calendar;
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
        <h1 className="text-3xl font-bold mb-8">Analytics</h1>
        
        {/* Analytics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="stat bg-base-100 shadow rounded-lg">
            <div className="stat-figure text-primary">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-8 h-8 stroke-current">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
              </svg>
            </div>
            <div className="stat-title">Total Workouts</div>
            <div className="stat-value text-primary">{analytics.totalWorkouts || 0}</div>
            <div className="stat-desc text-xs">this month</div>
          </div>

          <div className="stat bg-base-100 shadow rounded-lg">
            <div className="stat-figure text-secondary">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-8 h-8 stroke-current">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
              </svg>
            </div>
            <div className="stat-title">Total Weight</div>
            <div className="stat-value text-secondary">{(analytics.totalWeight || 0).toLocaleString()}</div>
            <div className="stat-desc text-xs">lbs lifted</div>
          </div>

          <div className="stat bg-base-100 shadow rounded-lg">
            <div className="stat-figure text-accent">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-8 h-8 stroke-current">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
              </svg>
            </div>
            <div className="stat-title">Total Exercises</div>
            <div className="stat-value text-accent">{analytics.totalExercises || 0}</div>
            <div className="stat-desc text-xs">exercises</div>
          </div>

          <div className="stat bg-base-100 shadow rounded-lg">
            <div className="stat-figure text-info">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-8 h-8 stroke-current">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
              </svg>
            </div>
            <div className="stat-title">Avg Weight/Workout</div>
            <div className="stat-value text-info">{Math.round(analytics.avgWeightPerWorkout || 0).toLocaleString()}</div>
            <div className="stat-desc text-xs">lbs</div>
          </div>
        </div>

        {/* Calendar View */}
        <div className="card bg-base-100 shadow-xl mb-8">
          <div className="card-body">
            <div className="flex justify-between items-center mb-4">
              <h2 className="card-title">Workout Calendar</h2>
              <div className="flex gap-2">
                <button
                  onClick={() => changeMonth('prev')}
                  className="btn btn-sm btn-outline"
                >
                  ←
                </button>
                <span className="text-lg font-medium">
                  {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </span>
                <button
                  onClick={() => changeMonth('next')}
                  className="btn btn-sm btn-outline"
                >
                  →
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-1">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="text-center text-sm font-medium p-2">
                  {day}
                </div>
              ))}
              
              {generateCalendarGrid().map((week, weekIndex) => (
                week.map((day, dayIndex) => (
                  <div
                    key={`${weekIndex}-${dayIndex}`}
                    className={`
                      p-2 text-center text-sm border rounded
                      ${day.isCurrentMonth ? 'bg-base-200' : 'bg-base-100 text-gray-400'}
                      ${day.hasWorkout ? 'bg-primary text-primary-content' : ''}
                    `}
                  >
                    {day.date.getDate()}
                  </div>
                ))
              ))}
            </div>
          </div>
        </div>

         {/* Top Exercises */}
         <div className="card bg-base-100 shadow-xl mt-6">
          <div className="card-body">
            <h3 className="card-title">Most Performed Exercises</h3>
            <div className="space-y-2">
              {analytics.topExercises && analytics.topExercises.length > 0 ? (
                analytics.topExercises.map((exercise, index) => (
                  <div key={index} className="flex justify-between items-center p-2 bg-base-200 rounded">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white text-xs font-bold">
                        {exercise.count}
                      </div>
                      <span className="font-medium text-sm">{exercise.name}</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-600 text-center py-4">No exercises found for this period.</p>
              )}

        {/* Detailed Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h3 className="card-title">Workout Statistics</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Average Sets per Workout:</span>
                  <span className="font-medium">{Math.round(analytics.avgSetsPerWorkout || 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Average Exercises per Workout:</span>
                  <span className="font-medium">{Math.round(analytics.avgExercisesPerWorkout || 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Average Weight per Set:</span>
                  <span className="font-medium">{Math.round(analytics.avgWeightPerSet || 0)} lbs</span>
                </div>
              </div>
            </div>
          </div>

          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h3 className="card-title">Monthly Summary</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Total Sets:</span>
                  <span className="font-medium">{analytics.totalSets || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Workout Frequency:</span>
                  <span className="font-medium">
                    {analytics.totalWorkouts || 0} / {new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate()} days
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Most Active Day:</span>
                  <span className="font-medium">Coming Soon</span>
                </div>
              </div>
            </div>
          </div>
        </div>

       
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics; 