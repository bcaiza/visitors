import sequelize from '../config/database.js';  
import User from './User.js';
import Role from './Role.js';
import Permission from './Permission.js';
import Visitor from './Visitor.js';
import Entry from './Entry.js';
import Department from './Department.js';
import VisitPurpose from './VisitPurpose.js'; 

const models = {
  sequelize,     
  User,
  Role,
  Permission,
  Visitor,
  Entry,
  Department,      
  VisitPurpose,    
};

if (User.associate) User.associate(models);
if (Role.associate) Role.associate(models);
if (Permission.associate) Permission.associate(models);
if (Visitor.associate) Visitor.associate(models);
if (Entry.associate) Entry.associate(models);
if (Department.associate) Department.associate(models);        
if (VisitPurpose.associate) VisitPurpose.associate(models);   

export default models;