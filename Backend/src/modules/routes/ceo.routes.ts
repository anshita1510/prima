import { Router } from 'express';
import { CeoController } from '../controller/ceo/ceo.controller';
import { authenticateToken, authorize } from '../../middlewares/auth.middleware';
import { Role } from '@prisma/client';

const router = Router();
const ceoController = new CeoController();

/**
 * @swagger
 * /api/ceos:
 *   post:
 *     summary: Create a new CEO for a company
 *     tags: [CEOs]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - firstName
 *               - lastName
 *               - email
 *               - phoneNumber
 *               - companyId
 *               - password
 *     responses:
 *       201:
 *         description: CEO created successfully
 *       400:
 *         description: Invalid input
 */
router.post('/', authenticateToken, authorize(Role.SUPER_ADMIN), (req, res) => ceoController.createCeo(req, res));


router.get('/', authenticateToken, authorize(Role.SUPER_ADMIN), (req, res) => ceoController.getAllCeos(req, res));
router.get('/:id', authenticateToken, authorize(Role.SUPER_ADMIN), (req, res) => ceoController.getCeoById(req, res));
router.delete('/:id', authenticateToken, authorize(Role.SUPER_ADMIN), (req, res) => ceoController.deleteCeo(req, res));

export default router;
