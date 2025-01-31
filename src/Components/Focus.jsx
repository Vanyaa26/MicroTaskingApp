import React from "react";
import { motion } from "framer-motion";

const Focus = () => {
    return (
        <div className="h-screen dark:bg-gray-800 flex flex-col items-center justify-center">
            <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{
                    duration: 0.8,
                    delay: 0.5,
                    ease: [0, 0.71, 0.2, 1.01]
                }}
                className="text-center"
            >
                <motion.h1 
                    className="text-5xl font-bold mb-8 text-gray-800 dark:text-white"
                    
                    
                >
                    Coming Soon...
                </motion.h1>

                {/* Animated dots */}
                <div className="flex gap-2 justify-center">
                    {[1, 2, 3].map((dot) => (
                        <motion.div
                            key={dot}
                            className="w-4 h-4 bg-blue-500 rounded-full"
                            animate={{
                                y: [0, 8, 0],
                                opacity: [0, 1, 0]
                            }}
                            transition={{
                                duration: 2,
                                repeat: Infinity,
                                delay: dot * 0.2
                            }}
                        />
                    ))}
                </div>

                
                <motion.p
                    className="mt-8 text-gray-600 dark:text-gray-400"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                >
                    We're building something amazing for you!
                </motion.p>
            </motion.div>
        </div>
    );
};

export default Focus;
