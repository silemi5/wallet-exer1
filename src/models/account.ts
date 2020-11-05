import mongoose from 'mongoose'

const accountSchema = new mongoose.Schema({
  id: mongoose.Types.ObjectId,
  balance: Number,
  reservedBalance: {
    type: Number,
  },
  virtualBalance: {
    type: Number,
  },
  availableBalance: {
    type: Number,
  }
})

export default mongoose.model('Account', accountSchema)
