import mongoose from "mongoose";

interface PaymentAttrs {
    orderId: string;
    stripeId: string;
    paymentDate: Date;
}

interface PaymentDoc extends mongoose.Document {
    orderId: string;
    stripeId: string;
    paymentDate: Date;
}

interface PaymentModel extends mongoose.Model<PaymentDoc> {
    build(attrs: PaymentAttrs): PaymentDoc;
}

const orderSchema = new mongoose.Schema({
        orderId: {
            type: String,
            required: true,
            unique: true,
        },
        stripeId: {
            type: String,
            required: true
        },
        paymentDate: {
            type: Date,
            required: true
        },
    },
    {
        toJSON: {
            transform(doc, ret) {
                ret.id = ret._id;
                delete ret._id;
            },
        }
    }
);

const versionKey = 'version';
orderSchema.set('versionKey', versionKey);
orderSchema.pre('save', async function (done) {
    if (versionKey in this) {
        this.$where = {
            ...this.$where,
            [versionKey]: this[versionKey]
        };
        this.increment();
    }
    done();
})


orderSchema.statics.build = (attrs: PaymentAttrs) => {
    return new Payment(attrs);
}
const Payment = mongoose.model<PaymentDoc, PaymentModel>('Payment', orderSchema);

export {Payment, PaymentDoc};