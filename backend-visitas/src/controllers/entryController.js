import { Op } from 'sequelize';
import Entry from '../models/Entry.js';
import Visitor from '../models/Visitor.js';
import e from 'express';

// POST /entries - Registrar entrada (check-in)
export const checkIn = async (req, res) => {
  try {
    const {
      visitor_id,
      purpose,
      hostName,
      hostDepartment,
      badge,
      vehiclePlate,
      temperature,
      entryNotes,
      checkedInBy
    } = req.body;

    // Validación de campos requeridos
    if (!visitor_id) {
      return res.status(400).json({
        message: 'El ID del visitante es requerido'
      });
    }

    // Verificar que el visitante existe
    const visitor = await Visitor.findByPk(visitor_id);
    if (!visitor) {
      return res.status(404).json({ message: 'Visitante no encontrado' });
    }

    // Verificar si ya tiene una entrada activa
    const activeEntry = await Entry.findOne({
      where: {
        visitor_id,
        status: 'active'
      }
    });

    if (activeEntry) {
      return res.status(400).json({
        message: 'El visitante ya tiene una entrada activa',
        activeEntry
      });
    }

    const entry = await Entry.create({
      visitor_id,
      purpose,
      hostName,
      hostDepartment,
      badge,
      vehiclePlate,
      temperature,
      entryNotes,
      checkedInBy,
      checkInTime: new Date(),
      status: 'active'
    });

    // Obtener la entrada con la información del visitante
    const entryWithVisitor = await Entry.findByPk(entry.id, {
      include: [{
        model: Visitor,
        as: 'visitor',
        attributes: ['id', 'firstName', 'lastName', 'idNumber', 'company', 'photoPath']
      }]
    });

    res.status(201).json(entryWithVisitor);
  } catch (error) {
    res.status(500).json({
      message: 'Error al registrar la entrada',
      error: error.message
    });
  }
};

// PATCH /entries/:id/checkout - Registrar salida (check-out)
export const checkOut = async (req, res) => {
  try {
    const { id } = req.params;
    const { exitNotes, checkedOutBy } = req.body;

    const entry = await Entry.findByPk(id, {
      include: [{
        model: Visitor,
        as: 'visitor'
      }]
    });

    if (!entry) {
      return res.status(404).json({ message: 'Entrada no encontrada' });
    }

    if (entry.status !== 'active') {
      return res.status(400).json({
        message: `Esta entrada ya fue procesada. Estado actual: ${entry.status}`
      });
    }

    await entry.update({
      checkOutTime: new Date(),
      exitNotes,
      checkedOutBy,
      status: 'completed'
    });

    const updatedEntry = await Entry.findByPk(id, {
      include: [{
        model: Visitor,
        as: 'visitor'
      }]
    });

    res.json({
      message: 'Salida registrada exitosamente',
      entry: updatedEntry
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error al registrar la salida',
      error: error.message
    });
  }
};

