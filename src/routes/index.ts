import { Router } from 'express';
import authRoutes from './auth.routes.js';
// import linkRoutes from './link.routes.js';
// import deviceRoutes from './device.routes.js';
// import trackingRoutes from './tracking.routes.js';
// import geofenceRoutes from './geofence.routes.js';

const router = Router();
router.use('/auth/v1', authRoutes);
// router.use('/link', linkRoutes);
// router.use('/device', deviceRoutes);
// router.use('/tracking', trackingRoutes);
// router.use('/geofence', geofenceRoutes);
console.log('amitkumar', 'authroute');
export default router;
//   # combines all routes
