import { Router } from 'express';
import authRoutes from './auth.routes.js';

import connection from './connection.routes.js'
// import deviceRoutes from './device.routes.js';
// import trackingRoutes from './tracking.routes.js';
// import geofenceRoutes from './geofence.routes.js';

const router = Router();
router.use('/auth/v1', authRoutes);
router.use('/connection/v1', connection);

// router.use('/device', deviceRoutes);
// router.use('/tracking', trackingRoutes);
// router.use('/geofence', geofenceRoutes);

export default router;
//   # combines all routes
