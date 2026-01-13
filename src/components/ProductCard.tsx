import { motion } from 'framer-motion';
import { ShoppingBag, Star } from 'lucide-react';

interface ProductCardProps {
  name: string;
  price: number;
  image: string;
  rating?: number;
  inStock?: boolean;
  delay?: number;
}

export const ProductCard = ({
  name,
  price,
  image,
  rating = 5,
  inStock = true,
  delay = 0,
}: ProductCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay }}
      whileHover={{ y: -10 }}
      className="group relative"
    >
      {/* Glow Effect */}
      <div className="absolute -inset-1 bg-gradient-to-r from-primary via-secondary to-accent rounded-2xl opacity-0 group-hover:opacity-50 blur-xl transition-all duration-500" />

      {/* Card */}
      <div className="relative glass-card overflow-hidden">
        {/* Image Container */}
        <div className="relative h-40 sm:h-48 md:h-56 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent z-10" />
          <motion.img
            src={image}
            alt={name}
            className="w-full h-full object-cover"
            whileHover={{ scale: 1.1 }}
            transition={{ duration: 0.6 }}
            onError={(e: React.SyntheticEvent<HTMLImageElement>) => (e.currentTarget.style.display = 'none')}
          />

          {/* Stock Badge */}
          <div className="absolute top-4 left-4 z-20">
            <span
              className={`px-3 py-1 rounded-full text-xs font-poppins font-medium ${
                inStock
                  ? "bg-highlight/20 text-highlight border border-highlight/30"
                  : "bg-destructive/20 text-destructive border border-destructive/30"
              }`}
            >
              {inStock ? "En stock" : "Rupture"}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 md:p-6">
          {/* Rating */}
          <div className="flex items-center gap-1 mb-2">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-4 h-4 ${
                  i < rating ? "text-highlight fill-highlight" : "text-muted"
                }`}
              />
            ))}
            <span className="ml-2 text-sm text-muted-foreground font-poppins">
              ({rating}.0)
            </span>
          </div>

          {/* Name */}
          <h3 className="font-fredoka text-lg md:text-xl font-semibold text-foreground mb-2 group-hover:cosmic-gradient-text transition-all duration-300">
            {name}
          </h3>

          {/* Price & Action */}
          <div className="flex items-center justify-between mt-4">
            <span className="font-fredoka text-xl md:text-2xl font-bold chicha-gradient-text">
              {price.toFixed(2)}€
            </span>

            <motion.button
              className="relative p-3 rounded-full overflow-hidden group/btn"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              disabled={!inStock}
            >
              <span className="absolute inset-0 bg-gradient-to-r from-primary to-secondary opacity-100 group-hover/btn:opacity-0 transition-opacity" />
              <span className="absolute inset-0 bg-gradient-to-r from-secondary to-accent opacity-0 group-hover/btn:opacity-100 transition-opacity" />
              <ShoppingBag className="w-5 h-5 text-primary-foreground relative z-10" />
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};