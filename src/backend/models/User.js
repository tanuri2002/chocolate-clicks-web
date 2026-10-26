const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, "Please provide a name"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Please provide an email"],
      unique: true,
      lowercase: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Please provide a valid email",
      ],
    },
    password: {
      type: String,
      required: function () {
        return !this.googleId;
      },
      minlength: 6,
      select: false, // Password won't be returned by default
    },
    googleId: {
      type: String,
      unique: true,
      sparse: true,
    },
    authProvider: {
      type: String,
      enum: ["local", "google"],
      default: "local",
    },
    avatar: {
      type: String,
      default: "",
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    role: {
      type: String,
      enum: ["customer", "admin"],
      default: "customer",
    },
    phoneNo: {
      type: Number,
    },
    address: {
      type: String,
      default: "",
    },
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    passwordChangedAt: Date,
    createdAt: {
      type: Date,
      default: Date.now,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    isSeeded: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre("save", async function () {
  if (!this.isModified("password") || !this.password) {
    return;
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Method to compare passwords
userSchema.methods.matchPassword = async function (enteredPassword) {
  if (!this.password) {
    return false;
  }
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
