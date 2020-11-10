import mongoose from 'mongoose'

const reservedBalanceSchema = new mongoose.Schema({
  context: String,
  balance: Number
})

const virtualBalanceSchema = new mongoose.Schema({
  context: String,
  balance: Number
})

const accountSchema = new mongoose.Schema({
  id: mongoose.Types.ObjectId,
  balance: {
    type: Number,
    default: 0
  },
  reservedBalance: {
    type: [reservedBalanceSchema],
  },
  virtualBalance: {
    type: [virtualBalanceSchema],
  },
  availableBalance: {
    type: Number,
    default: 0
  }
})

accountSchema.methods.getReservedBalance = function (context: string) {
  // TODO: Implement this function after context variable has value
  const reservedBalances: { context: string; balance: number; }[] = this.reservedBalance

  return reservedBalances.find(x => x.context === context)?.balance ?? 0
}

accountSchema.methods.getVirtualBalance = function (context: string) {
  // TODO: Implement this function after context variable has value
  const virtualBalance: { context: string; balance: number; }[] = this.virtualBalance

  return virtualBalance.find(x => x.context === context)?.balance ?? 0
}

export default mongoose.model('Account', accountSchema)
