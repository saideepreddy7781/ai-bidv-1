import { motion } from 'framer-motion';

const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: {
        opacity: 1,
        y: 0,
        transition: {
            type: "spring",
            stiffness: 100,
            damping: 15
        }
    },
};

const StaggerRow = ({ children, className = '', onClick }) => {
    return (
        <motion.tr
            variants={itemVariants}
            className={className}
            onClick={onClick}
            whileHover={{ backgroundColor: "rgba(248, 250, 252, 0.8)" }} // slate-50 with opacity
            transition={{ duration: 0.1 }}
        >
            {children}
        </motion.tr>
    );
};

export default StaggerRow;
