import mongoose from 'mongoose'

const accountSchema = new mongoose.Schema({
  id: mongoose.Types.ObjectId,
  balance: {
    type: Number,
    default: 0
  },
  reservedBalance: {
    type: [
      {
        context: String!,
        balance: Number!
      }
    ],
    default: [
      {
        context: 'Default',
        balance: 0
      }
    ],
  },
  virtualBalance: {
    type: Number,
    default: 0
  },
  availableBalance: {
    type: Number,
    default: 0
  }
})

accountSchema.methods.getReservedBalance = function (context: string) {
  // TODO: Implement this function after context variable has value
  const reservedBalances: { context: string; balance: number; }[] = this.reservedBalance
  console.log(context)
  console.log(reservedBalances.find(x => x.context === context))

  return 0
}

accountSchema.methods.getVirtualBalance = function (context: string) {
  // TODO: Implement this function after context variable has value
  const reservedBalances: { context: string; balance: number; }[] = this.reservedBalance
  console.log(context)
  console.log(reservedBalances.find(x => x.context === context))

  return 0
}

export default mongoose.model('Account', accountSchema)
