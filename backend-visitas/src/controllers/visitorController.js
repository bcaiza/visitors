import { Op } from 'sequelize';
import Visitor from '../models/Visitor.js';
import Entry from '../models/Entry.js';
import fs from 'fs';

export const getAllVisitors = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      firstName,
      lastName,
      idType,
      idNumber,
      email,
      phone,
      company,
      sortBy = 'createdAt',
      sortOrder = 'DESC'
    } = req.query;

    const offset = (page - 1) * limit;
    const whereClause = {};

    // Global search across multiple fields
    if (search) {
      whereClause[Op.or] = [
        { firstName: { [Op.iLike]: `%${search}%` } },
        { lastName: { [Op.iLike]: `%${search}%` } },
        { idNumber: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } },
        { company: { [Op.iLike]: `%${search}%` } },
        { phone: { [Op.iLike]: `%${search}%` } }
      ];
    }

    // Specific field searches
    if (firstName) {
      whereClause.firstName = { [Op.iLike]: `%${firstName}%` };
    }
    if (lastName) {
      whereClause.lastName = { [Op.iLike]: `%${lastName}%` };
    }
    if (idType) {
      whereClause.idType = idType;
    }
    if (idNumber) {
      whereClause.idNumber = { [Op.iLike]: `%${idNumber}%` };
    }
    if (email) {
      whereClause.email = { [Op.iLike]: `%${email}%` };
    }
    if (phone) {
      whereClause.phone = { [Op.iLike]: `%${phone}%` };
    }
    if (company) {
      whereClause.company = { [Op.iLike]: `%${company}%` };
    }

    const { count, rows } = await Visitor.findAndCountAll({
      where: whereClause,
      include: [{
        model: Entry,
        as: 'entries',
        limit: 3,
        order: [['checkInTime', 'DESC']],
        separate: true
      }],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [[sortBy, sortOrder]],
      distinct: true
    });

    res.json({
      visitors: rows,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: 'Error al obtener visitantes',
      error: error.message
    });
  }
};

export const getVisitorById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const visitor = await Visitor.findByPk(id, {
      include: [{
        model: Entry,
        as: 'entries',
        order: [['checkInTime', 'DESC']]
      }]
    });

    if (!visitor) {
      return res.status(404).json({ message: 'Visitante no encontrado' });
    }

    res.json(visitor);
  } catch (error) {
    res.status(500).json({
      message: 'Error al obtener el visitante',
      error: error.message
    });
  }
};

export const getVisitorByIdNumber = async (req, res) => {
  try {
    const { idNumber } = req.params;
    
    const visitor = await Visitor.findOne({
      where: { idNumber },
      include: [{
        model: Entry,
        as: 'entries',
        order: [['checkInTime', 'DESC']]
      }]
    });

    if (!visitor) {
      return res.status(404).json({ message: 'Visitante no encontrado' });
    }

    res.json(visitor);
  } catch (error) {
    res.status(500).json({
      message: 'Error al obtener el visitante',
      error: error.message
    });
  }
};

export const createVisitor = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      idType,
      idNumber,
      email,
      phone,
      company,
      address,
      notes
    } = req.body;

    if (!firstName || !lastName || !idType || !idNumber) {
      return res.status(400).json({
        message: 'Nombre, apellido, tipo de ID y número de ID son requeridos'
      });
    }

    // Validate email if provided
    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ message: 'Formato de email inválido' });
      }
    }

    // Check if visitor already exists
    const existingVisitor = await Visitor.findOne({ where: { idNumber } });
    if (existingVisitor) {
      return res.status(400).json({
        message: 'Ya existe un visitante con este número de identificación'
      });
    }

    const photoPath = req.files?.photo ? req.files.photo[0].path : null;
    const idDocumentPath = req.files?.idDocument ? req.files.idDocument[0].path : null;

    const visitor = await Visitor.create({
      firstName,
      lastName,
      idType,
      idNumber,
      email,
      phone,
      company,
      address,
      notes,
      photoPath,
      idDocumentPath
    });

    res.status(201).json(visitor);
  } catch (error) {
    res.status(500).json({
      message: 'Error al crear el visitante',
      error: error.message
    });
  }
};

