'use client';

import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@client/components/ui/tabs';
import { Card } from '@client/components/ui/card';
import { Network, Brain, Activity, Code2, GitBranch, Zap } from 'lucide-react';

export function FeaturesSection() {
  const features = [
    {
      id: 'visualize',
      label: 'Visualize',
      icon: Network,
      title: 'Interactive Architecture Maps',
      description: 'Navigate your codebase like Google Maps. See the big picture and drill down into details with our interactive visualization.',
      highlights: [
        'Real-time dependency graphs',
        'Multi-level zoom and navigation',
        'Custom filtering and search',
        'Export and share visualizations',
      ],
      code: `// Scan your repository
aga scan ./my-project

// Generate interactive map
aga visualize --interactive

// Export as image
aga export --format png`,
    },
    {
      id: 'analyze',
      label: 'Analyze',
      icon: Brain,
      title: 'AI-Powered Insights',
      description: 'Let AI analyze your architecture and provide actionable recommendations for improvements and potential issues.',
      highlights: [
        'Circular dependency detection',
        'Code smell identification',
        'Architecture pattern recognition',
        'Impact analysis for changes',
      ],
      code: `// Run AI analysis
aga analyze --ai

// Check for issues
aga check --severity high

// Get recommendations
aga suggest --optimize`,
    },
    {
      id: 'track',
      label: 'Track',
      icon: Activity,
      title: 'Real-time Monitoring',
      description: 'Track changes in your architecture over time. Get notified when dependencies change or new patterns emerge.',
      highlights: [
        'Continuous monitoring',
        'Change notifications',
        'Historical comparisons',
        'Team collaboration',
      ],
      code: `// Watch for changes
aga watch --notify

// Compare versions
aga diff v1.0.0 v2.0.0

// Generate reports
aga report --weekly`,
    },
  ];

  return (
    <section className="relative py-24 md:py-32 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/5 to-background" />
      
      <div className="container relative z-10 px-4 mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16 max-w-4xl mx-auto"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Everything You Need to{' '}
            <span className="bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
              Master Your Architecture
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Powerful tools designed for developers who care about code quality and maintainability
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="max-w-6xl mx-auto"
        >
          <Tabs defaultValue="visualize" className="w-full">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-3 mb-12">
              {features.map((feature) => {
                const Icon = feature.icon;
                return (
                  <TabsTrigger key={feature.id} value={feature.id} className="gap-2">
                    <Icon className="w-4 h-4" />
                    <span className="hidden sm:inline">{feature.label}</span>
                  </TabsTrigger>
                );
              })}
            </TabsList>

            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <TabsContent key={feature.id} value={feature.id}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                  >
                    <Card className="p-8 md:p-12 border-2">
                      <div className="grid lg:grid-cols-2 gap-12 items-center">
                        {/* Left: Content */}
                        <div className="space-y-6">
                          <div className="inline-flex p-3 rounded-xl bg-primary/10 border border-primary/20">
                            <Icon className="w-8 h-8 text-primary" />
                          </div>
                          
                          <div>
                            <h3 className="text-3xl font-bold mb-3">{feature.title}</h3>
                            <p className="text-lg text-muted-foreground">{feature.description}</p>
                          </div>

                          <ul className="space-y-3">
                            {feature.highlights.map((highlight, idx) => (
                              <motion.li
                                key={idx}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                className="flex items-center gap-3"
                              >
                                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                                <span className="text-foreground">{highlight}</span>
                              </motion.li>
                            ))}
                          </ul>
                        </div>

                        {/* Right: Code Preview */}
                        <div className="relative">
                          <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 to-purple-500/20 rounded-2xl blur-2xl" />
                          <div className="relative rounded-xl border border-border bg-card/50 backdrop-blur-sm overflow-hidden">
                            {/* Terminal Header */}
                            <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-muted/50">
                              <div className="flex gap-1.5">
                                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                                <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                                <div className="w-3 h-3 rounded-full bg-green-500/80" />
                              </div>
                              <span className="text-xs text-muted-foreground font-mono ml-2">
                                terminal
                              </span>
                            </div>
                            
                            {/* Code Content */}
                            <div className="p-6 font-mono text-sm">
                              <pre className="text-foreground/90">
                                <code>{feature.code}</code>
                              </pre>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                </TabsContent>
              );
            })}
          </Tabs>
        </motion.div>

        {/* Feature Cards Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="grid md:grid-cols-3 gap-6 mt-16 max-w-6xl mx-auto"
        >
          {[
            {
              icon: Code2,
              title: 'Multi-Language Support',
              description: 'Works with TypeScript, JavaScript, Python, and more',
            },
            {
              icon: GitBranch,
              title: 'Git Integration',
              description: 'Seamlessly integrates with your Git workflow',
            },
            {
              icon: Zap,
              title: 'Lightning Fast',
              description: 'Analyze thousands of files in seconds',
            },
          ].map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5 }}
              >
                <Card className="p-6 h-full border-2 hover:border-primary/50 transition-all duration-300 group">
                  <div className="p-3 rounded-lg bg-primary/10 border border-primary/20 w-fit mb-4 group-hover:bg-primary/20 transition-colors">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                  <p className="text-muted-foreground">{item.description}</p>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}

// Made with Bob
