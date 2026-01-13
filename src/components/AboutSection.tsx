'use client';

import { motion } from "framer-motion";
import { Heart, Leaf, Sparkles, Award, Cigarette } from "lucide-react";

const features = [
  {
    icon: Heart,
    title: "Fait avec passion",
    description: "Chaque chicha est assemblée artisanalement avec amour et précision",
  },
  {
    icon: Leaf,
    title: "Saveurs naturelles",
    description: "Nous utilisons uniquement des tabacs et arômes de qualité premium",
  },
  {
    icon: Award,
    title: "Excellence reconnue",
    description: "Récompensés par les plus grands concours de chicha en France",
  },
];

export const AboutSection = () => {
  return (
    <section id="apropos" className="relative py-24 md:py-32 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-accent/10 blur-3xl" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-primary/10 blur-3xl" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted/50 border border-accent/30 mb-6">
              <Sparkles className="w-4 h-4 text-accent" />
              <span className="text-sm font-poppins text-muted-foreground">
                Notre histoire
              </span>
            </div>

            <h2 className="font-fredoka text-4xl md:text-5xl font-bold mb-6">
              <span className="text-foreground">Une passion</span>
              <br />
              <span className="cosmic-gradient-text">née des étoiles</span>
            </h2>

            <p className="font-poppins text-lg text-muted-foreground mb-8 leading-relaxed">
              Depuis 2020, shopuff crée des expériences de chicha uniques inspirées
              de l'univers. Notre vision ? Transformer chaque session en un
              voyage interstellaire, où les saveurs cosmiques rencontrent l'art
              traditionnel de la chicha française.
            </p>

            <div className="space-y-6">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="flex items-start gap-4"
                >
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center border border-primary/20">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-fredoka text-lg font-semibold text-foreground mb-1">
                      {feature.title}
                    </h3>
                    <p className="font-poppins text-muted-foreground">
                      {feature.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Visual */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <div className="relative aspect-square max-w-md mx-auto">
              {/* Decorative rings */}
              <div className="absolute inset-0 rounded-full border-2 border-primary/20 animate-spin" style={{ animationDuration: "20s" }} />
              <div className="absolute inset-8 rounded-full border-2 border-secondary/20 animate-spin" style={{ animationDuration: "15s", animationDirection: "reverse" }} />
              <div className="absolute inset-16 rounded-full border-2 border-accent/20 animate-spin" style={{ animationDuration: "25s" }} />

              {/* Center content */}
              <div className="absolute inset-20 glass-card rounded-full flex items-center justify-center">
                <div className="text-center">
                  <motion.div
                    className="font-fredoka text-6xl md:text-7xl font-bold cosmic-gradient-text mb-2"
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 3, repeat: Infinity }}
                  >
                    4+
                  </motion.div>
                  <p className="font-poppins text-muted-foreground">
                    années d'excellence
                  </p>
                </div>
              </div>

              {/* Floating elements */}
              <motion.div
                className="absolute top-10 right-10 w-16 h-16 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center"
                animate={{ y: [-5, 5, -5] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                <span className="font-fredoka text-primary-foreground font-bold">100+</span>
              </motion.div>
              <motion.div
                className="absolute bottom-10 left-10 w-14 h-14 rounded-full bg-gradient-to-br from-accent to-highlight flex items-center justify-center"
                animate={{ y: [5, -5, 5] }}
                transition={{ duration: 4, repeat: Infinity }}
              >
                <Award className="w-6 h-6 text-accent-foreground" />
              </motion.div>
              <motion.div
                className="absolute top-1/2 left-5 w-12 h-12 rounded-full bg-gradient-to-br from-secondary to-primary flex items-center justify-center"
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 8, repeat: Infinity }}
              >
                <Cigarette className="w-5 h-5 text-secondary-foreground" />
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};