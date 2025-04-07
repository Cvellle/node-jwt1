import mongoose, { Document, Schema } from "mongoose";

interface IUser extends Document {
  // name: string;
  email: string;
  password: string;
  roles:any;
  refreshToken:any
}

const UserSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    roles: {
      User: {
        type: Number,
        default: 2001,
      },
      Editor: Number,
      Admin: Number,
    },
    password: {
      type: String,
      required: true,
    },
    refreshToken: String,
  },
  { timestamps: true }
);

// module.exports = mongoose.model('User', userSchema);
// const UserSchema: Schema = new Schema(
//   {
//     // name: { type: String, required: true },
//     email: { type: String, required: true, unique: true },
//     password: { type: String, required: true },
//   },
//   { timestamps: true }
// );

export default mongoose.model<IUser>('User', UserSchema);