export const updateVisitor = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      firstName,
      lastName,
      idType,
      idNumber,
      email,
      phone,
      company,
      address,
      notes
    } = req.body;

    const visitor = await Visitor.findByPk(id);
    if (!visitor) {
      return res.status(404).json({ message: 'Visitante no encontrado' });
    }

    // Validate email if provided
    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ message: 'Formato de email inválido' });
      }
    }

    // Check if ID number is being changed and if it already exists
    if (idNumber && idNumber !== visitor.idNumber) {
      const existingVisitor = await Visitor.findOne({ where: { idNumber } });
      if (existingVisitor) {
        return res.status(400).json({
          message: 'Ya existe un visitante con este número de identificación'
        });
      }
    }

    const updateData = {
      firstName: firstName || visitor.firstName,
      lastName: lastName || visitor.lastName,
      idType: idType || visitor.idType,
      idNumber: idNumber || visitor.idNumber,
      email: email !== undefined ? email : visitor.email,
      phone: phone !== undefined ? phone : visitor.phone,
      company: company !== undefined ? company : visitor.company,
      address: address !== undefined ? address : visitor.address,
      notes: notes !== undefined ? notes : visitor.notes
    };

    // Handle file uploads
    if (req.files?.photo) {
      // Delete old photo if exists
      if (visitor.photoPath && fs.existsSync(visitor.photoPath)) {
        fs.unlinkSync(visitor.photoPath);
      }
      updateData.photoPath = req.files.photo[0].path;
    }

    if (req.files?.idDocument) {
      // Delete old document if exists
      if (visitor.idDocumentPath && fs.existsSync(visitor.idDocumentPath)) {
        fs.unlinkSync(visitor.idDocumentPath);
      }
      updateData.idDocumentPath = req.files.idDocument[0].path;
    }

    await visitor.update(updateData);

    const updatedVisitor = await Visitor.findByPk(id, {
      include: [{
        model: Entry,
        as: 'entries',
        limit: 5,
        order: [['checkInTime', 'DESC']]
      }]
    });

    res.json(updatedVisitor);
  } catch (error) {
    res.status(500).json({
      message: 'Error al actualizar el visitante',
      error: error.message
    });
  }
};

export const deleteVisitor = async (req, res) => {
  try {
    const { id } = req.params;

    const visitor = await Visitor.findByPk(id);
    if (!visitor) {
      return res.status(404).json({ message: 'Visitante no encontrado' });
    }

    // Delete files if they exist
    if (visitor.photoPath && fs.existsSync(visitor.photoPath)) {
      fs.unlinkSync(visitor.photoPath);
    }
    if (visitor.idDocumentPath && fs.existsSync(visitor.idDocumentPath)) {
      fs.unlinkSync(visitor.idDocumentPath);
    }

    await visitor.destroy();

    res.json({ message: 'Visitante eliminado exitosamente' });
  } catch (error) {
    res.status(500).json({
      message: 'Error al eliminar el visitante',
      error: error.message
    });
  }
};

export const deleteVisitorFile = async (req, res) => {
  try {
    const { id, fileType } = req.params;

    const visitor = await Visitor.findByPk(id);
    if (!visitor) {
      return res.status(404).json({ message: 'Visitante no encontrado' });
    }

    if (fileType !== 'photo' && fileType !== 'idDocument') {
      return res.status(400).json({ message: 'Tipo de archivo inválido' });
    }

    const fileField = fileType === 'photo' ? 'photoPath' : 'idDocumentPath';
    const filePath = visitor[fileField];

    if (!filePath) {
      return res.status(404).json({ message: 'Archivo no encontrado' });
    }

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await visitor.update({ [fileField]: null });

    res.json({ message: 'Archivo eliminado exitosamente' });
  } catch (error) {
    res.status(500).json({
      message: 'Error al eliminar el archivo',
      error: error.message
    });
  }
};

export const searchVisitors = async (req, res) => {
  try {
    const { search } = req.query;

    if (!search) {
      return res.status(400).json({ message: 'Parámetro de búsqueda requerido' });
    }

    const visitors = await Visitor.findAll({
      where: {
        [Op.or]: [
          { firstName: { [Op.iLike]: `%${search}%` } },
          { lastName: { [Op.iLike]: `%${search}%` } },
          { idNumber: { [Op.iLike]: `%${search}%` } },
          { email: { [Op.iLike]: `%${search}%` } },
          { company: { [Op.iLike]: `%${search}%` } }
        ]
      },
      include: [{
        model: Entry,
        as: 'entries',
        limit: 3,
        order: [['checkInTime', 'DESC']]
      }],
      order: [['lastName', 'ASC']]
    });

    res.json(visitors);
  } catch (error) {
    res.status(500).json({
      message: 'Error al buscar visitantes',
      error: error.message
    });
  }
};
