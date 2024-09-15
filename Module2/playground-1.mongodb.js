



use('DB_uno');




db.Plant.updateOne(
  { "name": "Sunflower" }, 
  { $set: { "plant": "no" } }
);

db.Plant.updateOne(
  { "name": "Rose" },
  { $set: { "color": "blue" } }
);

db.Plant.updateOne(
  { "name": "Tulip" },
  { $set: { "name": "Tul" } }
);

db.Plant.find({});
db.Plant.find({ "name": "Tul" });
db.Plant.find({ "name": "Tulip" });
db.Plant.find({ "name": "Rose" });
db.Plant.find({ "name": "Sunflower" });