// GET /entries - Listar todas las entradas con filtros
export const getAllEntries = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      visitor_id,
      date,
      startDate,
      endDate,
      hostName,
      hostDepartment,
      badge,
      search,
      sortBy = 'checkInTime',
      sortOrder = 'DESC'
    } = req.query;

    const offset = (page - 1) * limit;
    const whereClause = {};

    // Filtro por estado
    if (status) {
      whereClause.status = status;
    }

    // Filtro por visitante
    if (visitor_id) {
      whereClause.visitor_id = visitor_id;
    }

    // Filtro por anfitrión
    if (hostName) {
      whereClause.hostName = { [Op.iLike]: `%${hostName}%` };
    }

    if (hostDepartment) {
      whereClause.hostDepartment = { [Op.iLike]: `%${hostDepartment}%` };
    }

    // Filtro por gafete
    if (badge) {
      whereClause.badge = { [Op.iLike]: `%${badge}%` };
    }


    // Filtro por fecha específica
    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      whereClause.checkInTime = {
        [Op.between]: [startOfDay, endOfDay]
      };
    }

    // Filtro por rango de fechas
    if (startDate && endDate) {
      whereClause.checkInTime = {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      };
    } else if (startDate) {
      whereClause.checkInTime = {
        [Op.gte]: new Date(startDate)
      };
    } else if (endDate) {
      whereClause.checkInTime = {
        [Op.lte]: new Date(endDate)
      };
    }

    // Búsqueda global
    const includeClause = {
      model: Visitor,
      as: 'visitor',
      attributes: ['id', 'firstName', 'lastName', 'idNumber', 'company', 'photoPath']
    };

    if (search) {
      includeClause.where = {
        [Op.or]: [
          { firstName: { [Op.iLike]: `%${search}%` } },
          { lastName: { [Op.iLike]: `%${search}%` } },
          { idNumber: { [Op.iLike]: `%${search}%` } },
          { company: { [Op.iLike]: `%${search}%` } }
        ]
      };
    }

    const { count, rows } = await Entry.findAndCountAll({
      where: whereClause,
      include: [includeClause],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [[sortBy, sortOrder]],
      distinct: true
    });

    res.json({
      entries: rows,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.log("Error ", error)
    res.status(500).json({
      message: 'Error al obtener las entradas',
      error: error.message
    });
  }
};

// GET /entries/active - Obtener visitantes actualmente en las instalaciones
export const getActiveVisitors = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 50,
      sortBy = 'checkInTime',
      sortOrder = 'DESC'
    } = req.query;

    const offset = (page - 1) * limit;

    const { count, rows } = await Entry.findAndCountAll({
      where: { status: 'active' },
      include: [{
        model: Visitor,
        as: 'visitor'
      }],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [[sortBy, sortOrder]],
      distinct: true
    });

    res.json({
      activeVisitors: rows,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error al obtener visitantes activos',
      error: error.message
    });
  }
};

// GET /entries/:id - Obtener una entrada específica por ID
export const getEntryById = async (req, res) => {
  try {
    const { id } = req.params;

    const entry = await Entry.findByPk(id, {
      include: [{
        model: Visitor,
        as: 'visitor'
      }]
    });

    if (!entry) {
      return res.status(404).json({ message: 'Entrada no encontrada' });
    }

    res.json(entry);
  } catch (error) {
    res.status(500).json({
      message: 'Error al obtener la entrada',
      error: error.message
    });
  }
};

// PATCH /entries/:id/cancel - Cancelar una entrada
export const cancelEntry = async (req, res) => {
  try {
    const { id } = req.params;
    const { cancelReason, cancelledBy } = req.body;

    const entry = await Entry.findByPk(id);

    if (!entry) {
      return res.status(404).json({ message: 'Entrada no encontrada' });
    }

    if (entry.status !== 'active') {
      return res.status(400).json({
        message: `No se puede cancelar. Estado actual: ${entry.status}`
      });
    }

    await entry.update({
      status: 'cancelled',
      exitNotes: cancelReason,
      checkedOutBy: cancelledBy,
      checkOutTime: new Date()
    });

    const updatedEntry = await Entry.findByPk(id, {
      include: [{
        model: Visitor,
        as: 'visitor'
      }]
    });

    res.json({
      message: 'Entrada cancelada exitosamente',
      entry: updatedEntry
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error al cancelar la entrada',
      error: error.message
    });
  }
};

// GET /entries/visitor/:visitor_id - Obtener historial de entradas de un visitante
export const getVisitorEntries = async (req, res) => {
  try {
    const { visitor_id } = req.params;
    const {
      page = 1,
      limit = 10,
      status,
      sortBy = 'checkInTime',
      sortOrder = 'DESC'
    } = req.query;

    const offset = (page - 1) * limit;
    const whereClause = { visitor_id };

    if (status) {
      whereClause.status = status;
    }

    const { count, rows } = await Entry.findAndCountAll({
      where: whereClause,
      include: [{
        model: Visitor,
        as: 'visitor'
      }],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [[sortBy, sortOrder]],
      distinct: true
    });

    res.json({
      entries: rows,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error al obtener el historial del visitante',
      error: error.message
    });
  }
};

