// import { model } from 'mongoose';
// import RouteService from '../services/routeService.js';
// import truckService from '../services/truckService.js';
// import routeService from '../services/routeService.js';
// import Driver from '../models/Driver.js';
// import Truck from '../models/Truck.js';

// export const getAllRoutes = async ( req , res)=>{
// try {
// const {status,Driver ,Truck,page =1,limit =10, sort = '-createAt' } =req.query;

// const filter ={} ;
// if (status) filter.status= status;
// if (Driver) filter.Driver= Driver;
// if (Truck) filter.Truck= Truck;

// const options = {
//     page : parseInt(page),
//     limit: parseInt(limit),
//     sort
// }

// const result = await routeService.getAllRoutes(filter);

// res.status(200).json({
//     success : true,
//     count : result.

// }

// )

    
// } catch (error) {
    
// }

// }