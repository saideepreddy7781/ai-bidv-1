// Professional Landing Page Component
import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Navbar from './Navbar';
import StaggerContainer, { StaggerItem } from '../animations/StaggerContainer';
import AnimatedButton from '../animations/AnimatedButton';

const LandingPage = () => {
    return (
        <div className="min-h-screen bg-slate-50">
            <Navbar />

            {/* Hero Section */}
            <div className="relative overflow-hidden pt-16 pb-32 space-y-24">
                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="lg:grid lg:grid-cols-12 lg:gap-8">
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                            className="sm:text-center md:max-w-2xl md:mx-auto lg:col-span-6 lg:text-left"
                        >
                            <h1>
                                <span className="block text-sm font-semibold uppercase tracking-wide text-primary-600 sm:text-base lg:text-sm xl:text-base">
                                    Next Gen Procurement
                                </span>
                                <span className="mt-1 block text-4xl tracking-tight font-extrabold sm:text-5xl xl:text-6xl text-slate-900">
                                    <span className="block">Intelligent Bid</span>
                                    <span className="block text-primary-900">Evaluation System</span>
                                </span>
                            </h1>
                            <p className="mt-3 text-base text-slate-500 sm:mt-5 sm:text-xl lg:text-lg xl:text-xl">
                                Streamline government procurement with advanced document analysis and AI-driven insights.
                                Automate compliance checks and bid comparisons.
                            </p>
                            <div className="mt-8 sm:max-w-lg sm:mx-auto sm:text-center lg:text-left lg:mx-0">
                                <div className="space-y-4 sm:space-y-0 sm:inline-flex sm:gap-4">
                                    <Link to="/register">
                                        <AnimatedButton className="flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-primary-900 hover:bg-primary-800 sm:px-8">
                                            Get started
                                        </AnimatedButton>
                                    </Link>
                                    <Link to="/login">
                                        <AnimatedButton className="flex items-center justify-center px-5 py-3 border border-slate-300 text-base font-medium rounded-lg shadow-sm text-slate-700 bg-white hover:bg-slate-50 sm:px-8">
                                            Live Demo
                                        </AnimatedButton>
                                    </Link>
                                </div>
                            </div>
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
                            className="mt-12 relative sm:max-w-lg sm:mx-auto lg:mt-0 lg:max-w-none lg:mx-0 lg:col-span-6 lg:flex lg:items-center"
                        >
                            <div className="relative mx-auto w-full rounded-lg shadow-lg lg:max-w-md">
                                <div className="relative block w-full bg-white rounded-lg overflow-hidden focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                                    <div className="w-full bg-slate-100 aspect-w-10 aspect-h-6 flex items-center justify-center p-8">
                                        <motion.span
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            transition={{ type: "spring", stiffness: 200, delay: 0.5 }}
                                            className="text-6xl"
                                        >
                                            🤖
                                        </motion.span>
                                    </div>
                                    <div className="p-6">
                                        <h3 className="text-lg font-bold text-slate-900">AI-Powered Analysis</h3>
                                        <p className="mt-2 text-sm text-slate-500">
                                            Our system automatically processes PDF documents, extracts key information, and evaluates compliance in seconds.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>

            {/* Feature Section */}
            <div className="py-24 bg-white border-t border-slate-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="lg:text-center mb-16">
                        <h2 className="text-basic text-primary-600 font-semibold tracking-wide uppercase">Features</h2>
                        <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-slate-900 sm:text-4xl">
                            A better way to evaluate tenders
                        </p>
                        <p className="mt-4 max-w-2xl text-xl text-slate-500 lg:mx-auto">
                            Our platform provides comprehensive tools for vendors, procurement officers, and evaluators.
                        </p>
                    </div>

                    <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Feature 1 */}
                        <StaggerItem className="relative bg-slate-50 p-8 rounded-2xl border border-slate-200 hover:shadow-md transition-shadow">
                            <div className="absolute top-8 left-8 h-12 w-12 bg-primary-900 rounded-xl flex items-center justify-center text-white text-2xl">
                                📄
                            </div>
                            <div className="mt-16">
                                <h3 className="text-xl font-bold text-slate-900">Document Processing</h3>
                                <p className="mt-4 text-base text-slate-500">
                                    Upload complex bid documents and let our AI parse and structure the data for easy review.
                                </p>
                            </div>
                        </StaggerItem>

                        {/* Feature 2 */}
                        <StaggerItem className="relative bg-slate-50 p-8 rounded-2xl border border-slate-200 hover:shadow-md transition-shadow">
                            <div className="absolute top-8 left-8 h-12 w-12 bg-emerald-600 rounded-xl flex items-center justify-center text-white text-2xl">
                                ✅
                            </div>
                            <div className="mt-16">
                                <h3 className="text-xl font-bold text-slate-900">Compliance Verification</h3>
                                <p className="mt-4 text-base text-slate-500">
                                    Automatically check bids against mandatory requirements to ensure full compliance.
                                </p>
                            </div>
                        </StaggerItem>

                        {/* Feature 3 */}
                        <StaggerItem className="relative bg-slate-50 p-8 rounded-2xl border border-slate-200 hover:shadow-md transition-shadow">
                            <div className="absolute top-8 left-8 h-12 w-12 bg-blue-600 rounded-xl flex items-center justify-center text-white text-2xl">
                                📊
                            </div>
                            <div className="mt-16">
                                <h3 className="text-xl font-bold text-slate-900">Smart Comparison</h3>
                                <p className="mt-4 text-base text-slate-500">
                                    Compare multiple bids side-by-side with intelligent ranking and scoring metrics.
                                </p>
                            </div>
                        </StaggerItem>
                    </StaggerContainer>
                </div>
            </div>

            {/* CTA Section */}
            <div className="bg-primary-900">
                <div className="max-w-2xl mx-auto text-center py-16 px-4 sm:py-20 sm:px-6 lg:px-8">
                    <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
                        <span className="block">Ready to simplify procurement?</span>
                    </h2>
                    <p className="mt-4 text-lg leading-6 text-primary-200">
                        Join government agencies and top vendors using our platform to modernize their bidding process.
                    </p>
                    <div className="mt-8 flex justify-center gap-4">
                        <Link to="/register">
                            <AnimatedButton className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-lg text-primary-900 bg-white hover:bg-slate-50">
                                Sign up for free
                            </AnimatedButton>
                        </Link>
                        <Link to="/login">
                            <AnimatedButton className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-primary-800 hover:bg-primary-700">
                                Log in
                            </AnimatedButton>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <footer className="bg-white border-t border-slate-200">
                <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                    <p className="text-center text-base text-slate-400">
                        &copy; {new Date().getFullYear()} AI Bid Evaluation. All rights reserved.
                    </p>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
