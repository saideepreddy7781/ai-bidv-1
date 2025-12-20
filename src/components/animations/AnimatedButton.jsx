import { motion } from 'framer-motion';

const AnimatedButton = ({ children, className = '', onClick, disabled, type = 'button' }) => {
    return (
        <motion.button
            whileHover={!disabled ? { scale: 1.02, boxShadow: "0px 4px 12px rgba(0,0,0,0.1)" } : {}}
            whileTap={!disabled ? { scale: 0.98 } : {}}
            transition={{ duration: 0.2 }}
            className={className}
            onClick={onClick}
            disabled={disabled}
            type={type}
        >
            {children}
        </motion.button>
    );
};

export default AnimatedButton;
