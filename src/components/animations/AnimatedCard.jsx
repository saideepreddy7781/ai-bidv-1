import { motion } from 'framer-motion';

const AnimatedCard = ({ children, className = '', onClick }) => {
    return (
        <motion.div
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            whileTap={{ scale: 0.98 }}
            className={className}
            onClick={onClick}
        >
            {children}
        </motion.div>
    );
};

export default AnimatedCard;
