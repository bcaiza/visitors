import { Op } from 'sequelize';
import Department from '../models/Department.js';

// POST /departments - Crear departamento
export const createDepartment = async (req, res) => {
  try {
    const { name, description, isActive } = req.body;

    // Validación
    if (!name) {
      return res.status(400).json({
        message: 'El nombre del departamento es requerido'
      });
    }

    // Verificar que no exista un departamento con el mismo nombre
    const existingDepartment = await Department.findOne({
      where: { name: { [Op.iLike]: name } }
    });

    if (existingDepartment) {
      return res.status(400).json({
        message: 'Ya existe un departamento con ese nombre'
      });
    }

    const department = await Department.create({
      name,
      description,
      isActive: isActive !== undefined ? isActive : true
    });

    res.status(201).json({
      message: 'Departamento creado exitosamente',
      department
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error al crear el departamento',
      error: error.message
    });
  }
};

// GET /departments - Listar todos los departamentos
export const getAllDepartments = async (req, res) => {
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

    const { count, rows } = await Department.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [[sortBy, sortOrder]]
    });

    res.json({
      departments: rows,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error al obtener los departamentos',
      error: error.message
    });
  }
};

// GET /departments/active - Listar solo departamentos activos (sin paginación)
export const getActiveDepartments = async (req, res) => {
  try {
    const departments = await Department.findAll({
      where: { isActive: true },
      order: [['name', 'ASC']],
      attributes: ['id', 'name', 'description']
    });

    res.json(departments);
  } catch (error) {
    res.status(500).json({
      message: 'Error al obtener los departamentos activos',
      error: error.message
    });
  }
};

// GET /departments/:id - Obtener un departamento por ID
export const getDepartmentById = async (req, res) => {
  try {
    const { id } = req.params;

    const department = await Department.findByPk(id);

    if (!department) {
      return res.status(404).json({ message: 'Departamento no encontrado' });
    }

    res.json(department);
  } catch (error) {
    res.status(500).json({
      message: 'Error al obtener el departamento',
      error: error.message
    });
  }
};

// PUT /departments/:id - Actualizar departamento
export const updateDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, isActive } = req.body;

    const department = await Department.findByPk(id);

    if (!department) {
      return res.status(404).json({ message: 'Departamento no encontrado' });
    }

    // Si se está actualizando el nombre, verificar que no exista otro con ese nombre
    if (name && name !== department.name) {
      const existingDepartment = await Department.findOne({
        where: {
          name: { [Op.iLike]: name },
          id: { [Op.ne]: id }
        }
      });

      if (existingDepartment) {
        return res.status(400).json({
          message: 'Ya existe otro departamento con ese nombre'
        });
      }
    }

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (isActive !== undefined) updateData.isActive = isActive;

    await department.update(updateData);

    res.json({
      message: 'Departamento actualizado exitosamente',
      department
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error al actualizar el departamento',
      error: error.message
    });
  }
};

// DELETE /departments/:id - Eliminar departamento (desactivar)
export const deleteDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    const { hardDelete = false } = req.query;

    const department = await Department.findByPk(id);

    if (!department) {
      return res.status(404).json({ message: 'Departamento no encontrado' });
    }

    if (hardDelete === 'true') {
      // Eliminación física
      await department.destroy();
      res.json({ message: 'Departamento eliminado permanentemente' });
    } else {
      // Eliminación lógica (desactivar)
      await department.update({ isActive: false });
      res.json({ message: 'Departamento desactivado exitosamente' });
    }
  } catch (error) {
    res.status(500).json({
      message: 'Error al eliminar el departamento',
      error: error.message
    });
  }
};

// PATCH /departments/:id/toggle - Activar/Desactivar departamento
export const toggleDepartmentStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const department = await Department.findByPk(id);

    if (!department) {
      return res.status(404).json({ message: 'Departamento no encontrado' });
    }

    await department.update({ isActive: !department.isActive });

    res.json({
      message: `Departamento ${department.isActive ? 'activado' : 'desactivado'} exitosamente`,
      department
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error al cambiar el estado del departamento',
      error: error.message
    });
  }
};