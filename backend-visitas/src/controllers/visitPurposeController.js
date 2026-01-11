import { Op } from 'sequelize';
import VisitPurpose from '../models/VisitPurpose.js';

// POST /visit-purposes - Crear motivo de visita
export const createVisitPurpose = async (req, res) => {
  try {
    const { name, description, isActive } = req.body;

    // Validación
    if (!name) {
      return res.status(400).json({
        message: 'El nombre del motivo de visita es requerido'
      });
    }

    // Verificar que no exista un motivo con el mismo nombre
    const existingPurpose = await VisitPurpose.findOne({
      where: { name: { [Op.iLike]: name } }
    });

    if (existingPurpose) {
      return res.status(400).json({
        message: 'Ya existe un motivo de visita con ese nombre'
      });
    }

    const visitPurpose = await VisitPurpose.create({
      name,
      description,
      isActive: isActive !== undefined ? isActive : true
    });

    res.status(201).json({
      message: 'Motivo de visita creado exitosamente',
      visitPurpose
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error al crear el motivo de visita',
      error: error.message
    });
  }
};

// GET /visit-purposes - Listar todos los motivos de visita
export const getAllVisitPurposes = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      isActive,
      sortBy = 'name',
      sortOrder = 'ASC'
    } = req.query;

    const offset = (page - 1) * limit;
    const whereClause = {};

    // Filtro por búsqueda
    if (search) {
      whereClause[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } }
      ];
    }

    // Filtro por estado activo
    if (isActive !== undefined) {
      whereClause.isActive = isActive === 'true';
    }

    const { count, rows } = await VisitPurpose.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [[sortBy, sortOrder]]
    });

    res.json({
      visitPurposes: rows,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error al obtener los motivos de visita',
      error: error.message
    });
  }
};

// GET /visit-purposes/active - Listar solo motivos activos (sin paginación)
export const getActiveVisitPurposes = async (req, res) => {
  try {
    const visitPurposes = await VisitPurpose.findAll({
      where: { isActive: true },
      order: [['name', 'ASC']],
      attributes: ['id', 'name', 'description']
    });

    res.json(visitPurposes);
  } catch (error) {
    res.status(500).json({
      message: 'Error al obtener los motivos de visita activos',
      error: error.message
    });
  }
};

// GET /visit-purposes/:id - Obtener un motivo de visita por ID
export const getVisitPurposeById = async (req, res) => {
  try {
    const { id } = req.params;

    const visitPurpose = await VisitPurpose.findByPk(id);

    if (!visitPurpose) {
      return res.status(404).json({ message: 'Motivo de visita no encontrado' });
    }

    res.json(visitPurpose);
  } catch (error) {
    res.status(500).json({
      message: 'Error al obtener el motivo de visita',
      error: error.message
    });
  }
};

// PUT /visit-purposes/:id - Actualizar motivo de visita
export const updateVisitPurpose = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, isActive } = req.body;

    const visitPurpose = await VisitPurpose.findByPk(id);

    if (!visitPurpose) {
      return res.status(404).json({ message: 'Motivo de visita no encontrado' });
    }

    // Si se está actualizando el nombre, verificar que no exista otro con ese nombre
    if (name && name !== visitPurpose.name) {
      const existingPurpose = await VisitPurpose.findOne({
        where: {
          name: { [Op.iLike]: name },
          id: { [Op.ne]: id }
        }
      });

      if (existingPurpose) {
        return res.status(400).json({
          message: 'Ya existe otro motivo de visita con ese nombre'
        });
      }
    }

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (isActive !== undefined) updateData.isActive = isActive;

    await visitPurpose.update(updateData);

    res.json({
      message: 'Motivo de visita actualizado exitosamente',
      visitPurpose
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error al actualizar el motivo de visita',
      error: error.message
    });
  }
};

// DELETE /visit-purposes/:id - Eliminar motivo de visita (desactivar)
export const deleteVisitPurpose = async (req, res) => {
  try {
    const { id } = req.params;
    const { hardDelete = false } = req.query;

    const visitPurpose = await VisitPurpose.findByPk(id);

    if (!visitPurpose) {
      return res.status(404).json({ message: 'Motivo de visita no encontrado' });
    }

    if (hardDelete === 'true') {
      // Eliminación física
      await visitPurpose.destroy();
      res.json({ message: 'Motivo de visita eliminado permanentemente' });
    } else {
      // Eliminación lógica (desactivar)
      await visitPurpose.update({ isActive: false });
      res.json({ message: 'Motivo de visita desactivado exitosamente' });
    }
  } catch (error) {
    res.status(500).json({
      message: 'Error al eliminar el motivo de visita',
      error: error.message
    });
  }
};

// PATCH /visit-purposes/:id/toggle - Activar/Desactivar motivo de visita
export const toggleVisitPurposeStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const visitPurpose = await VisitPurpose.findByPk(id);

    if (!visitPurpose) {
      return res.status(404).json({ message: 'Motivo de visita no encontrado' });
    }

    await visitPurpose.update({ isActive: !visitPurpose.isActive });

    res.json({
      message: `Motivo de visita ${visitPurpose.isActive ? 'activado' : 'desactivado'} exitosamente`,
      visitPurpose
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error al cambiar el estado del motivo de visita',
      error: error.message
    });
  }
};