// GET /entries/stats - Obtener estadísticas de entradas
export const getEntryStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const whereClause = {};

    if (startDate && endDate) {
      whereClause.checkInTime = {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      };
    }

    const [totalEntries, activeEntries, completedEntries, cancelledEntries] = await Promise.all([
      Entry.count({ where: whereClause }),
      Entry.count({ where: { ...whereClause, status: 'active' } }),
      Entry.count({ where: { ...whereClause, status: 'completed' } }),
      Entry.count({ where: { ...whereClause, status: 'cancelled' } })
    ]);

    // Calcular tiempo promedio de permanencia (solo entradas completadas)
    const completedEntriesWithTime = await Entry.findAll({
      where: {
        ...whereClause,
        status: 'completed',
        checkOutTime: { [Op.ne]: null }
      },
      attributes: ['checkInTime', 'checkOutTime']
    });

    let averageStayMinutes = 0;
    if (completedEntriesWithTime.length > 0) {
      const totalMinutes = completedEntriesWithTime.reduce((sum, entry) => {
        const duration = (new Date(entry.checkOutTime) - new Date(entry.checkInTime)) / 1000 / 60;
        return sum + duration;
      }, 0);
      averageStayMinutes = Math.round(totalMinutes / completedEntriesWithTime.length);
    }

    res.json({
      totalEntries,
      activeEntries,
      completedEntries,
      cancelledEntries,
      averageStayMinutes,
      stats: {
        active: activeEntries,
        completed: completedEntries,
        cancelled: cancelledEntries
      }
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error al obtener estadísticas',
      error: error.message
    });
  }
};

// GET /entries/today - Obtener entradas del día actual
export const getTodayEntries = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 50,
      status,
      sortBy = 'checkInTime',
      sortOrder = 'DESC'
    } = req.query;

    const offset = (page - 1) * limit;
    
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const whereClause = {
      checkInTime: {
        [Op.between]: [startOfDay, endOfDay]
      }
    };

    if (status) {
      whereClause.status = status;
    }

    const { count, rows } = await Entry.findAndCountAll({
      where: whereClause,
      include: [{
        model: Visitor,
        as: 'visitor'
      }],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [[sortBy, sortOrder]],
      distinct: true
    });

    res.json({
      entries: rows,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error al obtener las entradas de hoy',
      error: error.message
    });
  }
};

// PATCH /entries/:id - Actualizar información de una entrada
export const updateEntry = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      purpose,
      hostName,
      hostDepartment,
      badge,
      vehiclePlate,
      temperature,
      entryNotes,
      exitNotes
    } = req.body;

    const entry = await Entry.findByPk(id);

    if (!entry) {
      return res.status(404).json({ message: 'Entrada no encontrada' });
    }

    const updateData = {};
    if (purpose !== undefined) updateData.purpose = purpose;
    if (hostName !== undefined) updateData.hostName = hostName;
    if (hostDepartment !== undefined) updateData.hostDepartment = hostDepartment;
    if (badge !== undefined) updateData.badge = badge;
    if (vehiclePlate !== undefined) updateData.vehiclePlate = vehiclePlate;
    if (temperature !== undefined) updateData.temperature = temperature;
    if (entryNotes !== undefined) updateData.entryNotes = entryNotes;
    if (exitNotes !== undefined) updateData.exitNotes = exitNotes;

    await entry.update(updateData);

    const updatedEntry = await Entry.findByPk(id, {
      include: [{
        model: Visitor,
        as: 'visitor'
      }]
    });

    res.json({
      message: 'Entrada actualizada exitosamente',
      entry: updatedEntry
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error al actualizar la entrada',
      error: error.message
    });
  }
};