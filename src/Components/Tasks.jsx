import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { collection, addDoc, query, where, onSnapshot, deleteDoc, doc, updateDoc, orderBy } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { motion, AnimatePresence } from 'framer-motion';
import { HiPlus, HiX, HiCheck, HiFlag, HiCalendar, HiClock } from 'react-icons/hi';
import { serverTimestamp } from 'firebase/firestore';


const Tasks = ({ user }) => {
    const [tasks, setTasks] = useState([]);
    const [newTask, setNewTask] = useState({ 
        title: '', 
        description: '', 
        priority: "medium",
        dueDate: '',
        status: 'pending'
    });
    const [showAddTask, setShowAddTask] = useState(false);
    const [filter, setFilter] = useState('all');
    const navigate = useNavigate();

    useEffect(() => {
        if (!user) {
            navigate('/');
            return;
        }
    
        const q = query(
            collection(db, 'tasks'), 
            where('userId', '==', user.uid)
        );
    
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const taskList = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setTasks(taskList);
        }, (error) => {
            console.error("Error fetching tasks:", error);
        });
    
        return () => unsubscribe();
    }, [user, navigate]);
    

    const addTask = async (e) => {
        e.preventDefault();
        if (!newTask.title.trim()) return;
    
        try {
            const taskData = {
                title: newTask.title,
                description: newTask.description,
                priority: newTask.priority,
                dueDate: newTask.dueDate,
                status: 'pending',
                userId: user.uid,
                createdAt: new Date()
            };
    
          
            await addDoc(collection(db, 'tasks'), taskData);
            
            setNewTask({ 
                title: '', 
                description: '', 
                priority: "medium", 
                dueDate: '', 
                status: 'pending' 
            });
            setShowAddTask(false);
        } catch (error) {
            console.error("Error adding task:", error);
        }
    };
    

    const updateTask = async (taskId, updatedTask) => {
        try {
            await updateDoc(doc(db, 'tasks', taskId), updatedTask);
        } catch (error) {
            console.error("Error updating task:", error);
        }
    };

    const deleteTask = async (taskId) => {
        try {
            await deleteDoc(doc(db, 'tasks', taskId));
        } catch (error) {
            console.error("Error deleting task:", error);
        }
    };

    const toggleTaskStatus = async (taskId, currentStatus) => {
        try {
            await updateDoc(doc(db, 'tasks', taskId), {
                status: currentStatus === 'completed' ? 'pending' : 'completed'
            });
        } catch (error) {
            console.error("Error toggling task status:", error);
        }
    };

    const filteredTasks = tasks.filter(task => {
        if (filter === 'completed') return task.status === 'completed';
        if (filter === 'pending') return task.status === 'pending';
        return true;
    });
    
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <div className="container mx-auto px-4 py-8">
                <div className="max-w-4xl mx-auto">
                    <div className="flex justify-between items-center mb-8">
                        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">My Tasks</h1>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setShowAddTask(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white mt-[-1.5rem] rounded-lg hover:bg-blue-700"
                        >
                            <HiPlus className="w-5 h-5" />
                            Add New Task
                        </motion.button>
                    </div>

                    <div className="flex gap-4 mb-6">
                        {['all', 'pending', 'completed'].map((filterOption) => (
                            <button
                                key={filterOption}
                                onClick={() => setFilter(filterOption)}
                                className={`px-4 py-2 rounded-lg ${
                                    filter === filterOption
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                                }`}
                            >
                                {filterOption.charAt(0).toUpperCase() + filterOption.slice(1)}
                            </button>
                        ))}
                    </div>

                    <AnimatePresence>
                        {filteredTasks.map((task) => (
                            <motion.div
                                key={task.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className={`mb-4 p-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm border-l-4 ${
                                    task.status === 'completed' 
                                        ? 'border-green-500 opacity-75' 
                                        : task.priority === 'high'
                                        ? 'border-red-500'
                                        : task.priority === 'medium'
                                        ? 'border-yellow-500'
                                        : 'border-blue-500'
                                }`}
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex items-start gap-4">
                                        <button
                                            onClick={() => toggleTaskStatus(task.id, task.status)}
                                            className={`mt-1 w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                                                task.status === 'completed'
                                                    ? 'border-green-500 bg-green-500'
                                                    : 'border-gray-300'
                                            }`}
                                        >
                                            {task.status === 'completed' && (
                                                <HiCheck className="w-4 h-4 text-white" />
                                            )}
                                        </button>
                                        <div>
                                            <h3 className={`text-lg font-semibold ${
                                                task.status === 'completed' 
                                                    ? 'line-through text-gray-500' 
                                                    : 'text-gray-800 dark:text-white'
                                            }`}>
                                                {task.title.toUpperCase()}
                                            </h3>
                                            <p className="text-gray-600 dark:text-gray-400 mt-1">
                                                {task.description && task.description.charAt(0).toUpperCase() + task.description.slice(1)}
                                            </p>
                                            <p className="text-gray-600 dark:text-white mt-1">
                                                Task Priority - {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                                            </p>
                                            {task.dueDate && (
                                                <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                                                    <HiCalendar className="w-4 h-4" />
                                                    <span>{new Date(task.dueDate).toLocaleDateString()}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => updateTask(task.id, { ...task, priority: 'high' })}
                                            className="p-2 text-gray-500 hover:text-red-500"
                                        >
                                            <HiFlag className="w-5 h-5" />
                                        </button>
                                        <button
                                            onClick={() => deleteTask(task.id)}
                                            className="p-2 text-gray-500 hover:text-red-500"
                                        >
                                            <HiX className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    <AnimatePresence>
                        {showAddTask && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4"
                                onClick={() => setShowAddTask(false)}
                            >
                                <motion.div
                                    initial={{ scale: 0.95 }}
                                    animate={{ scale: 1 }}
                                    exit={{ scale: 0.95 }}
                                    className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md"
                                    onClick={e => e.stopPropagation()}
                                >
                                    <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">
                                        Add New Task
                                    </h2>
                                    <form onSubmit={addTask} className="space-y-4">
                                        <input
                                            type="text"
                                            value={newTask.title}
                                            onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                                            placeholder="Task Title"
                                            className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                            required
                                        />
                                        <textarea
                                            value={newTask.description}
                                            onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                                            placeholder="Task Description"
                                            className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                            rows="3"
                                        />
                                        <input
                                            type="date"
                                            value={newTask.dueDate}
                                            onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                                            className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                        />
                                        <select
                                            value={newTask.priority}
                                            onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                                            className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                        >
                                            <option value="low">Low Priority</option>
                                            <option value="medium">Medium Priority</option>
                                            <option value="high">High Priority</option>
                                        </select>
                                        <div className="flex justify-end gap-2">
                                            <button
                                                type="button"
                                                onClick={() => setShowAddTask(false)}
                                                className="px-4 py-2 text-gray-600 hover:text-gray-800"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type="submit"
                                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                            >
                                                Add Task
                                            </button>
                                        </div>
                                    </form>
                                </motion.div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

export default Tasks;
