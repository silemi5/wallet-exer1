import mongoose from 'mongoose'

const contextSchema = new mongoose.Schema({
  name: String,
  reservedBalance: {
    type: Number,
    default: 0
  },
  virtualBalance: {
    type: Number,
    default: 0
  }
  },
  { _id: false }
)

const accountSchema = new mongoose.Schema({
  id: mongoose.Types.ObjectId,
  balance: {
    type: Number,
    required: true,
    default: 0
  },
  contexts: {
    type: [contextSchema],
    required: true
  }
})

export default mongoose.model('Account', accountSchema)
