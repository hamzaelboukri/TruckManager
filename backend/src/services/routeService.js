import { run } from "jest";
import { updateProfile } from "../controllers/authController";
import { updateTruckStatus } from "../controllers/truckController";
import Route from "../models/Route";
import Route from "../models/Route";
import Route from "../models/Route" 
import router from "../routes/userRoutes"

class Route {
 async creatRoute(RouteData){
   
    const existentRoute = await Route.findOne({

        routerNumber:RouteData.routerNumber
     

    });
    if (existentRoute) {
        throw new Error("rout with this registrion number aready exists");
    }

    const route = await Route.creat(RouteData);
    return route

 }


 async getRouteID(RouteID) {

const Route = await Route.findbyId(RouteID);

if (!Route) {
    throw new Error("Route not found");

}
return Route;

 }

 async getAllRoute(filter={},options={}){

    const { page =1 ,limit=10, sort='-createAt'}= options ;

    const skip = (page-1)*limit;

    const Route = await router.find(filters)
    .sort(sort)
    .skip(skip)
    .limit(limit)
    const total = await Route.countDocuments (filters);

    return {
        truck,
        total,
        page,
        page : Math.ceil(total/limit)
    }

 }


 async getRouteByStatus(status){
const Route = await Route.find({status})
return Route;
}



 async updateRoute(routeId,updateStatus){
const Route = await route.findbyIdandUpadte(
    routeId,
    updateStatus,
{new :true, runvalidators: true}
);
if (!Route) 
    {
    throw new Error("route not found ");
    }
}


async DeleteRoute(routeId){

    const Route = await router.findbyId(routeId)
if (!Route) {
    throw new Error("route not fonde");
}
return Route;

}
























}