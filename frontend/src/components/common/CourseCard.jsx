import { Link } from 'react-router-dom';
import { Star, Users, Clock, Heart } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/AppContext';
import { wishlistService } from '../../services/api';
import toast from 'react-hot-toast';
import { useState } from 'react';

export function StarRating({ rating, count, size = 'sm' }) {
  const stars = Array.from({ length: 5 }, (_, i) => i + 1);
  return (
    <div className="flex items-center gap-1">
      <span className={`font-bold ${size === 'sm' ? 'text-sm' : 'text-base'} text-amber-500`}>{rating?.toFixed(1)}</span>
      <div className="flex">
        {stars.map(star => (
          <Star
            key={star}
            size={size === 'sm' ? 12 : 15}
            className={star <= Math.round(rating) ? 'text-amber-400 fill-amber-400' : 'text-slate-300 fill-slate-300'}
          />
        ))}
      </div>
      {count !== undefined && (
        <span className={`text-slate-500 ${size === 'sm' ? 'text-xs' : 'text-sm'}`}>({count?.toLocaleString()})</span>
      )}
    </div>
  );
}

export default function CourseCard({ course, compact = false }) {
  const { isAuthenticated } = useAuth();
  const { addToCart, isInCart } = useCart();
  const [wishlisted, setWishlisted] = useState(false);

  const handleAddToCart = (e) => {
    e.preventDefault();
    const added = addToCart(course);
    if (added) toast.success('Added to cart!');
    else toast('Already in cart', { icon: '🛒' });
  };

  const handleWishlist = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) { toast.error('Please login to add to wishlist'); return; }
    try {
      const res = await wishlistService.toggle(course._id);
      setWishlisted(res.data.inWishlist);
      toast.success(res.data.message);
    } catch { toast.error('Failed to update wishlist'); }
  };

  const price = course.discountPrice || course.price;
  const hasDiscount = course.discountPrice && course.discountPrice < course.price;

  if (compact) {
    return (
      <Link to={`/courses/${course._id}`} className="flex gap-3 group">
        <img
          src={course.thumbnail?.url}
          alt={course.title}
          className="w-24 h-16 object-cover rounded-lg flex-shrink-0"
        />
        <div className="min-w-0">
          <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 line-clamp-2 group-hover:text-primary-600 transition-colors">{course.title}</p>
          <p className="text-xs text-slate-500 mt-1">{course.instructor?.name}</p>
          <p className="text-sm font-bold text-primary-600 mt-1">₹{price?.toLocaleString()}</p>
        </div>
      </Link>
    );
  }

  return (
    <Link to={`/courses/${course._id}`} className="course-card group block">
      {/* Thumbnail */}
      <div className="relative overflow-hidden">
        <img
          src={course.thumbnail?.url || 'https://via.placeholder.com/400x225?text=Course'}
          alt={course.title}
          className="w-full aspect-video object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        
        {course.isBestseller && (
          <span className="absolute top-2 left-2 badge bg-amber-400 text-amber-900">⭐ Bestseller</span>
        )}
        {hasDiscount && (
          <span className="absolute top-2 right-2 badge bg-red-500 text-white">
            {Math.round(((course.price - course.discountPrice) / course.price) * 100)}% OFF
          </span>
        )}

        <button
          onClick={handleWishlist}
          className="absolute bottom-2 right-2 w-8 h-8 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-all hover:scale-110"
        >
          <Heart size={15} className={wishlisted ? 'text-red-500 fill-red-500' : 'text-slate-500'} />
        </button>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="badge bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-xs">{course.category}</span>
          <span className="badge bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs">{course.level}</span>
        </div>

        <h3 className="font-semibold text-slate-800 dark:text-slate-100 line-clamp-2 text-sm leading-snug mb-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
          {course.title}
        </h3>

        <p className="text-xs text-slate-500 dark:text-slate-400 mb-3 truncate">
          by {course.instructor?.name}
        </p>

        <StarRating rating={course.ratings?.average} count={course.ratings?.count} />

        <div className="flex items-center gap-3 mt-2 text-xs text-slate-500 dark:text-slate-400">
          <span className="flex items-center gap-1">
            <Users size={12} /> {course.enrollmentCount?.toLocaleString()} students
          </span>
          <span className="flex items-center gap-1">
            <Clock size={12} /> {course.totalLectures} lectures
          </span>
        </div>

        <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100 dark:border-slate-700">
          <div>
            <span className="text-lg font-bold text-slate-900 dark:text-white">
              ₹{price?.toLocaleString()}
            </span>
            {hasDiscount && (
              <span className="text-sm text-slate-400 line-through ml-2">₹{course.price?.toLocaleString()}</span>
            )}
          </div>
          <button
            onClick={handleAddToCart}
            className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-all ${
              isInCart(course._id)
                ? 'bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                : 'bg-primary-600 hover:bg-primary-700 text-white'
            }`}
          >
            {isInCart(course._id) ? '✓ In Cart' : 'Add to Cart'}
          </button>
        </div>
      </div>
    </Link>
  );
}
