const mongoose = require("mongoose");

const User = mongoose.model(
  "User",
  new mongoose.Schema(
    {
      username : {
      type: String,
      required:true,
      maxlength: [15, 'Username cannot exceed 15 characters'],
    },
    
      email: {
        type: String,
        required: true,
        unique: true, // Ensure email is unique
        lowercase: true, // Normalize email to lowercase
        trim: true, // Remove extra spaces
        match: [/^[a-zA-Z0-9._%+-]+@janaagraha\.org$/, 'Email must be a valid Gmail address'],
      },
      password: {
        type: String,
        required: true
      },

      department: {
        type: String,
        required: true,
        enum: ['IT', 'TECH', 'ACCOUNTS', 'COMMUNICATION', 'HR', 'DNI']
      },
      
      roles: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Role"
        }
      ]
    },
    { timestamps: true } // Optional: Automatically adds createdAt and updatedAt fields
  )
);

module.exports = User;
