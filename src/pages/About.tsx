import { Layout } from "@/components/layout/Layout";
import { Logo } from "@/components/layout/Logo";
import { Wand2, Shield, Zap, Target, PenTool, CheckCircle2, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 80, damping: 15 } }
};

export default function About() {
  const features = [
    { icon: Wand2, title: "Multi-Pass Engine", desc: "Our 3-pass humanization process includes semantic rewriting, structural disruption, and human tone polishing for maximum effectiveness.", span: "col-span-1 md:col-span-2 lg:col-span-1" },
    { icon: Target, title: "Smart Optimization", desc: "Automatic humanization that keeps refining until your text scores below the AI detection threshold.", span: "col-span-1 lg:col-span-1" },
    { icon: Shield, title: "Structure Preservation", desc: "We maintain your original paragraph structure, never merging or splitting paragraphs while rewriting content.", span: "col-span-1 lg:col-span-1" },
    { icon: Zap, title: "PL AI Detector", desc: "Built-in AI detection with sentence-level analysis to help you understand and improve your content.", span: "col-span-1 md:col-span-2 lg:col-span-1" },
  ];

  const steps = [
    { num: 1, title: "Semantic Rewrite", desc: "Changes vocabulary and phrasing to break direct paraphrasing patterns and linear word-by-word similarity.", icon: PenTool },
    { num: 2, title: "Structural Disruption", desc: "Reorders sentence fragments and clauses within paragraphs, adjusting flow to avoid AI token patterns.", icon: Wand2 },
    { num: 3, title: "Human Tone Polish", desc: "Adds human rhythm, natural transitions, contractions, and removes overly formal or academic tones.", icon: CheckCircle2 },
  ];

  return (
    <Layout>
      <div className="relative min-h-screen py-8 md:py-20 overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 pointer-events-none z-0">
          <div className="absolute top-[10%] left-[20%] w-[500px] h-[500px] rounded-full bg-primary/10 blur-[120px] mix-blend-screen animate-pulse-subtle" />
          <div className="absolute bottom-[20%] right-[10%] w-[600px] h-[600px] rounded-full bg-accent/10 blur-[150px] mix-blend-screen animate-pulse-subtle" style={{ animationDelay: "2s" }} />
        </div>

        <div className="container relative z-10 max-w-6xl mx-auto px-4">
          {/* Hero Section */}
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="text-center mb-16 md:mb-24 relative"
          >
            <motion.div variants={itemVariants} className="flex justify-center mb-8 relative">
              <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full scale-150 -z-10" />
              <Logo size="lg" showSubtitle />
            </motion.div>
            
            <motion.h1 variants={itemVariants} className="text-3xl md:text-4xl lg:text-6xl font-extrabold tracking-tight text-foreground mb-6">
              Redefining <span className="gradient-primary-text">AI Content</span>
            </motion.h1>
            
            <motion.p variants={itemVariants} className="text-base md:text-lg lg:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              A powerful suite of AI text transformation tools designed to help you create natural, human-like content from AI-generated text seamlessly and effortlessly.
            </motion.p>
          </motion.div>

          {/* Mission Section */}
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="bg-card/40 backdrop-blur-2xl rounded-[2.5rem] border border-white/10 dark:border-white/5 p-8 md:p-14 shadow-card-lg mb-24 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[80px]" />
            <div className="max-w-3xl relative z-10">
              <h2 className="text-3xl font-bold text-foreground mb-6 flex items-center gap-3">
                <Target className="h-8 w-8 text-primary" /> Our Mission
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                At PL Humanize, we believe that AI-assisted writing should sound natural and authentic. Our mission is to bridge the gap between AI-generated content and human-like writing, providing tools that transform robotic prose into engaging, genuine text.
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Our advanced multi-pass humanization engine uses sophisticated natural language processing techniques to preserve your original meaning while eliminating the telltale signs of AI-generated content.
              </p>
            </div>
          </motion.div>

          {/* Features Grid (Bento Box) */}
          <div className="mb-32">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                What Makes Us Different
              </h2>
              <p className="text-muted-foreground text-lg">Industry-leading features to elevate your writing.</p>
            </motion.div>
            
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              {features.map((f, i) => (
                <motion.div 
                  key={i} 
                  variants={itemVariants}
                  whileHover={{ y: -8, scale: 1.01 }}
                  className={cn(
                    "p-8 rounded-[2rem] bg-card/40 backdrop-blur-xl border border-white/10 shadow-card transition-all group overflow-hidden relative",
                    f.span
                  )}
                >
                  <div className="absolute -inset-24 bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-2xl" />
                  <div className="relative z-10">
                    <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500 shadow-inner">
                      <f.icon className="h-7 w-7 text-primary" />
                    </div>
                    <h3 className="text-2xl font-bold text-foreground mb-4">{f.title}</h3>
                    <p className="text-muted-foreground leading-relaxed text-lg">{f.desc}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* How It Works - Connected Timeline */}
          <div className="max-w-4xl mx-auto">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Our 3-Pass System
              </h2>
              <p className="text-muted-foreground text-lg">How we transform your content under the hood.</p>
            </motion.div>

            <div className="relative space-y-8 md:space-y-0 before:absolute before:inset-0 before:ml-[28px] md:before:mx-auto md:before:translate-x-0 before:h-full before:w-1 before:bg-gradient-to-b before:from-primary/50 before:via-accent/30 before:to-transparent">
              {steps.map((step, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, x: i % 2 === 0 ? -50 : 50, y: 20 }}
                  whileInView={{ opacity: 1, x: 0, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ type: "spring", stiffness: 70, damping: 15, delay: i * 0.2 }}
                  className={cn(
                    "relative flex items-center justify-between md:justify-normal group md:pb-16 last:pb-0",
                    i % 2 === 0 ? "md:flex-row-reverse" : ""
                  )}
                >
                  {/* Connector line dot */}
                  <div className="absolute left-[28px] md:left-1/2 -translate-x-1/2 w-5 h-5 rounded-full bg-primary ring-4 ring-background z-10 shadow-[0_0_20px_hsl(var(--primary))] group-hover:scale-125 transition-transform" />
                  
                  <div className={cn("ml-16 md:ml-0 md:w-[calc(50%-3rem)]", i % 2 === 0 ? "md:mr-auto md:pr-8" : "md:ml-auto md:pl-8")}>
                    <div className="p-8 rounded-[2rem] bg-card/60 backdrop-blur-xl border border-white/10 shadow-card hover:shadow-card-lg transition-all relative overflow-hidden">
                      <div className="absolute right-0 top-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                      <div className="flex items-center gap-5 mb-4 relative z-10">
                        <div className="w-14 h-14 rounded-2xl gradient-primary text-white font-black text-xl flex items-center justify-center shrink-0 shadow-lg">
                          {step.num}
                        </div>
                        <h3 className="text-2xl font-bold text-foreground">{step.title}</h3>
                      </div>
                      <p className="text-muted-foreground leading-relaxed pl-[76px] text-lg">
                        {step.desc}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
