const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    courses: [
      {
        course: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Course',
          required: true,
        },
        price: Number,
        instructor: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
      },
    ],
    totalAmount: {
      type: Number,
      required: true,
    },
    currency: { type: String, default: 'INR' },
    paymentMethod: {
      type: String,
      enum: ['razorpay', 'stripe', 'free'],
      default: 'razorpay',
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded'],
      default: 'pending',
    },
    // Razorpay specific
    razorpay: {
      orderId: String,
      paymentId: String,
      signature: String,
    },
    // Stripe specific
    stripe: {
      sessionId: String,
      paymentIntentId: String,
    },
    invoiceNumber: {
      type: String,
      unique: true,
    },
    paidAt: Date,
  },
  { timestamps: true }
);

// Generate invoice number
orderSchema.pre('save', function (next) {
  if (this.isNew) {
    this.invoiceNumber = 'INV-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
  }
  next();
});

module.exports = mongoose.model('Order', orderSchema);
