import mongoose from "mongoose";
import {OrderStatus} from "@smash1986/common";

interface OrderAttrs {
    id: string;
    userId: string;
    status: OrderStatus;
    price: number;
    version: number;
}

interface OrderDoc extends mongoose.Document {
    userId: string;
    status: OrderStatus;
    price: number;
    version: number;
}

interface OrderModel extends mongoose.Model<OrderDoc> {
    build(attrs: OrderAttrs): OrderDoc;
}

const orderSchema = new mongoose.Schema({
        userId: {
            type: String,
            required: true
        },
        status: {
            type: String,
            required: true,
            enum: Object.values(OrderStatus),
            default: OrderStatus.Created,
        },
        price: {
            type: Number,
            required: true,
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


orderSchema.statics.build = (attrs: OrderAttrs) => {
    return new Order({
        _id: attrs.id,
        userId: attrs.userId,
        status: attrs.status,
        price: attrs.price,
        version: attrs.version,
    });
}
const Order = mongoose.model<OrderDoc, OrderModel>('Order', orderSchema);

export {Order, OrderDoc};