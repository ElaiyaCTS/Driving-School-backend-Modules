import mongoose from 'mongoose';

const AttendanceSchema = new mongoose.Schema(
  {
    learner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Learner',
      required: [true, 'Learner is required.'],
    },
    courseType: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: [true, 'Course type is required.'],
    },
    classType: {
      type: String,
      enum: {
        values: ['Theory', 'Practical'],
        message: 'Class type must be either Theory or Practical.',
      },
      required: [true, 'Class type is required.'],
    },
    date: {
      type: Date,
      required: [true, 'Date is required.'],
    },
    checkIn: {
      type: Date,
    },
    checkOut: {
      type: Date,
    },
    descriptions: {
      type: String,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Created by (User) is required.'],
    },
      branchId: {
         type: mongoose.Schema.Types.ObjectId,
         ref: 'Branch',
         default: null, // Optional, can be null if admin is not assigned to a branch
       },
         organizationId: {
             type: mongoose.Schema.Types.ObjectId,
              ref: 'organization',
         },
  },
  { timestamps: true }
);

// ✅ Add index for sorting and lookup performance
AttendanceSchema.index({ createdBy: 1, learner: 1, createdAt: -1 });

const LearnerAttendance = mongoose.model('LearnerAttendance', AttendanceSchema);

export default LearnerAttendance;
