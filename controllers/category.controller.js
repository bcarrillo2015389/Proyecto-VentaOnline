'use strict'
var Category = require('../models/category.model');

function saveCategory(req, res){
    var category = new Category();
    var params = req.body;

    if(params.name){
        Category.findOne({name:params.name},(err, categoryFind)=>{
            if(err){
                res.status(500).send({message:'Error general, intentelo mas tarde.'});
            }else if(categoryFind){
                res.send({message:'El nombre de categoria ya ha sido utilizado.'});
            }else{
                category.name = params.name;

                category.save((err, categorySaved)=>{
                    if(err){
                        res.status(500).send({message:'Error general al guardar.'});
                    }else if(categorySaved){
                        res.send({message:'Categoria creada.', category: categorySaved});
                    }else{
                        res.status(404).send({message:'Categoria no guardada.'});
                    }
                });
            }
        });
    }else{
        res.send({message:'Ingresa el campo de nombre de categoria.'});
    }
}

function updateCategory(req, res){
    var idCategory = req.params.id;
    var update = req.body;

    Category.findOne({'_id':idCategory, name:'default'}, (err, categoryFind)=>{
        if(err){
            res
        }else if(categoryFind){
            res.send({message:'No puede actualizar la categoria default.'});
        }else{
        Category.findOne({'_id':idCategory}, (err, catFind)=>{
            if(err){
                res.status(500).send({message:'Error general'});
            }else if(catFind){
                    var findName;

                    if(!update.name){
                        findName = '';
                    }else if(update.name){
                        if(update.name == catFind.name){
                            findName = '';
                        }else if(update.name == 'default'){
                            return res.send({message:'No puede utilizar default como name.'});
                        }else{
                            findName = update.name;
                        }
                    }

                    if(update.products){
                        return res.send({message:'No puede actualizar los productos de la categoria.'});
                    }

                    Category.findOne({$or:[{'name':findName}]},(err, catOk)=>{
                        if(err){
                            res.status(500).send({message:'Error general, intentelo mas tarde.'});
                        }else if(catOk){
                            res.send({message:'Nombre de categoria ya utilizado.'});
                        }else{
                            Category.findByIdAndUpdate(idCategory, update, {new:true}, (err, categoryUpdated)=>{
                                if(err){
                                    res.status(500).send({message:'Error general'});
                                }else if(categoryUpdated){
                                    res.send({message:'Categoria actualizada', category: categoryUpdated});
                                }else{
                                    res.status(404).send({message: 'No se actualizo.'});
                                }
                            });
                        }
                    });
            }else{
                res.status(404).send({message:'Categoria inexistente.'});
            }
        });
        }
    });
}

function listCategories(req, res){
    Category.find({}, (err, categories)=>{
        if(err){
            res.status(500).send({message: 'Error general'});
        }else if(categories){
            if(categories.length>0){
                res.send({categories:categories});
            }else{
                res.send({message:'No se encontraron categorias.'});
            }
        }else{
            res.status(404).send({message: 'No se encontraron productos.'});
        }
	}).populate('products');
}

function listCategoriesNames(req, res){

    Category.find({}, (err, categories)=>{
        if(err){
            res.status(500).send({message: 'Error general'});
        }else if(categories){
            var catalog=[];
                categories.forEach(element => {
    
                    var newElement = {
                        name:element.name
                    }
                    catalog.push(newElement);
                });
                if(catalog.length>0){
                    res.send({message:'categorias',
                    'categories': catalog});
                }else{
                    res.send({message:'No existen categorias.'});
                }
        }else{
            res.status(404).send({message: 'No se encontraron productos.'});
        }
    });
}

function removeCategory(req, res){
    var id = req.params.id;

    Category.findOne({'_id':id, name:'default'}, (err, categoryFind)=>{
        if(err){
            res
        }else if(categoryFind){
            res.send({message:'No puede eliminar la categoria default.'});
        }else{
                Category.findByIdAndRemove(id, (err, catRemoved)=>{
                    if(err){
                        res.status(500).send({message: 'Error general'});
                    }else if(catRemoved){
            
                        Category.findOneAndUpdate({name:'default'}, {$push:{products:catRemoved.products}},{new:true},(err, categoryFind)=>{
                            if(err){
                                res.status(500).send({message: 'Error general'});
                            }else if(categoryFind){
                                res.send({message:'Categoria eliminada.', category:catRemoved});
                            }else{
                                res.status(404).send({message: 'No se elimino de la BD.'});
                            }
                        });
                    }else{
                        res.status(404).send({message: 'Categoria inexistente.'});  
                    }
                });
        }
    });
}

module.exports = {
    saveCategory,
    listCategories,
    updateCategory,
    removeCategory,
    listCategoriesNames
}