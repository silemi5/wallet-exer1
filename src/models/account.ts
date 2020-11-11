import mongoose from 'mongoose'

const contextSchema = new mongoose.Schema({
  name: String,
  reservedBalance: Number,
  virtualBalance: Number
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
