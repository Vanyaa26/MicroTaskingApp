import React, { useEffect, useState } from 'react';
import { HiChevronLeft, HiChevronRight, HiCheck, HiX } from 'react-icons/hi';
import { auth, db } from '../firebase';
import { collection, addDoc, query, where, onSnapshot, deleteDoc, doc, updateDoc, orderBy, getDocs } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { motion, AnimatePresence } from 'framer-motion';

const WeeklyPlanner = ({user}) => {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedDates, setSelectedDates] = useState([]);
    const [showPlanner, setShowPlanner] = useState(false);
    const [tasks, setTasks] = useState({});
    const [savedPlans, setSavedPlans] = useState([]);
    const [selectedPlan, setSelectedPlan] = useState(null);

    const months = ["January", "February", "March", "April", "May", "June", 
                   "July", "August", "September", "October", "November", "December"];
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    useEffect(() => {
        if (user) {
            fetchPlans();
        }
    }, [user]);
    
    const fetchPlans = async () => {
        try {
            console.log("Fetching plans for user:", user.uid);
            const q = query(
                collection(db, 'weeklyPlans'),
                where('userId', '==', user.uid)
            );
            const querySnapshot = await getDocs(q);
            const plans = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            console.log("Fetched plans:", plans);
            setSavedPlans(plans);
        } catch (error) {
            console.error("Error fetching plans:", error);
        }
    };
    
    const toggleTaskCompletion = async (planId, date) => {
        try {
            const plan = savedPlans.find(p => p.id === planId);
            const updatedTasks = {
                ...plan.tasks,
                [date]: {
                    ...plan.tasks[date],
                    completed: !plan.tasks[date].completed
                }
            };
            
            await updateDoc(doc(db, 'weeklyPlans', planId), {
                tasks: updatedTasks
            });
            
            setSavedPlans(plans => 
                plans.map(p => 
                    p.id === planId 
                        ? {...p, tasks: updatedTasks}
                        : p
                )
            );
        } catch (error) {
            console.error("Error toggling task completion:", error);
        }
    };
    
    const deleteTask = async (planId, date) => {
        try {
            const plan = savedPlans.find(p => p.id === planId);
            const { [date]: _, ...remainingTasks } = plan.tasks;
            
            // Check if this is the last task
            if (Object.keys(remainingTasks).length === 0) {
                // Delete the entire plan if no tasks remain
                await deleteDoc(doc(db, 'weeklyPlans', planId));
                setSavedPlans(plans => plans.filter(p => p.id !== planId));
                // Reset states and return to calendar view
                setShowPlanner(false);
                setSelectedPlan(null);
                setTasks({});
                setSelectedDates([]);
            } else {
                // Update plan with remaining tasks
                await updateDoc(doc(db, 'weeklyPlans', planId), {
                    tasks: remainingTasks
                });
                setSavedPlans(plans => 
                    plans.map(p => 
                        p.id === planId 
                            ? {...p, tasks: remainingTasks}
                            : p
                    )
                );
            }
        } catch (error) {
            console.error("Error deleting task:", error);
        }
    };
    
    
    const handleTitleChange = async (planId, newTitle) => {
        try {
            await updateDoc(doc(db, 'weeklyPlans', planId), {
                title: newTitle
            });
            setSavedPlans(plans => 
                plans.map(p => 
                    p.id === planId ? {...p, title: newTitle} : p
                )
            );
        } catch (error) {
            console.error("Error updating title:", error);
        }
    };

    const deletePlan = async (planId) => {
        try {
            await deleteDoc(doc(db, 'weeklyPlans', planId));
            setSavedPlans(plans => plans.filter(p => p.id !== planId));
            setShowPlanner(false);
            setSelectedPlan(null);
            setTasks({});
            setSelectedDates([]);
        } catch (error) {
            console.error("Error deleting plan:", error);
        }
    };
    
    const handleSavePlan = async () => {
        try {
            const planData = {
                userId: user.uid,
                createdAt: new Date(),
                dates: selectedDates.map(date => date.toISOString()),
                tasks: Object.fromEntries(
                    Object.entries(tasks).map(([date, task]) => [
                        date,
                        typeof task === 'string' ? { text: task, completed: false } : task
                    ])
                ),
                title: selectedPlan?.title || `Plan for ${selectedDates[0].toLocaleDateString()} - ${selectedDates[selectedDates.length - 1].toLocaleDateString()}`
            };
    
            if (selectedPlan) {
                await updateDoc(doc(db, 'weeklyPlans', selectedPlan.id), planData);
            } else {
                await addDoc(collection(db, 'weeklyPlans'), planData);
            }
    
            alert(selectedPlan ? "Plan updated successfully!" : "Plan saved successfully!");
            setShowPlanner(false);
            setSelectedDates([]);
            setTasks({});
            setSelectedPlan(null);
            fetchPlans();
        } catch (error) {
            console.error("Error saving plan:", error);
            alert("Error saving plan: " + error.message);
        }
    };
    
    

    const getDaysInMonth = (date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const days = new Date(year, month + 1, 0).getDate();
        const firstDay = new Date(year, month, 1).getDay();
        return { days, firstDay };
    };

    const { days: daysInMonth, firstDay } = getDaysInMonth(currentMonth);

    const handleDateClick = (day) => {
        const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
        if (selectedDates.some(d => d.getTime() === date.getTime())) {
            setSelectedDates(selectedDates.filter(d => d.getTime() !== date.getTime()));
        } else {
            setSelectedDates([...selectedDates, date].sort((a, b) => a - b));
        }
    };

    const handlePlanClick = () => {
        if (selectedDates.length > 0) {
            setShowPlanner(true);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
            {!showPlanner ? (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-4xl mx-auto"
                >
                    <h1 className="text-4xl font-bold text-center mb-8 bg-gradient-to-r from-blue-500 to-purple-500 text-transparent bg-clip-text">
                        Let's Plan Your Week
                    </h1>

                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                        <div className="flex justify-between items-center mb-6">
                            <button
                                onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() - 1)))}
                                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
                            >
                                <HiChevronLeft className="w-6 h-6" />
                            </button>
                            <h2 className="text-xl font-semibold dark:text-white">
                                {months[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                            </h2>
                            <button
                                onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() + 1)))}
                                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
                            >
                                <HiChevronRight className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="grid grid-cols-7 gap-2">
                            {days.map(day => (
                                <div key={day} className="text-center font-medium text-gray-600 dark:text-gray-400">
                                    {day}
                                </div>
                            ))}
                            {[...Array(firstDay)].map((_, i) => (
                                <div key={`empty-${i}`} />
                            ))}
                            {[...Array(daysInMonth)].map((_, i) => {
                                const day = i + 1;
                                const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
                                const isSelected = selectedDates.some(d => d.getTime() === date.getTime());
                                
                                return (
                                    <button
                                        key={day}
                                        onClick={() => handleDateClick(day)}
                                        className={`p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700
                                            ${isSelected ? 'bg-blue-500 text-white hover:bg-blue-600' : ''}
                                        `}
                                    >
                                        {day}
                                    </button>
                                );
                            })}
                        </div>

                        <button
                            onClick={handlePlanClick}
                            disabled={selectedDates.length === 0}
                            className={`mt-6 w-full py-2 rounded-lg transition-colors
                                ${selectedDates.length > 0 
                                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:opacity-90'
                                    : 'bg-gray-200 text-gray-500 cursor-not-allowed'}
                            `}
                        >
                            Plan Selected Days
                        </button>
                    </div>

                    {/* Saved Plans Section */}
                    <div className="mt-8">
                        <h2 className="text-2xl font-semibold mb-6 dark:text-white">Saved Plans</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">

                        {savedPlans.map((plan) => {
                                const totalTasks = Object.keys(plan.tasks || {}).length;
                                const completedTasks = Object.values(plan.tasks || {}).filter(task => task.completed).length;
                                const isCompleted = totalTasks > 0 && completedTasks === totalTasks;

                        return (
                            <motion.div
                                key={plan.id}
                                whileHover={{ scale: 1.02 }}
                                className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 cursor-pointer ${
                                    isCompleted ? 'border-2 border-green-500' : ''
                                }`}
                                onClick={() => {
                                    setSelectedPlan(plan);
                                    setShowPlanner(true);
                                    setTasks(plan.tasks);
                                    setSelectedDates(plan.dates.map(d => new Date(d)));
                                }}
                            >
                                <div className="flex flex-col w-full">
                                    <div className="flex justify-between items-start gap-2">
                                        <input
                                            type="text"
                                            value={plan.title}
                                            onChange={(e) => handleTitleChange(plan.id, e.target.value)}
                                            className="text-lg font-semibold dark:text-white bg-transparent border-b border-transparent hover:border-gray-300 focus:border-blue-500 outline-none max-w-[70%]"
                                            onClick={(e) => e.stopPropagation()}
                                        />
                                        {isCompleted && (
                                            <span className="px-2 py-1 bg-green-100 text-green-800 text-sm rounded-full whitespace-nowrap">
                                                Completed
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    {new Date(plan.dates[0]).toLocaleDateString()} - {new Date(plan.dates[plan.dates.length - 1]).toLocaleDateString()}
                                </p>
                                <div className="mt-2 flex items-center gap-2">
                                    <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                        <div 
                                            className="bg-blue-500 h-2 rounded-full transition-all"
                                            style={{ width: `${totalTasks ? (completedTasks / totalTasks) * 100 : 0}%` }}
                                        />
                                </div>
                                <span className="text-sm text-gray-500 dark:text-gray-400">
                                    {completedTasks}/{totalTasks}
                                </span>
                            </div>
                            </motion.div>
                                        );
                                    })}

                        </div>
                    </div>
                </motion.div>
            ) : (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="max-w-4xl mx-auto"
                >
                    <button
                        onClick={() => {
                            setShowPlanner(false);
                            setSelectedPlan(null);
                            setTasks({});
                            setSelectedDates([]);
                        }}
                        className="mb-4 text-blue-500 hover:text-blue-600 flex items-center gap-2"
                    >
                        <HiChevronLeft /> Back to Calendar
                    </button>

                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                        <h2 className="text-2xl font-semibold mb-6 dark:text-white">
                            {selectedPlan ? selectedPlan.title : 'Planning for Selected Days'}
                        </h2>

                        {selectedDates.map(date => (
                    <div key={date.toISOString()} className="mb-4">
                        <div className="flex items-center gap-4">
                            <h3 className="w-32 font-medium dark:text-white">
                                {date.toLocaleDateString('en-US', { 
                                    weekday: 'short',
                                    month: 'short',
                                    day: 'numeric'
                                })}
                            </h3>
                            <div className="flex-1 flex items-center gap-2">
                                <input
                                    type="text"
                                    value={typeof tasks[date.toISOString()] === 'object' 
                                        ? tasks[date.toISOString()].text 
                                        : tasks[date.toISOString()] || ''}
                                    onChange={(e) => setTasks(prev => ({
                                        ...prev,
                                        [date.toISOString()]: {
                                            text: e.target.value,
                                            completed: prev[date.toISOString()]?.completed || false
                                        }
                                    }))}
                                    className="flex-1 p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    placeholder="What's your goal for this day?"
                                />
                                <button
                                    onClick={() => toggleTaskCompletion(selectedPlan?.id, date.toISOString())}
                                    className={`p-2 rounded-full transition-colors ${
                                        tasks[date.toISOString()]?.completed
                                            ? 'bg-green-500 text-white'
                                            : 'bg-gray-200 dark:bg-gray-700'
                                    }`}
                                >
                                    <HiCheck className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={() => deleteTask(selectedPlan?.id, date.toISOString())}
                                    className="p-2 text-red-500 hover:text-red-600"
                                >
                                    <HiX className="w-5 h-5" />
                                </button>
            </div>
        </div>
    </div>
))}



                        <button
                            onClick={handleSavePlan}
                            className="mt-6 w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white py-2 rounded-lg hover:opacity-90"
                        >
                            {selectedPlan ? 'Update Plan' : 'Save Weekly Plan'}
                        </button>
                    </div>
                </motion.div>
            )}
        </div>
    );
};

export default WeeklyPlanner;
