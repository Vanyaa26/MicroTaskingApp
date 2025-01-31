import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { motion } from 'framer-motion';
import { collection, addDoc, query, where, onSnapshot, deleteDoc, doc, updateDoc } from 'firebase/firestore';

import { HiUserGroup, HiChat, HiPlus, HiX, HiCheck } from 'react-icons/hi';

const CollaborativeTask = ({user}) => {
    const [groupTasks, setGroupTasks] = useState([]);
    const [showAddTask, setShowAddTask] = useState(false);
    const [newGroupTask, setNewGroupTask] = useState({
        title: '',
        description: '',
        members: [''],
        status: 'pending',
        comments: []
    });
    const [currentQuote, setCurrentQuote] = useState('');

    
    const grpQuotes = [
        "Work on Group Projects!",
        "Collaborate with your team!",
        "Share your ideas!",
        "Assign Tasks to your team-mates",
        "Get regular notifications on updates",
    ];

    useEffect(() => {
        setCurrentQuote(grpQuotes[Math.floor(Math.random() * grpQuotes.length)]);
        const interval = setInterval(() => {
            setCurrentQuote(grpQuotes[Math.floor(Math.random() * grpQuotes.length)]);
        }, 4000);
        return () => clearInterval(interval);
    }, []);

    
    useEffect(() => {
        const q = query(
            collection(db, 'groupTasks'),
            where('members', 'array-contains', user.email)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const tasks = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setGroupTasks(tasks);
        });

        return () => unsubscribe();
    }, [user]);

    const addGroupTask = async (e) => {
        e.preventDefault();
        try {
            await addDoc(collection(db, 'groupTasks'), {
                ...newGroupTask,
                createdBy: user.email,
                createdAt: new Date(),
                members: [...newGroupTask.members, user.email]
            });
            setNewGroupTask({
                title: '',
                description: '',
                members: [''],
                status: 'pending',
                comments: []
            });
            setShowAddTask(false);
        } catch (error) {
            console.error("Error adding group task:", error);
        }
    };
    
    

    const addComment = async (taskId, comment) => {
        try {
            const taskRef = doc(db, 'groupTasks', taskId);
            await updateDoc(taskRef, {
                comments: [...groupTasks.find(t => t.id === taskId).comments, {
                    text: comment,
                    author: user.email,
                    timestamp: new Date()
                }]
            });
        } catch (error) {
            console.error("Error adding comment:", error);
        }
    };
    const updateTaskStatus = async (taskId) => {
        try {
            const taskRef = doc(db, 'groupTasks', taskId);
            await updateDoc(taskRef, {
                status: 'completed',
                completedAt: new Date()
            });
        } catch (error) {
            console.error("Error completing task:", error);
        }
    };

    return (
        <div className="min-h-screen dark:bg-gray-800 p-4">
            <div className="max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-4xl font-bold text-white">Collaborative Space</h1>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setShowAddTask(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg"
                    >
                        <HiPlus className="w-5 h-5" />
                        New Group Task
                    </motion.button>
                </div>

                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="text-xl text-gray-300 italic mb-8"
                >
                    {currentQuote}
                </motion.p>

               
                <div className="space-y-4">
                    {groupTasks.map((task) => (
                        <motion.div
                            key={task.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white dark:bg-gray-700 rounded-lg p-6 shadow-lg"
                        >
                            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
                                {task.title}
                            </h3>
                            <p className="text-gray-600 dark:text-gray-300 mb-4">
                                {task.description}
                            </p>
                            
                            {/* Team Members */}
                            <div className="flex items-center gap-2 mb-4">
                                <HiUserGroup className="w-5 h-5 text-blue-500" />
                                <div className="flex flex-wrap gap-2">
                                    {task.members.map((member, index) => (
                                        <span
                                            key={index}
                                            className="px-2 py-1 bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-100 rounded-full text-sm"
                                        >
                                            {member}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <div className="flex justify-between items-center mt-4 pt-4 border-t dark:border-gray-600">
                                <span className={`px-2 py-1 rounded-full text-sm ${
                                    task.status === 'completed' 
                                        ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100'
                                        : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100'
                                }`}>
                                    {task.status === 'completed' ? 'Completed' : 'In Progress'}
                                </span>
                                {task.status !== 'completed' && (
                                    <button
                                        onClick={() => updateTaskStatus(task.id)}
                                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
                                    >
                                        <HiCheck className="w-5 h-5" />
                                        Mark as Complete
                                    </button>
                                )}
                            </div>


                            {/* Comments Section */}
                            <div className="border-t dark:border-gray-600 pt-4 mt-4">
                                <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
                                    Comments
                                </h4>
                                <div className="space-y-2 mb-4">
                                    {task.comments.map((comment, index) => (
                                        <div
                                            key={index}
                                            className="bg-gray-50 dark:bg-gray-800 p-3 rounded"
                                        >
                                            <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400 mb-1">
                                                <span>{comment.author}</span>
                                                <span>{new Date(comment.timestamp?.toDate()).toLocaleString()}</span>
                                            </div>
                                            <p className="text-gray-800 dark:text-gray-200">{comment.text}</p>
                                        </div>
                                    ))}
                                </div>
                                <CommentInput taskId={task.id} onAddComment={addComment} />
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Add Task */}
                {showAddTask && (
                    <AddGroupTaskModal
                        newGroupTask={newGroupTask}
                        setNewGroupTask={setNewGroupTask}
                        onSubmit={addGroupTask}
                        onClose={() => setShowAddTask(false)}
                    />
                )}
            </div>
        </div>
    );
};


const CommentInput = ({ taskId, onAddComment }) => {
    const [comment, setComment] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (comment.trim()) {
            onAddComment(taskId, comment);
            setComment('');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="flex gap-2">
            <input
                type="text"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Add a comment..."
                className="flex-1 px-3 py-2 border dark:border-gray-600 rounded-lg dark:bg-gray-800 dark:text-white"
            />
            <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
                Send
            </button>
        </form>
    );
};


const AddGroupTaskModal = ({ newGroupTask, setNewGroupTask, onSubmit, onClose }) => {
    const addMemberField = () => {
        setNewGroupTask({
            ...newGroupTask,
            members: [...newGroupTask.members, '']
        });
    };
    
    const removeMemberField = (index) => {
        const newMembers = newGroupTask.members.filter((_, i) => i !== index);
        setNewGroupTask({
            ...newGroupTask,
            members: newMembers
        });
    };

    const updateMember = (index, value) => {
        const newMembers = [...newGroupTask.members];
        newMembers[index] = value;
        setNewGroupTask({
            ...newGroupTask,
            members: newMembers
        });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md">
                <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">
                    Create Group Task
                </h2>
                <form onSubmit={onSubmit} className="space-y-4">
                    <input
                        type="text"
                        value={newGroupTask.title}
                        onChange={(e) => setNewGroupTask({...newGroupTask, title: e.target.value})}
                        placeholder="Task Title"
                        className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        required
                    />
                    <textarea
                        value={newGroupTask.description}
                        onChange={(e) => setNewGroupTask({...newGroupTask, description: e.target.value})}
                        placeholder="Task Description"
                        className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        rows="3"
                    />
                    
                    
                   
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Team Members (Email)
                        </label>
                        {newGroupTask.members.map((member, index) => (
                            <div key={index} className="flex gap-2">
                                <input
                                    type="email"
                                    value={member}
                                    onChange={(e) => updateMember(index, e.target.value)}
                                    placeholder="member@example.com"
                                    className="flex-1 p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                />
                                <button
                                    type="button"
                                    onClick={() => removeMemberField(index)}
                                    className="p-2 text-red-500 hover:text-red-700"
                                >
                                    <HiX className="w-5 h-5" />
                                </button>
                            </div>
                        ))}
                        <button
                            type="button"
                            onClick={addMemberField}
                            className="text-blue-600 hover:text-blue-700 text-sm flex items-center gap-1"
                        >
                            <HiPlus className="w-4 h-4" /> Add Member
                        </button>
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-gray-600 hover:text-gray-800"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                            Create Task
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CollaborativeTask;
