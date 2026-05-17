'use client';

import { motion } from 'framer-motion';
import { Button } from '@client/components/ui/button';
import Link from 'next/link';
import { Network, Sparkles, Zap, GitBranch } from 'lucide-react';
import { InteractiveDemo } from '@client/components/landing/interactive-demo';

export function HeroSection() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  const features = [
    { icon: Network, text: 'Visual Architecture Mapping' },
    { icon: Sparkles, text: 'AI-Powered Insights' },
    { icon: Zap, text: 'Real-time Dependency Analysis' },
    { icon: GitBranch, text: 'Multi-Repository Support' },
  ];

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-b from-background via-background to-background/50">
      {/* Animated Background Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]" />
      
      {/* Gradient Orbs */}
      <div className="absolute top-1/4 -left-48 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 -right-48 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000" />

      <div className="container relative z-10 px-4 py-20 md:py-32 mx-auto">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid lg:grid-cols-[1.2fr_1fr] gap-12 items-center max-w-7xl mx-auto"
        >
          {/* Left Content */}
          <div className="space-y-8">
            <motion.div variants={itemVariants} className="space-y-4">
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-sm font-medium"
              >
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
                  AI-Powered Architecture Analysis
                </span>
              </motion.div>

              {/* Main Headline */}
              <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
                <span className="block">Google Maps</span>
                <span className="block bg-gradient-to-r from-primary via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                  for Software
                </span>
                <span className="block">Architecture</span>
              </h1>
            </motion.div>

            <motion.p
              variants={itemVariants}
              className="text-xl md:text-2xl text-muted-foreground max-w-2xl leading-relaxed"
            >
              Visualize, analyze, and understand your codebase dependencies with{' '}
              <span className="text-foreground font-semibold">AI-powered insights</span>.
              Navigate complex architectures like never before.
            </motion.p>

            {/* Feature List */}
            <motion.div variants={itemVariants} className="grid sm:grid-cols-2 gap-4">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + index * 0.1, duration: 0.5 }}
                  className="flex items-center gap-3 group"
                >
                  <div className="p-2 rounded-lg bg-primary/10 border border-primary/20 group-hover:bg-primary/20 group-hover:border-primary/40 transition-all duration-300">
                    <feature.icon className="w-4 h-4 text-primary" />
                  </div>
                  <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                    {feature.text}
                  </span>
                </motion.div>
              ))}
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              variants={itemVariants}
              className="flex flex-col sm:flex-row gap-4 pt-4"
            >
              <Link href={process.env.NEXT_PUBLIC_APP_URL || '/app'}>
                <Button
                  size="lg"
                  className="h-14 px-8 text-lg font-semibold relative overflow-hidden group"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    Open Dashboard
                    <Zap className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-primary via-purple-500 to-primary bg-[length:200%_100%] animate-shimmer" />
                </Button>
              </Link>
              <Link
                href={
                  process.env.NEXT_PUBLIC_APP_URL
                    ? `${process.env.NEXT_PUBLIC_APP_URL}/register`
                    : '/register'
                }
              >
                <Button
                  size="lg"
                  variant="outline"
                  className="h-14 px-8 text-lg font-semibold border-2 hover:border-primary/50 hover:bg-primary/5 group"
                >
                  <span className="flex items-center gap-2">
                    Get Started Free
                    <GitBranch className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  </span>
                </Button>
              </Link>
            </motion.div>

            {/* Trust Indicators */}
            <motion.div
              variants={itemVariants}
              className="flex items-center gap-6 pt-4 text-sm text-muted-foreground"
            >
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                <span>Free forever</span>
              </div>
            </motion.div>
          </div>

          {/* Right Interactive Demo */}
          <motion.div
            variants={itemVariants}
            className="relative"
          >
            <InteractiveDemo />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

// Made with Bob
