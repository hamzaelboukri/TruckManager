import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema(
    {
        route: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Route'
        },
        reportType: {
            type: String,
            enum: ['FuelConsumption', 'Mileage', 'PerformanceDriver'],
            required: [true, 'Report type is required']
        },
        description: {
            type: String,
            required: [true, 'Description is required'],
            trim: true
        },
        fromDate: {
            type: Date,
            required: [true, 'From date is required']
        },
        toDate: {
            type: Date,
            required: [true, 'To date is required']
        }
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
);

reportSchema.index({ route: 1 });
reportSchema.index({ reportType: 1 });
reportSchema.index({ fromDate: 1, toDate: 1 });

reportSchema.pre('save', function (next) {
    if (this.toDate <= this.fromDate) {
        return next(new Error('To date must be after from date'));
    }
    next();
});

reportSchema.methods.generateReport = async function () {
    await this.populate('route');

    const reportData = {
        reportId: this._id,
        type: this.reportType,
        period: {
            from: this.fromDate,
            to: this.toDate
        },
        route: this.route,
        description: this.description,
        generatedAt: new Date()
    };

    return reportData;
};

export default mongoose.model('Report', reportSchema);
