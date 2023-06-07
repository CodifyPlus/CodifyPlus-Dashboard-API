const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  username: String,
  email: String,
  password: String,
  phone: String,
  role: String,
  status: String,
  completedServices: [
    {
      serviceId: mongoose.Schema.Types.ObjectId,
      name: String
    }
  ],
  pendingServices: [
    {
      serviceId: mongoose.Schema.Types.ObjectId,
      name: String
    }
  ],
  processServices: [
    {
      serviceId: mongoose.Schema.Types.ObjectId,
      name: String
    }
  ],
  firstName: String,
  lastName: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const User = mongoose.model("User", UserSchema);

module.exports = User;
