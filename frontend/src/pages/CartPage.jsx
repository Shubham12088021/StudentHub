import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { paymentService } from '../services/api';
import { Trash2, ShoppingCart, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { useState } from 'react';

export default function CartPage() {
  const { cart, removeFromCart, clearCart, cartTotal } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    if (!isAuthenticated) { navigate('/login'); return; }
    if (cart.length === 0) return;

    setLoading(true);
    try {
      const courseIds = cart.map(c => c._id);

      // Check for free courses
      const allFree = cart.every(c => c.price === 0 || c.discountPrice === 0);

      if (allFree && cart.length === 1) {
        await paymentService.enrollFree(cart[0]._id);
        clearCart();
        toast.success('Enrolled successfully! 🎉');
        navigate('/student/my-courses');
        return;
      }

      const res = await paymentService.createOrder(courseIds);
      const { razorpayOrderId, amount, orderId, key } = res.data;

      // Load Razorpay
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => {
        const options = {
          key,
          amount,
          currency: 'INR',
          name: 'StudentHub',
          description: `Purchase ${cart.length} course(s)`,
          order_id: razorpayOrderId,
          handler: async (response) => {
            console.log("RAZORPAY RESPONSE:", response);

            try {
              const verifyRes = await paymentService.verify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                orderId,
              });

              console.log("VERIFY RESPONSE:", verifyRes.data);

              if (verifyRes.data.success) {
                clearCart();

                toast.success(
                  "Payment successful! Courses unlocked 🎉"
                );

                navigate("/student/my-courses");
              } else {
                toast.error("Payment verification failed");
              }

            } catch (err) {
              console.log("===== VERIFY ERROR =====");

              console.log(err);

              console.log("ERROR RESPONSE:");
              console.log(err.response);

              console.log("ERROR DATA:");
              console.log(err.response?.data);

              toast.error(
                err.response?.data?.message ||
                err.message ||
                "Payment verification failed"
              );

              setLoading(false);
            }
          },
          prefill: {},
          theme: { color: '#0ea5e9' },
          modal: { ondismiss: () => setLoading(false) },
        };
        const rzp = new window.Razorpay(options);
        rzp.open();
      };
      document.body.appendChild(script);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Checkout failed');
      setLoading(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="text-7xl mb-5">🛒</div>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-3">Your cart is empty</h2>
        <p className="text-slate-500 mb-7">Add some courses to get started on your learning journey.</p>
        <Link to="/courses" className="btn-primary inline-flex items-center gap-2">
          Browse Courses <ArrowRight size={16} />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="section-title mb-8">Shopping Cart <span className="text-slate-400 text-xl font-normal">({cart.length} item{cart.length > 1 ? 's' : ''})</span></h1>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Cart Items */}
        <div className="flex-1 space-y-4">
          {cart.map(course => (
            <div key={course._id} className="card p-5 flex gap-4 group">
              <img
                src={course.thumbnail?.url || 'https://via.placeholder.com/120x68'}
                alt={course.title}
                className="w-28 h-16 object-cover rounded-lg flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <Link to={`/courses/${course._id}`} className="font-semibold text-slate-800 dark:text-slate-100 hover:text-primary-600 transition-colors line-clamp-2 text-sm">
                  {course.title}
                </Link>
                <p className="text-xs text-slate-500 mt-1">by {course.instructor?.name}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="font-bold text-slate-900 dark:text-white">
                    ₹{(course.discountPrice || course.price)?.toLocaleString()}
                  </span>
                  {course.discountPrice && course.discountPrice < course.price && (
                    <span className="text-sm text-slate-400 line-through">₹{course.price?.toLocaleString()}</span>
                  )}
                </div>
              </div>
              <button
                onClick={() => { removeFromCart(course._id); toast.success('Removed from cart'); }}
                className="text-slate-400 hover:text-red-500 transition-colors p-1 self-start"
              >
                <Trash2 size={17} />
              </button>
            </div>
          ))}

          <button
            onClick={() => { clearCart(); toast.success('Cart cleared'); }}
            className="text-sm text-red-500 hover:underline"
          >
            Clear cart
          </button>
        </div>

        {/* Order Summary */}
        <div className="w-full lg:w-80 flex-shrink-0">
          <div className="card p-6 sticky top-24">
            <h3 className="font-bold text-slate-800 dark:text-slate-100 text-lg mb-5">Order Summary</h3>

            <div className="space-y-3 mb-5 border-b border-slate-100 dark:border-slate-700 pb-5">
              {cart.map(c => (
                <div key={c._id} className="flex justify-between text-sm">
                  <span className="text-slate-600 dark:text-slate-400 truncate max-w-[200px]">{c.title}</span>
                  <span className="font-medium text-slate-800 dark:text-slate-100 ml-3">₹{(c.discountPrice || c.price)?.toLocaleString()}</span>
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center mb-6">
              <span className="font-bold text-slate-800 dark:text-slate-100">Total</span>
              <span className="text-2xl font-bold text-primary-600">₹{cartTotal?.toLocaleString()}</span>
            </div>

            <button
              onClick={handleCheckout}
              disabled={loading}
              className="btn-primary w-full py-3 flex items-center justify-center gap-2 text-base"
            >
              {loading
                ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Processing...</>
                : <><ShoppingCart size={18} />Proceed to Checkout</>}
            </button>

            <p className="text-xs text-center text-slate-400 mt-3">🔒 Secure checkout via Razorpay</p>
            <p className="text-xs text-center text-slate-400 mt-1">30-Day Money-Back Guarantee</p>
          </div>
        </div>
      </div>
    </div>
  );
}
