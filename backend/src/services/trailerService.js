import Trailer from '../models/Trailer.js';

class TrailerService {
  async createTrailer(trailerData) {
    const existingTrailer = await Trailer.findOne({ 
      registrationNumber: trailerData.registrationNumber 
    });
    
    if (existingTrailer) {
      throw new Error('Trailer with this registration number already exists');
    }

    const trailer = await Trailer.create(trailerData);
    return trailer;
  }

  async getTrailerById(trailerId) {
    const trailer = await Trailer.findById(trailerId).populate('tires');
    if (!trailer) {
      throw new Error('Trailer not found');
    }
    return trailer;
  }

  async getAllTrailers(filters = {}) {
    const trailers = await Trailer.find(filters);
    return trailers;
  }

  async getTrailersByStatus(status) {
    const trailers = await Trailer.find({ status });
    return trailers;
  }

  async updateTrailer(trailerId, updateData) {
    const trailer = await Trailer.findByIdAndUpdate(
      trailerId,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!trailer) {
      throw new Error('Trailer not found');
    }
    return trailer;
  }

  async deleteTrailer(trailerId) {
    const trailer = await Trailer.findByIdAndDelete(trailerId);
    if (!trailer) {
      throw new Error('Trailer not found');
    }
    return trailer;
  }

  async updateWearPercentage(trailerId, wearPercentage) {
    const trailer = await Trailer.findById(trailerId);
    if (!trailer) {
      throw new Error('Trailer not found');
    }

    trailer.wearPercentage = wearPercentage;
    await trailer.updateStatus();
    
    return trailer;
  }

  async updateKilometers(trailerId, kilometers) {
    const trailer = await Trailer.findById(trailerId);
    if (!trailer) {
      throw new Error('Trailer not found');
    }

    if (kilometers < trailer.currentKilometers) {
      throw new Error('New kilometers cannot be less than current kilometers');
    }

    trailer.currentKilometers = kilometers;
    await trailer.save();
    
    return trailer;
  }
}

export default new TrailerService();
