/**
 * ============================================
 * PRESALE ROUTES
 * ============================================
 * Rutas HTTP para el módulo de Preventas
 */

import { Router } from 'express';
import { PresaleController } from './PresaleController';

const router = Router();

/**
 * @route   POST /presales
 * @desc    Crear nueva preventa
 * @access  Private (Prevendedor)
 */
router.post('/', PresaleController.create);

/**
 * @route   GET /presales
 * @desc    Listar preventas con filtros
 * @access  Private
 */
router.get('/', PresaleController.getAll);

/**
 * @route   GET /presales/:id
 * @desc    Obtener preventa por ID
 * @access  Private
 */
router.get('/:id', PresaleController.getById);

/**
 * @route   GET /presales/:id/history
 * @desc    Obtener historial de estados
 * @access  Private
 */
router.get('/:id/history', PresaleController.getHistory);

/**
 * @route   PATCH /presales/:id/assign
 * @desc    Asignar distribuidor
 * @access  Private (Admin)
 */
router.patch('/:id/assign', PresaleController.assign);

/**
 * @route   PATCH /presales/:id/start-delivery
 * @desc    Iniciar entrega
 * @access  Private (Distribuidor)
 */
router.patch('/:id/start-delivery', PresaleController.startDelivery);

/**
 * @route   PATCH /presales/:id/deliver
 * @desc    Confirmar entrega
 * @access  Private (Distribuidor)
 */
router.patch('/:id/deliver', PresaleController.confirmDelivery);

/**
 * @route   PATCH /presales/:id/cancel
 * @desc    Cancelar preventa
 * @access  Private
 */
router.patch('/:id/cancel', PresaleController.cancel);

/**
 * @route   DELETE /presales/:id
 * @desc    Eliminar preventa (soft delete)
 * @access  Private (Admin)
 */
router.delete('/:id', PresaleController.delete);

export default router;
