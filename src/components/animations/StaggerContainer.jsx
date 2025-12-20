import { motion } from 'framer-motion';

const containerVariants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.1
        },
    },
};

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

const StaggerContainer = ({ children, className = '', as = 'div' }) => {
    const Component = motion[as] || motion.div;
    return (
        <Component
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className={className}
        >
            {children}
        </Component>
    );
};

export const StaggerItem = ({ children, className = '' }) => {
    return (
        <motion.div variants={itemVariants} className={className}>
            {children}
        </motion.div>
    );
};

export const StaggerLi = ({ children, className = '' }) => {
    return (
        <motion.li variants={itemVariants} className={className}>
            {children}
        </motion.li>
    );
};

export default StaggerContainer;
