import { Schema, model, models } from 'mongoose';

// Interface for TypeScript type safety
interface ICall {
  phoneNumber: string;
  agentId: string;
  name: string;
  status: string;
  createdAt: Date;
}

// Defining the Schema
const CallSchema = new Schema<ICall>({
  phoneNumber: { 
    type: String, 
    required: true,
    trim: true 
  },
  agentId: { 
    type: String, 
    required: true 
  },
  name: { 
    type: String, 
    default: "Abhay Singh" 
  },
  status: { 
    type: String, 
    default: 'success' 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
});

// The 'models.Call' check is CRITICAL for Next.js hot-reloading
const Call = models.Call || model<ICall>('Call', CallSchema);

export default Call;